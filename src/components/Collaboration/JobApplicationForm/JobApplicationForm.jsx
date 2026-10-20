import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useParams } from 'react-router-dom';
import styles from './JobApplicationForm.module.css';
import OneCommunityImage from '../../../assets/images/logo2.png';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import moment from 'moment-timezone';
import { isJobApplicationFileUploadQuestion } from './jobApplicationQuestionUtils';
import { checkEmail } from '../../../utils/emailValidation';
import {
  ensurePositionOption,
  findFormByPositionSlug,
  publicApplyRequestConfig,
  titleHintFromSlug,
} from './jobApplicationPublicApi';

function normalizeTitleKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Heuristic: job board title vs saved form title (spacing, punctuation, singular/plural). */
function titlesLikelyMatch(jobTitle, formTitle) {
  const a = normalizeTitleKey(jobTitle);
  const b = normalizeTitleKey(formTitle);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const stripTrailingS = x =>
    x.length > 3 && x.endsWith('s') && !x.endsWith('ss') ? x.slice(0, -1) : x;
  const sa = stripTrailingS(a);
  const sb = stripTrailingS(b);
  if (sa === sb) return true;
  if (sa.includes(sb) || sb.includes(sa)) return true;
  return false;
}

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'our',
  'your',
  'are',
  'you',
  'role',
  'a',
  'an',
  'to',
  'of',
  'in',
]);

function tokenizeTitle(s) {
  return normalizeTitleKey(s)
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

/** Match when most significant words from the job board appear in the saved form title. */
function findFormByTokenOverlap(formsArr, jobTitle) {
  const tokens = tokenizeTitle(jobTitle);
  if (!tokens.length || !formsArr?.length) return null;
  const need =
    tokens.length >= 4
      ? Math.max(2, Math.ceil(tokens.length * 0.5))
      : Math.max(1, Math.ceil(tokens.length * 0.45));

  let best = null;
  let bestOverlap = -1;
  for (const f of formsArr) {
    const nk = normalizeTitleKey(f.title || '');
    let overlap = 0;
    for (const t of tokens) {
      if (nk.includes(t)) overlap++;
    }
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = f;
    }
  }
  return bestOverlap >= need ? best : null;
}

/**
 * When both job and a form mention the same role family (e.g. "developer") and only one form fits,
 * use it so ?jobTitle= from the board still resolves without noisy toasts.
 */
function findFormByDeveloperFamily(formsArr, jobTitle) {
  const j = normalizeTitleKey(jobTitle);
  if (!j.includes('developer') && !j.includes('engineer')) return null;
  const candidates = formsArr.filter(f => {
    const t = normalizeTitleKey(f.title || '');
    return (
      (j.includes('developer') && t.includes('developer')) ||
      (j.includes('engineer') && t.includes('engineer'))
    );
  });
  if (candidates.length !== 1) return null;
  return candidates[0];
}

/**
 * Map roles like "Office Coordinator" and "Environmental Planner" to a Management/Administrative form
 * if an exact match isn't found.
 */
function findFormByManagementFamily(formsArr, jobTitle) {
  const j = normalizeTitleKey(jobTitle);
  if (
    !/\bcoordinator\b/.test(j) &&
    !/\bplanner\b/.test(j) &&
    !/\bmanager\b/.test(j) &&
    !/\bmanagement\b/.test(j) &&
    !/\badministrative\b/.test(j) &&
    !/\badmin\b/.test(j)
  ) {
    return null;
  }
  const candidates = formsArr.filter(f => {
    const t = normalizeTitleKey(f.title || '');
    return (
      /\bmanagement\b/.test(t) ||
      /\bmanager\b/.test(t) ||
      /\badministrative\b/.test(t) ||
      /\badmin\b/.test(t)
    );
  });
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const exact = candidates.find(f => {
      const t = normalizeTitleKey(f.title || '');
      return t === 'management' || t === 'manager' || t === 'job application management';
    });
    return exact || candidates[0];
  }
  return null;
}

/** Match a job listing title to a saved application form (titles may differ slightly). */
function findFormForJobTitle(formsArr, jobTitle) {
  if (!jobTitle || !formsArr?.length) return null;
  const t = String(jobTitle)
    .trim()
    .toLowerCase();
  let m = formsArr.find(f => (f.title || '').trim().toLowerCase() === t);
  if (m) return m;
  m = formsArr.find(f => {
    const ft = (f.title || '').trim().toLowerCase();
    return ft && (t.includes(ft) || ft.includes(t));
  });
  if (m) return m;
  m = formsArr.find(f => titlesLikelyMatch(jobTitle, f.title));
  if (m) return m;
  m = findFormByTokenOverlap(formsArr, jobTitle);
  if (m) return m;
  m = findFormByDeveloperFamily(formsArr, jobTitle);
  if (m) return m;
  m = findFormByManagementFamily(formsArr, jobTitle);
  return m || null;
}

/** Role clicked on the job board: React Router state, ?jobTitle=, or /apply/:positionSlug. */
function getJobTitleFromNavigation(location, positionSlug) {
  const fromState = location.state?.jobTitle;
  if (fromState != null && String(fromState).trim()) return String(fromState).trim();
  const q = new URLSearchParams(location.search || '');
  const fromQuery = q.get('jobTitle') || q.get('role');
  if (fromQuery != null && String(fromQuery).trim()) return String(fromQuery).trim();
  if (positionSlug) {
    const hint = titleHintFromSlug(positionSlug);
    if (hint) return hint;
  }
  return '';
}

function getFormIdFromNavigation(location) {
  const fromState = location.state?.formId;
  if (fromState != null && String(fromState).trim()) return String(fromState).trim();
  const q = new URLSearchParams(location.search || '');
  const fromQuery = q.get('formId');
  if (fromQuery != null && String(fromQuery).trim()) return String(fromQuery).trim();
  return '';
}

/** Skip retired / internal ATS templates when picking applicant forms. */
function isApplicantFacingForm(form) {
  const title = String(form?.title || '')
    .trim()
    .toUpperCase();
  if (!title) return false;
  if (title.startsWith('[RETIRED]')) return false;
  if (title.includes('APPLIED THROUGH SITE')) return false;
  if (title.includes('TEST CREATE FORM')) return false;
  return true;
}

/** Default questionnaire when a job listing has no dedicated form. */
function findDefaultSoftwareForm(formsArr) {
  if (!formsArr?.length) return null;
  const activeForms = formsArr.filter(isApplicantFacingForm);
  const preferredTitles = ['SEEKING SOFTWARE POSITION', 'Software Developer', 'Software Engineer'];
  for (const title of preferredTitles) {
    const exact = activeForms.find(
      f =>
        String(f.title || '')
          .trim()
          .toLowerCase() === title.toLowerCase(),
    );
    if (exact) return exact;
  }
  return (
    findFormForJobTitle(activeForms, 'SEEKING SOFTWARE POSITION') ||
    findFormForJobTitle(activeForms, 'Software Developer') ||
    findFormForJobTitle(activeForms, 'Software Engineer') ||
    activeForms.find(f => f.questions?.length) ||
    activeForms[0] ||
    null
  );
}

function pickInitialForm(formsArr, navState, positionSlug) {
  if (!formsArr?.length) return null;

  if (navState?.formId) {
    const byId = formsArr.find(f => String(f._id || f.id) === String(navState.formId));
    if (byId) return byId;
  }

  if (positionSlug) {
    const bySlug = findFormByPositionSlug(formsArr, positionSlug);
    if (bySlug) return bySlug;
  }

  if (navState?.jobTitle) {
    const matched = findFormForJobTitle(formsArr, navState.jobTitle);
    if (matched) return matched;
    // No dedicated form for this job listing — use the default software questionnaire.
    return findDefaultSoftwareForm(formsArr);
  }

  if (positionSlug) {
    return findDefaultSoftwareForm(formsArr);
  }

  return null;
}

function parseFormsResponse(res) {
  return Array.isArray(res.data.forms) ? res.data.forms : [];
}

function resolveNavigationJobTitle(jobDataFromRedirect, location, positionSlug) {
  return (
    (jobDataFromRedirect?.jobTitle && String(jobDataFromRedirect.jobTitle).trim()) ||
    getJobTitleFromNavigation(location, positionSlug)
  );
}

function notifyInitialFormSelection(navTitle, formMatch, chosen) {
  if (!navTitle || formMatch) return;
  if (chosen) {
    toast.warn(
      `No form is linked to "${navTitle}". Showing the default software engineer application ("${chosen.title}") — pick another role from the dropdown if this is not the right questionnaire.`,
      { autoClose: false, closeOnClick: false, toastId: 'job-title-mismatch-warning' },
    );
    return;
  }
  toast.warn('No application form is available. Please contact support or try again later.', {
    toastId: 'job-title-mismatch-no-form',
  });
}

/** Case-insensitive match against position dropdown options. */
function matchPositionOption(options, title) {
  const t = String(title || '').trim();
  if (!t || !options?.length) return '';
  const found = options.find(
    o =>
      String(o)
        .trim()
        .toLowerCase() === t.toLowerCase(),
  );
  return found || '';
}

/**
 * Nearest dropdown position for a typed query (e.g. "CAD" → "CAD Designer").
 * Prefers exact, then prefix, then substring; ties break to the shortest title.
 */
function findNearestPositionOption(options, query) {
  const q = String(query || '')
    .trim()
    .toLowerCase();
  if (!q || !options?.length) return '';

  const exact = matchPositionOption(options, query);
  if (exact) return exact;

  const ranked = options
    .map(option => {
      const title = String(option || '').trim();
      const lower = title.toLowerCase();
      if (!lower) return null;
      let score = 0;
      if (lower.startsWith(q)) score = 3;
      else if (lower.split(/[^a-z0-9]+/).some(part => part.startsWith(q))) score = 2;
      else if (lower.includes(q)) score = 1;
      else return null;
      return { title, score, length: title.length };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.length - b.length);

  return ranked[0]?.title || '';
}

function getInitialFormState(chosen, navTitle) {
  const displayTitle = (navTitle && String(navTitle).trim()) || chosen?.title || '';
  if (!chosen) {
    // Still surface the navigated/typed job in the dropdown even when no form matched yet.
    return {
      selectedJob: displayTitle,
      filteredForm: null,
      answers: [],
      bannerJobTitle: displayTitle,
      jobTitleInput: displayTitle || null,
    };
  }
  // Prefer the job the applicant clicked so the position dropdown matches the deep link.
  return {
    selectedJob: displayTitle,
    filteredForm: chosen,
    answers: initialAnswersForQuestions(getVisibleQuestionsForForm(chosen)),
    bannerJobTitle: displayTitle,
    jobTitleInput: navTitle || null,
  };
}

async function loadActivePositions() {
  try {
    const positionsRes = await axios.get(ENDPOINTS.GET_JOB_POSITIONS, publicApplyRequestConfig());
    return Array.isArray(positionsRes.data?.positions)
      ? positionsRes.data.positions.filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

async function loadJobForms(formId) {
  if (formId && isMongoObjectId(formId)) {
    try {
      const single = await axios.get(ENDPOINTS.GET_JOB_FORM(formId), publicApplyRequestConfig());
      const form = single.data?.form || single.data;
      if (form) return [form];
    } catch {
      /* Fall through to /all */
    }
  }
  const res = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS, publicApplyRequestConfig());
  return parseFormsResponse(res);
}

function buildInitialSelection({
  formsArr,
  positions,
  navTitle,
  positionSlug,
  routerLocation,
  formId,
}) {
  const navState = {
    ...routerLocation.state,
    jobTitle: navTitle || routerLocation.state?.jobTitle,
    formId: formId || routerLocation.state?.formId,
  };
  const slugMatch = positionSlug ? findFormByPositionSlug(formsArr, positionSlug) : null;
  const formMatch = slugMatch || (navTitle ? findFormForJobTitle(formsArr, navTitle) : null);
  const chosen = pickInitialForm(formsArr, navState, positionSlug);
  notifyInitialFormSelection(navTitle, formMatch, chosen);

  const bannerTitle = navTitle || slugMatch?.title || chosen?.title || '';
  const baseOptions = positions.length ? positions : formsArr.map(f => f.title).filter(Boolean);
  const options = ensurePositionOption(baseOptions, bannerTitle);
  const initial = getInitialFormState(chosen, bannerTitle);
  const selected =
    matchPositionOption(options, initial.selectedJob || bannerTitle) ||
    initial.selectedJob ||
    bannerTitle ||
    '';

  return { options, initial, selected, bannerTitle };
}

function getQuestionType(q) {
  return String(q.questionType || q.type || '').toLowerCase();
}

function isResumeQuestion(q) {
  const label = (q.label || q.questionText || '').toLowerCase();
  return /\b(resume|résumé|curriculum\s*vitae|cv)\b/.test(label);
}

/** Resume/CV and built-in profile prompts are collected above — skip duplicates in the list. */
function shouldHideQuestionFromApplicantList(q) {
  if (isResumeQuestion(q)) return true;
  if (isStandardProfileFieldQuestion(q)) return true;
  const raw = (q.label || q.questionText || '').trim();
  return /^(19|20)[.)\s]/.test(raw) || /^question\s*(19|20)\b/i.test(raw);
}

function formRequiresResumeUpload(form) {
  if (!form?.questions) return false;
  return form.questions.some(
    q => q.visible !== false && isResumeQuestion(q) && isQuestionRequired(q),
  );
}

function formatFileSize(bytes) {
  if (bytes == null || bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Strip numbering often baked into saved template text (e.g. "1.) …") so the UI can show a single
 * running index from `{idx + 1}. …`.
 */
function stripLeadingQuestionEnumeration(raw) {
  let s = String(raw || '').trim();
  if (!s) return s;
  let prev;
  do {
    prev = s;
    s = s
      .replace(/^[Qq]uestion\s*\d+\s*[.:]\s*/, '')
      .replace(/^\d+\.\)\s*/, '')
      .replace(/^\d+\)\s*/, '')
      .trim();
  } while (s !== prev);
  return s;
}

function getQuestionLabelText(q) {
  const raw = (q?.label || q?.questionText || '').trim();
  if (!raw) return '';
  return stripLeadingQuestionEnumeration(raw) || raw;
}

function getQuestionLabel(q, idx) {
  const cleaned = getQuestionLabelText(q);
  if (!cleaned) return `Question ${idx + 1}`;
  return cleaned;
}

/** Profile fields rendered once at the top of the application form. */
const STANDARD_PROFILE_LABEL_KEYS = new Set([
  'name',
  'your name',
  'full name',
  'applicant name',
  'email',
  'your email',
  'email address',
  'your email address',
  'phone',
  'phone number',
  'your phone',
  'your phone number',
  'mobile',
  'mobile number',
  'location timezone',
  'location and timezone',
  'your location timezone',
  'company position',
  'company and position',
  'your company position',
  'primary website social',
  'primary website and social',
  'website social',
  'website or social',
]);

function isStandardProfileFieldQuestion(q) {
  const normalized = normalizeTitleKey(getQuestionLabelText(q));
  if (!normalized || normalized.length > 48) return false;
  return STANDARD_PROFILE_LABEL_KEYS.has(normalized);
}

function isQuestionRequired(q) {
  if (!q || typeof q !== 'object') return false;
  return (
    q.isRequired === true ||
    q.required === true ||
    q.mandatory === true ||
    String(q.isRequired).toLowerCase() === 'true' ||
    String(q.required).toLowerCase() === 'true'
  );
}

/** True if two question objects carry nearly the same prompt (long repeated copy, minor edits). */
function questionLabelsNearlyDuplicate(q1, q2) {
  const raw1 = (q1?.label || q1?.questionText || '').trim();
  const raw2 = (q2?.label || q2?.questionText || '').trim();
  const c1 = stripLeadingQuestionEnumeration(raw1) || raw1;
  const c2 = stripLeadingQuestionEnumeration(raw2) || raw2;
  const a = normalizeTitleKey(c1);
  const b = normalizeTitleKey(c2);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < 45 || b.length < 45) return false;
  return a.includes(b) || b.includes(a);
}

/** Drop exact and near-duplicate prompts (templates pasted twice, etc.). */
function dedupeVisibleQuestions(questions) {
  const kept = [];
  for (const q of questions ?? []) {
    const raw = (q.label || q.questionText || '').trim();
    const cleaned = stripLeadingQuestionEnumeration(raw) || raw;
    const key = normalizeTitleKey(cleaned);
    const dupExact =
      key &&
      kept.some(k => {
        const kr = (k.label || k.questionText || '').trim();
        const kc = stripLeadingQuestionEnumeration(kr) || kr;
        return normalizeTitleKey(kc) === key;
      });
    if (dupExact) continue;
    if (kept.some(k => questionLabelsNearlyDuplicate(q, k))) continue;
    kept.push(q);
  }
  return kept;
}

function getVisibleQuestionsForForm(form) {
  if (!form?.questions) return [];
  const filtered = form.questions.filter(
    q => q.visible !== false && !shouldHideQuestionFromApplicantList(q),
  );
  return dedupeVisibleQuestions(filtered);
}

function initialAnswersForQuestions(questions) {
  return (questions ?? []).map(() => '');
}

function normalizeCheckboxAnswerArray(prev) {
  if (Array.isArray(prev)) return [...prev];
  if (prev !== '' && prev != null) return [String(prev)];
  return [];
}

function answerValueToPrefillString(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (value == null || value === '') return '';
  return String(value);
}

function parseNumericInput(value) {
  return value ? Number.parseFloat(value) : 0;
}

function isAnswerEmpty(answer, q) {
  const t = getQuestionType(q);
  if (t === 'checkbox') {
    if (Array.isArray(answer)) return answer.length === 0;
    return !String(answer ?? '').trim();
  }
  return !String(answer ?? '').trim();
}

function missingRequiredQuestionLabel(q, idx, answers, questionFiles) {
  if (!isQuestionRequired(q)) return null;
  if (isJobApplicationFileUploadQuestion(q)) {
    return questionFiles[idx] ? null : getQuestionLabel(q, idx);
  }
  return isAnswerEmpty(answers[idx], q) ? getQuestionLabel(q, idx) : null;
}

function isHoursPerWeekQuestion(label) {
  const text = String(label || '').toLowerCase();

  // Schedule / availability prompts mention hours but expect text answers.
  if (/\b(availability|available)\b/.test(text)) return false;
  if (/\bweekly\s+deadline\b/.test(text)) return false;

  return (
    /hours?\s*(per|a|\/)\s*week\b/.test(text) ||
    /\bhow\s+many\s+hours\b/.test(text) ||
    /\bvolunteer\s+hours?\b/.test(text) ||
    (/\bcommit\b/.test(text) && /\bhours?\b/.test(text))
  );
}

function isIndividualOrgQuestionLabel(label) {
  const labelLower = String(label || '').toLowerCase();
  return labelLower.includes('individual') && labelLower.includes('organization');
}

function validateHoursPerWeekAnswer(label, answer) {
  const trimmed = String(answer ?? '').trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return `${label} (must be a number)`;
  const num = Number(trimmed);
  if (num <= 0 || num > 168) return `${label} (must be between 1 and 168)`;
  return null;
}

function validateName(name, label = 'Name') {
  const trimmed = String(name || '').trim();

  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters.`;
  if (trimmed.length > 100) return `${label} must not exceed 100 characters.`;

  if (!/^[\p{L}\s'-]+$/u.test(trimmed)) {
    return `${label} may contain only letters, spaces, hyphens, and apostrophes.`;
  }

  return '';
}

function validateEmail(email) {
  return checkEmail(email).error;
}

function validatePhone(phone) {
  const trimmed = String(phone || '').trim();

  if (!trimmed) return 'Phone number is required.';

  try {
    const phoneNumber = parsePhoneNumberFromString(trimmed);

    if (!phoneNumber?.isPossible()) {
      return 'Please enter a valid phone number format (e.g., +1 213-456-7890).';
    }
  } catch {
    return 'Invalid phone number format.';
  }

  return '';
}

function validateLocation(location) {
  const trimmed = String(location || '').trim();

  if (!trimmed) return 'Location is required.';

  if (trimmed.length > 100 || !/^[\p{L}\s,.'-]{3,100}$/u.test(trimmed)) {
    return 'Please enter a valid location (e.g., Charlotte, NC).';
  }

  return '';
}

function validateTimeZone(timeZone) {
  const trimmed = String(timeZone || '').trim();

  if (!trimmed) return 'Time zone is required.';

  if (!moment.tz.zone(trimmed)) {
    return 'Please select a valid time zone.';
  }

  return '';
}

function getProfileValidationErrors({
  firstName,
  lastName,
  applicantEmail,
  phone,
  location,
  timeZone,
}) {
  const errors = {};

  const firstNameError = validateName(firstName, 'First name');
  const lastNameError = validateName(lastName, 'Last name');
  const emailError = validateEmail(applicantEmail);
  const phoneError = validatePhone(phone);
  const locationError = validateLocation(location);
  const timeZoneError = validateTimeZone(timeZone);

  if (firstNameError) errors.firstName = firstNameError;
  if (lastNameError) errors.lastName = lastNameError;
  if (emailError) errors.applicantEmail = emailError;
  if (phoneError) errors.phone = phoneError;
  if (locationError) errors.location = locationError;
  if (timeZoneError) errors.timeZone = timeZoneError;

  return errors;
}

function collectMissingRequiredFields({
  profileErrors,
  visibleQuestions,
  answers,
  questionFiles,
  resumeFile,
  resumeRequired,
}) {
  const missing = Object.values(profileErrors);

  if (resumeRequired && !resumeFile) missing.push('Resume');
  for (const [idx, q] of visibleQuestions.entries()) {
    const label = getQuestionLabel(q, idx);
    const requiredLabel = missingRequiredQuestionLabel(q, idx, answers, questionFiles);
    if (requiredLabel) missing.push(requiredLabel);
    if (isHoursPerWeekQuestion(label)) {
      const hoursError = validateHoursPerWeekAnswer(label, answers[idx]);
      if (hoursError) missing.push(hoursError);
    }
  }
  return missing;
}

function serializeAnswerForSubmit(q, idx, answers, questionFiles) {
  if (!isJobApplicationFileUploadQuestion(q)) return answers[idx];
  const file = questionFiles[idx];
  if (!file) return '';
  return {
    fileName: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

/** Shown for every role when API text is missing or only a placeholder (e.g. "desc …"). */
const GENERIC_ROLE_DESCRIPTION = `One Community is a nonprofit focused on sustainability and open collaboration. Volunteers work remotely with teammates in different time zones, contribute to shared goals, and stay aligned using tools like Slack and Zoom.

We look for reliable, self-motivated people who want to grow their skills while supporting a mission-driven project. Every open role follows that same volunteer structure: specific tasks depend on the position title, but clear communication, quality of work, and teamwork apply to everyone on the team.`;

function normalizeApiJobDescription(raw, title) {
  if (raw == null) return '';
  let s = String(raw).trim();
  if (!s) return '';
  s = s.replace(/^desc\s*:?\s*/i, '').trim();
  if (!s) return '';
  const t = String(title || '')
    .trim()
    .toLowerCase();
  const sl = s.toLowerCase();
  if (t && (sl === t || sl === `desc ${t}`)) return '';
  if (t && sl.replace(/\s+/g, ' ') === t.replace(/\s+/g, ' ')) return '';
  return s;
}

function getJobDescriptionForModal(form) {
  const extra = normalizeApiJobDescription(form?.description, form?.title);
  if (!extra) return GENERIC_ROLE_DESCRIPTION;
  return `${GENERIC_ROLE_DESCRIPTION}\n\nAdditional details:\n${extra}`;
}

function isValidId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 100;
}

/** Mongo ObjectId — used so position slugs are never treated as job/form ids. */
function isMongoObjectId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);
}

const REQUIREMENT_ITEMS = [
  { id: 'reactExperience', label: '1+ years of Full-Time ReactJS Experience' },
  { id: 'twoMonthsCommitment', label: 'Minimum of 2 Months Commitment' },
  { id: 'javascriptExperience', label: '1+ years of Full-Time JavaScript Experience' },
  { id: 'timeZoneLocation', label: 'Time Zone and Location Matches' },
  { id: 'tenHoursPerWeek', label: 'Minimum of 10 hours of work a week' },
];

function FileUploadField({
  id,
  label,
  accept,
  file,
  onChange,
  onClear,
  inputRef,
  optional = false,
  required = false,
}) {
  const statusText = file ? `${file.name} (${formatFileSize(file.size)})` : 'No file selected';
  const statusClass = file ? styles.fileStatusSelected : styles.fileStatusEmpty;

  return (
    <div className={styles.fileUploadField}>
      {label && (
        <span className={styles.fieldLabel}>
          {label}
          {!optional && required && (
            <>
              <span className={styles.requiredMark} aria-hidden="true">
                {' '}
                *
              </span>
              <span className={styles.visuallyHidden}> (required)</span>
            </>
          )}
        </span>
      )}
      <div className={styles.fileUploadRow}>
        <label htmlFor={id} className={styles.uploadButton}>
          <span>Choose file</span>
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={onChange}
            className={styles.hiddenFileInput}
            required={required && !file}
          />
        </label>
        <span className={`${styles.fileStatus} ${statusClass}`} aria-live="polite">
          {statusText}
        </span>
        {file && (
          <button type="button" className={styles.clearFileBtn} onClick={onClear}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

FileUploadField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  accept: PropTypes.string,
  file: PropTypes.shape({
    name: PropTypes.string,
    size: PropTypes.number,
  }),
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
  optional: PropTypes.bool,
  required: PropTypes.bool,
};

FileUploadField.defaultProps = {
  label: '',
  accept: '.pdf,.doc,.docx,.png,.jpg,.jpeg',
  file: null,
  onClear: undefined,
  inputRef: undefined,
  optional: false,
  required: false,
};

function JobPositionSelect({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const titles = Array.isArray(options) ? options.filter(Boolean) : [];
  const matched = matchPositionOption(titles, value);
  const label = matched || value || 'Select a position';
  const valueKey = String(value || '')
    .trim()
    .toLowerCase();

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = event => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = event => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = next => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className={styles.jobSelectWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.jobSelect}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select a position"
        onClick={() => setOpen(isOpen => !isOpen)}
      >
        <span className={styles.jobSelectLabel}>{label}</span>
      </button>
      {open && (
        <ul className={styles.jobSelectMenu} role="listbox" aria-label="Positions">
          <li
            role="option"
            aria-selected={!valueKey}
            className={!valueKey ? styles.jobSelectOptionActive : undefined}
          >
            <button type="button" onClick={() => choose('')}>
              Select a position
            </button>
          </li>
          {titles.map(title => {
            const selected =
              String(title)
                .trim()
                .toLowerCase() === valueKey;
            return (
              <li
                key={title}
                role="option"
                aria-selected={selected}
                className={selected ? styles.jobSelectOptionActive : undefined}
              >
                <button type="button" onClick={() => choose(title)}>
                  {title}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

JobPositionSelect.propTypes = {
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

JobPositionSelect.defaultProps = {
  value: '',
  options: [],
};

function JobApplicationForm() {
  const routerLocation = useLocation();
  const { positionSlug } = useParams();

  const [forms, setForms] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [answers, setAnswers] = useState([]);
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [filteredForm, setFilteredForm] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantLocation, setApplicantLocation] = useState('');
  const [timeZone, setTimeZone] = useState('');
  const [phone, setPhone] = useState('');
  const [companyPosition, setCompanyPosition] = useState('');
  const [websiteSocial, setWebsiteSocial] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [questionFiles, setQuestionFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resumeInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const questionFileInputRefs = useRef({});
  /** Shown in the page title — the role the user clicked, not only the matched DB form name. */
  const [bannerJobTitle, setBannerJobTitle] = useState('');
  const [jobDataFromRedirect, setJobDataFromRedirect] = useState(null);
  const [fullTimeYears, setFullTimeYears] = useState('');
  const [monthsVolunteer, setMonthsVolunteer] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [roleSkills, setRoleSkills] = useState('');
  /** Owner/Admin: optional manual toggles on top of auto-calculated requirement flags. */
  const [requirementPreviewOverrides, setRequirementPreviewOverrides] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailSuggestion, setEmailSuggestion] = useState(null);
  const locationTimezone = [applicantLocation.trim(), timeZone.trim()].filter(Boolean).join(' | ');

  const darkMode = useSelector(state => state.theme?.darkMode);
  const isAdmin = useSelector(state => {
    try {
      const role = state?.auth?.user?.role;
      if (role == null || role === '') return false;
      const r = String(role).toLowerCase();
      return r === 'administrator' || r === 'owner' || r === 'admin';
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  });

  /*
   * Match html/body/#root to the page strip. Global #root is white; dark mode uses !important —
   * route class + :global rules in the module CSS set backgrounds with !important while mounted.
   */
  useEffect(() => {
    const c = 'job-application-route';
    const root = document.getElementById('root');
    document.documentElement.classList.add(c);
    document.body.classList.add(c);
    root?.classList.add(c);
    return () => {
      document.documentElement.classList.remove(c);
      document.body.classList.remove(c);
      root?.classList.remove(c);
    };
  }, []);

  const visibleQuestions = useMemo(() => getVisibleQuestionsForForm(filteredForm), [filteredForm]);
  const resumeRequired = useMemo(() => formRequiresResumeUpload(filteredForm), [filteredForm]);

  const applyQuestionnairePreFill = data => {
    if (!data) return;
    if (data.name) {
      const [firstPart, ...restParts] = String(data.name)
        .trim()
        .split(/\s+/);
      setFirstName(firstPart || '');
      setLastName(restParts.join(' '));
    }
    if (data.email) setApplicantEmail(data.email);
    if (data.location) {
      setApplicantLocation(data.location);
    } else if (data.locationTimezone) {
      setApplicantLocation(data.locationTimezone);
    }
    if (data.timeZone || data.timezone) {
      setTimeZone(data.timeZone || data.timezone);
    }
    if (data.phone) setPhone(data.phone);
    if (data.fullTimeYears) setFullTimeYears(data.fullTimeYears);
    if (data.monthsVolunteer) setMonthsVolunteer(data.monthsVolunteer);
    if (data.hoursPerWeek) setHoursPerWeek(data.hoursPerWeek);
    if (data.roleSkills) setRoleSkills(data.roleSkills);
  };

  const fetchUserQuestionnaireData = async referralId => {
    try {
      const response = await axios.get(
        `${ENDPOINTS.GET_USER_QUESTIONNAIRE}/${referralId}`,
        publicApplyRequestConfig(),
      );
      if (response.data) {
        applyQuestionnairePreFill(response.data);
      }
    } catch (error) {
      console.error('Error fetching user questionnaire data:', error);
    }
  };

  const fetchJobData = async jobId => {
    try {
      const response = await axios.get(
        `${ENDPOINTS.APIEndpoint()}/jobs/${jobId}`,
        publicApplyRequestConfig(),
      );
      const job = response.data?.job || response.data;
      if (job) {
        setJobDataFromRedirect({
          jobId: job._id,
          jobTitle: job.title,
          jobDescription: job.description || '',
          requirements: job.requirements || [],
          category: job.category || 'General',
          jobDetailsLink: job.jobDetailsLink || '',
        });
        if (job.title) {
          setJobTitleInput(job.title);
        }
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
      toast.error('Failed to load job details');
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(routerLocation.search);
    const referralId = searchParams.get('ref') || searchParams.get('referral');
    const jobIdParam = searchParams.get('jobId');
    const jobId = jobIdParam && isMongoObjectId(jobIdParam) ? jobIdParam : null;

    if (referralId && isValidId(referralId)) {
      void fetchUserQuestionnaireData(referralId);
    }

    if (routerLocation.state) {
      setJobDataFromRedirect(routerLocation.state);
      if (routerLocation.state.jobTitle) {
        setJobTitleInput(routerLocation.state.jobTitle);
      }
    } else if (jobId) {
      void fetchJobData(jobId);
    } else if (positionSlug) {
      const hint = titleHintFromSlug(positionSlug);
      if (hint) setJobTitleInput(hint);
    }
  }, [routerLocation.state, routerLocation.search, routerLocation.pathname, positionSlug]);

  useEffect(() => {
    let cancelled = false;

    async function fetchForms() {
      try {
        const formId = getFormIdFromNavigation(routerLocation);
        const [positions, formsArr] = await Promise.all([
          loadActivePositions(),
          loadJobForms(formId),
        ]);
        if (cancelled) return;

        setForms(formsArr);
        const navTitle = resolveNavigationJobTitle(
          jobDataFromRedirect,
          routerLocation,
          positionSlug,
        );
        const { options, initial, selected, bannerTitle } = buildInitialSelection({
          formsArr,
          positions,
          navTitle,
          positionSlug,
          routerLocation,
          formId,
        });

        setPositionOptions(options);
        setSelectedJob(selected);
        setFilteredForm(initial.filteredForm);
        setAnswers(initial.answers);
        setBannerJobTitle(initial.bannerJobTitle || selected || bannerTitle);
        if (initial.jobTitleInput) setJobTitleInput(initial.jobTitleInput);
        else if (selected || bannerTitle) setJobTitleInput(selected || bannerTitle);
      } catch {
        if (!cancelled) {
          setForms([]);
          setPositionOptions([]);
          setSelectedJob('');
          setFilteredForm(null);
          setAnswers([]);
          toast.error('Failed to load job forms.');
        }
      }
    }

    void fetchForms();
    return () => {
      cancelled = true;
    };
  }, [routerLocation.key, jobDataFromRedirect, positionSlug]);

  useEffect(() => {
    if (!selectedJob) return;
    const form =
      forms.find(f => f.title === selectedJob) ||
      findFormForJobTitle(forms, selectedJob) ||
      findDefaultSoftwareForm(forms);
    if (!form) return;
    setFilteredForm(form);
    const qs = getVisibleQuestionsForForm(form);
    setAnswers(initialAnswersForQuestions(qs));
    setQuestionFiles({});
    questionFileInputRefs.current = {};
    setFieldErrors({});
  }, [selectedJob, forms]);

  // If the title input was filled from navigation but selectedJob stayed empty (e.g. no form
  // title match), sync the dropdown to the matching /jobs/positions option.
  useEffect(() => {
    if (selectedJob || !jobTitleInput.trim() || !positionOptions.length) return;
    const match = matchPositionOption(positionOptions, jobTitleInput);
    if (!match) return;
    setSelectedJob(match);
    setBannerJobTitle(match);
  }, [jobTitleInput, positionOptions, selectedJob]);

  const handleJobChange = next => {
    setSelectedJob(next);
    if (!next) {
      setBannerJobTitle('');
      setFilteredForm(null);
      setAnswers([]);
      setQuestionFiles({});
      questionFileInputRefs.current = {};
      setFieldErrors({});
      return;
    }
    setBannerJobTitle(next);
    setJobTitleInput(next);
  };

  const handleJobTitleInputChange = e => {
    setJobTitleInput(e.target.value);
  };

  const handleGoClick = () => {
    const raw = jobTitleInput.trim();
    if (!raw) {
      toast.info('Enter a job title.');
      return;
    }
    // Partial search (e.g. "CAD") should pick the nearest dropdown position.
    const positionMatch = findNearestPositionOption(positionOptions, raw);
    const lookupTitle = positionMatch || raw;
    let form = forms.find(f => f.title?.toLowerCase() === lookupTitle.toLowerCase());
    if (!form) form = findFormForJobTitle(forms, lookupTitle);
    if (!form && lookupTitle !== raw) form = findFormForJobTitle(forms, raw);
    const usedDefaultSoftware = !form;
    if (!form) form = findDefaultSoftwareForm(forms);

    if (positionMatch || form) {
      const selected = positionMatch || form.title;
      setSelectedJob(selected);
      setBannerJobTitle(selected);
      setJobTitleInput(selected);
      if (usedDefaultSoftware && form) {
        toast.warn(
          `No form is linked to "${selected}". Showing the default software engineer application ("${form.title}") — pick another role from the dropdown if this is not the right questionnaire.`,
          { autoClose: false, closeOnClick: false, toastId: 'job-title-mismatch-warning' },
        );
      }
    } else {
      toast.info('No position matches that search. Pick one from the dropdown.');
    }
  };

  const handleAnswerChange = (idx, value, label) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);

    if (isHoursPerWeekQuestion(label)) {
      const str = Array.isArray(value) ? '' : String(value ?? '');
      if (str && !/^\d*$/.test(str)) {
        setFieldErrors(prev => ({ ...prev, [idx]: 'Only numbers are allowed' }));
      } else {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next[idx];
          return next;
        });
      }
    }
  };

  /** Checkbox question with multiple options: toggle selection in an array stored at answers[idx]. */
  const toggleCheckboxOption = (idx, opt) => {
    const prev = answers[idx];
    const arr = normalizeCheckboxAnswerArray(prev);
    const i = arr.indexOf(opt);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(opt);
    handleAnswerChange(idx, arr);
  };

  const isCheckboxOptionChecked = (answer, opt) => {
    if (Array.isArray(answer)) return answer.includes(opt);
    return answer === opt;
  };

  // Copy answers for typical prompts into requirement evaluation state (avoids duplicating those fields in the UI).
  useEffect(() => {
    if (!visibleQuestions.length) return;
    visibleQuestions.forEach((q, idx) => {
      const label = (q.label || q.questionText || '').toLowerCase();
      const v = answers[idx];
      const str = answerValueToPrefillString(v);
      if (!str.trim()) return;

      if (/(skill|what skills|experience do you|possess\?)/i.test(label)) setRoleSkills(str);
      else if (/hours per week|volunteer hours|commit to/i.test(label)) setHoursPerWeek(str);
      else if (/how long|wish to volunteer|in months/i.test(label)) setMonthsVolunteer(str);
      else if (/full.?time|years of.*experience|full time experience/i.test(label))
        setFullTimeYears(str);
    });
  }, [answers, visibleQuestions]);

  const handleKnowMoreClick = () => {
    setShowDescription(true);
  };

  const handleCloseDescription = () => {
    setShowDescription(false);
  };

  const getCategoryFromRole = roleTitle => {
    const t = String(roleTitle || '').toLowerCase();
    if (/(engineer|developer|software|frontend|back ?end|full ?stack|devops|qa|test)/.test(t))
      return 'Engineering';
    if (/(design|ux|ui|graphic|visual)/.test(t)) return 'Design';
    if (/(marketing|social|seo|content|copywriter|communications)/.test(t)) return 'Marketing';
    if (/(finance|account|bookkeep|budget)/.test(t)) return 'Finance';
    return 'General';
  };

  const handleResumeChange = e => {
    const f = e.target.files?.[0] || null;

    if (!f) {
      setResumeFile(null);
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(f.type)) {
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      toast.error('Invalid file type. Please upload PDF or DOC/DOCX.');
      return;
    }

    setResumeFile(f);
    toast.success(`Resume selected: ${f.name}`);
  };

  const clearResumeFile = () => {
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const handleQuestionFileChange = (idx, e) => {
    const f = e.target.files?.[0] || null;
    setQuestionFiles(prev => ({ ...prev, [idx]: f }));
  };

  const clearQuestionFile = idx => {
    setQuestionFiles(prev => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
    const ref = questionFileInputRefs.current[idx];
    if (ref) ref.value = '';
  };

  const evaluateRequirements = (data = {}) => {
    const {
      fullTimeYears: years = '',
      monthsVolunteer: months = '',
      hoursPerWeek: hours = '',
      roleSkills: skills = '',
      locationTimezone: timezone = '',
    } = data;

    const reactKeywords = ['react', 'reactjs', 'react.js'];
    const skillsLower = (skills || '').toLowerCase();
    const yearsNum = parseNumericInput(years);
    const monthsNum = parseNumericInput(months);
    const hoursNum = parseNumericInput(hours);

    return {
      reactExperience:
        yearsNum >= 1 || reactKeywords.some(keyword => skillsLower.includes(keyword)),
      twoMonthsCommitment: monthsNum >= 2,
      javascriptExperience: yearsNum >= 1,
      timeZoneLocation: Boolean(timezone?.trim()),
      tenHoursPerWeek: hoursNum >= 10,
    };
  };

  const requirementsForDisplay = useMemo(() => {
    const computed = evaluateRequirements({
      fullTimeYears,
      monthsVolunteer,
      hoursPerWeek,
      roleSkills,
      locationTimezone,
    });
    const merged = { ...computed };
    Object.entries(requirementPreviewOverrides).forEach(([id, val]) => {
      if (val !== undefined) merged[id] = val;
    });
    return merged;
  }, [
    fullTimeYears,
    monthsVolunteer,
    hoursPerWeek,
    roleSkills,
    locationTimezone,
    requirementPreviewOverrides,
  ]);

  const toggleRequirementPreview = useCallback(
    id => {
      setRequirementPreviewOverrides(prev => {
        const computed = evaluateRequirements({
          fullTimeYears,
          monthsVolunteer,
          hoursPerWeek,
          roleSkills,
          locationTimezone,
        });
        const current = prev[id] === undefined ? computed[id] : prev[id];
        return { ...prev, [id]: !current };
      });
    },
    [fullTimeYears, monthsVolunteer, hoursPerWeek, roleSkills, locationTimezone],
  );

  const validateBeforeSubmit = () => {
    const profileErrors = getProfileValidationErrors({
      firstName,
      lastName,
      applicantEmail,
      phone,
      location: applicantLocation,
      timeZone,
    });

    const missing = collectMissingRequiredFields({
      profileErrors,
      visibleQuestions,
      answers,
      questionFiles,
      resumeFile,
      resumeRequired,
    });

    return { missing, profileErrors };
  };

  const resetFormAfterSubmit = () => {
    setFirstName('');
    setLastName('');
    setApplicantEmail('');
    setApplicantLocation('');
    setTimeZone('');
    setPhone('');
    setCompanyPosition('');
    setWebsiteSocial('');
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
    setQuestionFiles({});
    questionFileInputRefs.current = {};
    setFullTimeYears('');
    setMonthsVolunteer('');
    setHoursPerWeek('');
    setRoleSkills('');
    setAnswers(initialAnswersForQuestions(visibleQuestions));
    setRequirementPreviewOverrides({});
    setFieldErrors({});
    setEmailSuggestion(null);
  };

  // Check the email when the applicant leaves the field (other fields still validate on submit)
  const handleEmailBlur = () => {
    if (!applicantEmail.trim()) return;
    const { error, suggestion } = checkEmail(applicantEmail);
    setEmailSuggestion(suggestion);
    setFieldErrors(prev => {
      const next = { ...prev };
      if (error) next.applicantEmail = error;
      else delete next.applicantEmail;
      return next;
    });
  };

  const applyEmailSuggestion = () => {
    setApplicantEmail(emailSuggestion);
    setEmailSuggestion(null);
    // The suggestion button unmounts, so return focus to the field rather than the page.
    emailInputRef.current?.focus();
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next.applicantEmail;
      return next;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!filteredForm?._id) {
      toast.error('No application form selected. Choose a role from the dropdown.');
      return;
    }

    const { missing, profileErrors } = validateBeforeSubmit();
    setEmailSuggestion(checkEmail(applicantEmail).suggestion);

    setFieldErrors(prev => {
      const next = { ...prev };

      delete next.firstName;
      delete next.lastName;
      delete next.applicantEmail;
      delete next.location;
      delete next.timeZone;
      delete next.phone;

      return {
        ...next,
        ...profileErrors,
      };
    });

    if (missing.length > 0) {
      toast.error(
        <div>
          <div>Please complete required fields:</div>
          {missing.map(field => (
            <div key={field}>• {field}</div>
          ))}
        </div>,
        { autoClose: 7000 },
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const answersPayload = visibleQuestions.map((q, idx) => ({
        questionId: q._id,
        answer: serializeAnswerForSubmit(q, idx, answers, questionFiles),
      }));

      const fullApplicantName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const formData = new FormData();
      formData.append('respondent', fullApplicantName);
      formData.append('email', applicantEmail.trim());
      formData.append('answers', JSON.stringify(answersPayload));
      formData.append(
        'payload',
        JSON.stringify({
          applicantName: fullApplicantName,
          applicantEmail: applicantEmail.trim(),
          profile: {
            locationTimezone,
            phone,
            companyPosition,
            websiteSocial,
            jobTitle: (bannerJobTitle || selectedJob || '').trim(),
            fullTimeYears,
            monthsVolunteer,
            hoursPerWeek,
            roleSkills,
          },
          answers: answersPayload,
        }),
      );

      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      visibleQuestions.forEach((q, idx) => {
        if (isJobApplicationFileUploadQuestion(q) && questionFiles[idx] && q._id) {
          formData.append(`questionFile_${q._id}`, questionFiles[idx]);
        }
      });

      await axios.post(
        ENDPOINTS.SUBMIT_JOB_APPLICATION(filteredForm._id),
        formData,
        publicApplyRequestConfig({
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );

      toast.success('Application submitted successfully. A confirmation email will be sent.');
      resetFormAfterSubmit();
    } catch (err) {
      const apiMessage = err.response?.data?.message || err.response?.data?.error;
      if (err.response?.status === 409) {
        toast.error(apiMessage || 'You already applied for this position.', {
          autoClose: 7000,
        });
      } else {
        toast.error(apiMessage || err.message || 'Failed to submit application.', {
          autoClose: 7000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <header className={styles.logo}>
        <a
          href="https://www.onecommunityglobal.org/collaboration/"
          target="_blank"
          rel="noreferrer"
        >
          <img src={OneCommunityImage} alt="One Community Logo" />
        </a>
      </header>
      <main className={styles.header}>
        <section className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <input
              type="text"
              placeholder="Enter Job Title"
              className={styles.jobTitleInput}
              value={jobTitleInput}
              onChange={handleJobTitleInputChange}
            />
            <button className="btn btn-secondary" onClick={handleGoClick} type="button">
              Go
            </button>
          </div>
          <div className={styles.headerRight}>
            <JobPositionSelect
              value={selectedJob}
              options={positionOptions}
              onChange={handleJobChange}
            />
          </div>
        </section>
        <section className={styles.formContainer}>
          <h1 className={styles.formTitle}>
            Job Application – {(bannerJobTitle || selectedJob || 'this role').trim()}
          </h1>
          <p className={styles.formSubtitle}>
            {/* Match development: always open the in-page "About the role" modal.
                Do not navigate to jobDetailsLink (often bad seed data → 404). */}
            <button
              type="button"
              className={styles.linkButton}
              onClick={handleKnowMoreClick}
              aria-haspopup="dialog"
            >
              Click to know more about this position
            </button>
          </p>
          {showDescription && filteredForm && (
            <div className={styles.popupOverlay}>
              <div className={styles.popupContent}>
                <button
                  className={styles.popupCloseBtn}
                  onClick={handleCloseDescription}
                  aria-label="Close"
                  type="button"
                >
                  &times;
                </button>
                <div className={styles.jobDescHeader}>
                  <div className={styles.jobDescTitle}>{bannerJobTitle || filteredForm.title}</div>
                  <div className={styles.jobDescTags}>
                    <span className={`${styles.tagPill} ${styles.tagPillStrong}`}>
                      {getCategoryFromRole(bannerJobTitle || filteredForm.title)}
                    </span>
                    <span className={styles.tagPill}>Remote</span>
                  </div>
                </div>

                <div className={styles.jobDescBody}>
                  <div className={styles.jobDescSectionTitle}>About the role</div>
                  <div className={styles.jobDescText}>
                    {getJobDescriptionForModal(filteredForm)}
                  </div>
                  <div className={styles.jobDescFooter}>
                    <button
                      type="button"
                      className={styles.gotItBtn}
                      onClick={handleCloseDescription}
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <form className={styles.form} onSubmit={handleSubmit}>
            {isAdmin && (
              <>
                <p className={styles.adminRequirementsNote}>
                  Admin preview: boxes start from your answers; you can override any item for
                  review.
                </p>
                <RequirementsSection
                  requirements={requirementsForDisplay}
                  darkMode={darkMode}
                  interactive
                  onToggle={toggleRequirementPreview}
                />
              </>
            )}
            <p className={styles.formHint}>
              <span className={styles.requiredMark} aria-hidden="true">
                *
              </span>{' '}
              indicates a required field. Complete all required items before you submit.
            </p>
            <div>
              Here is a questionnaire to apply to work with us. To complete your application and
              schedule a Zoom interview, please answer the pre-interview questions below.
            </div>
            <div className={styles.formContentGroup}>
              <div className={styles.formProfileDetailGroup}>
                <div className={styles.profileField}>
                  <label htmlFor="jaf-applicant-first-name" className={styles.fieldLabel}>
                    <span>First Name</span>
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="jaf-applicant-first-name"
                    type="text"
                    placeholder="First Name"
                    className={`${styles.inputField} ${
                      fieldErrors.firstName ? styles.inputFieldError : ''
                    }`}
                    value={firstName}
                    onChange={e => {
                      setFirstName(e.target.value);

                      if (fieldErrors.firstName) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.firstName;
                          return next;
                        });
                      }
                    }}
                    minLength={2}
                    maxLength={100}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    autoComplete="given-name"
                  />

                  {fieldErrors.firstName && (
                    <p className={styles.fieldError} role="alert">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                <div className={styles.profileField}>
                  <label htmlFor="jaf-applicant-last-name" className={styles.fieldLabel}>
                    <span>Last Name</span>
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="jaf-applicant-last-name"
                    type="text"
                    placeholder="Last Name"
                    className={`${styles.inputField} ${
                      fieldErrors.lastName ? styles.inputFieldError : ''
                    }`}
                    value={lastName}
                    onChange={e => {
                      setLastName(e.target.value);

                      if (fieldErrors.lastName) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.lastName;
                          return next;
                        });
                      }
                    }}
                    minLength={2}
                    maxLength={100}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.lastName)}
                    autoComplete="family-name"
                  />

                  {fieldErrors.lastName && (
                    <p className={styles.fieldError} role="alert">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>

                <div className={styles.profileField}>
                  <label htmlFor="jaf-applicant-email" className={styles.fieldLabel}>
                    <span>Email</span>
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="jaf-applicant-email"
                    ref={emailInputRef}
                    maxLength={254}
                    type="email"
                    placeholder="Email"
                    className={`${styles.inputField} ${
                      fieldErrors.applicantEmail ? styles.inputFieldError : ''
                    }`}
                    value={applicantEmail}
                    onChange={e => {
                      setApplicantEmail(e.target.value);
                      setEmailSuggestion(null);

                      if (fieldErrors.applicantEmail) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.applicantEmail;
                          return next;
                        });
                      }
                    }}
                    onBlur={handleEmailBlur}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.applicantEmail)}
                    aria-describedby={
                      [
                        fieldErrors.applicantEmail && 'jaf-applicant-email-error',
                        emailSuggestion && 'jaf-applicant-email-suggestion',
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                    autoComplete="email"
                  />

                  {fieldErrors.applicantEmail && (
                    <p id="jaf-applicant-email-error" className={styles.fieldError} role="alert">
                      {fieldErrors.applicantEmail}
                    </p>
                  )}

                  {emailSuggestion && (
                    <p
                      id="jaf-applicant-email-suggestion"
                      className={styles.fieldHint}
                      aria-live="polite"
                    >
                      <span>
                        Did you mean <strong>{emailSuggestion}</strong>?
                      </span>
                      {/* Same small action button as the resume "Remove" */}
                      <button
                        type="button"
                        className={styles.clearFileBtn}
                        onClick={applyEmailSuggestion}
                        aria-label={`Use this email: ${emailSuggestion}`}
                      >
                        Use this
                      </button>
                    </p>
                  )}
                </div>

                <div className={styles.profileField}>
                  <label htmlFor="jaf-location" className={styles.fieldLabel}>
                    <span>Location</span>
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="jaf-location"
                    type="text"
                    placeholder="Location (e.g., Charlotte, NC)"
                    className={`${styles.inputField} ${
                      fieldErrors.location ? styles.inputFieldError : ''
                    }`}
                    value={applicantLocation}
                    onChange={e => {
                      setApplicantLocation(e.target.value);

                      if (fieldErrors.location) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.location;
                          return next;
                        });
                      }
                    }}
                    maxLength={100}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.location)}
                    autoComplete="address-level2"
                  />

                  {fieldErrors.location && (
                    <p className={styles.fieldError} role="alert">
                      {fieldErrors.location}
                    </p>
                  )}
                </div>

                <div className={styles.profileField}>
                  <label htmlFor="jaf-timezone" className={styles.fieldLabel}>
                    <span>Time Zone</span>
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </label>

                  <select
                    id="jaf-timezone"
                    className={`${styles.inputField} ${
                      fieldErrors.timeZone ? styles.inputFieldError : ''
                    }`}
                    value={timeZone}
                    onChange={e => {
                      setTimeZone(e.target.value);

                      if (fieldErrors.timeZone) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.timeZone;
                          return next;
                        });
                      }
                    }}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.timeZone)}
                  >
                    <option value="">Select Time Zone</option>

                    {moment.tz.names().map(tz => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.timeZone && (
                    <p className={styles.fieldError} role="alert">
                      {fieldErrors.timeZone}
                    </p>
                  )}
                </div>

                <div className={styles.profileField}>
                  <label htmlFor="jaf-phone" className={styles.fieldLabel}>
                    <span>Phone number</span>
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="jaf-phone"
                    type="tel"
                    placeholder="+1 213-456-7890"
                    className={`${styles.inputField} ${
                      fieldErrors.phone ? styles.inputFieldError : ''
                    }`}
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);

                      if (fieldErrors.phone) {
                        setFieldErrors(prev => {
                          const next = { ...prev };
                          delete next.phone;
                          return next;
                        });
                      }
                    }}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    autoComplete="tel"
                  />

                  {fieldErrors.phone && (
                    <p className={styles.fieldError} role="alert">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
                <div className={styles.profileField}>
                  <label htmlFor="jaf-company" className={styles.fieldLabel}>
                    Company &amp; position
                  </label>
                  <input
                    id="jaf-company"
                    type="text"
                    placeholder="Company & Position"
                    className={styles.inputField}
                    value={companyPosition}
                    onChange={e => setCompanyPosition(e.target.value)}
                    autoComplete="organization-title"
                  />
                </div>
                <div className={styles.profileField}>
                  <label htmlFor="jaf-social" className={styles.fieldLabel}>
                    Primary website / social
                  </label>
                  <input
                    id="jaf-social"
                    type="text"
                    placeholder="Primary Website/Social"
                    className={styles.inputField}
                    value={websiteSocial}
                    onChange={e => setWebsiteSocial(e.target.value)}
                    autoComplete="url"
                  />
                </div>
                <FileUploadField
                  id="jaf-resume-upload"
                  label={resumeRequired ? 'Upload Resume' : 'Upload Resume (optional)'}
                  accept=".pdf,.doc,.docx"
                  file={resumeFile}
                  onChange={handleResumeChange}
                  onClear={clearResumeFile}
                  inputRef={resumeInputRef}
                  optional={!resumeRequired}
                  required={resumeRequired}
                />
              </div>
              {visibleQuestions.map((q, idx) => {
                const qt = getQuestionType(q);
                const label = getQuestionLabel(q, idx);
                const labelLower = label.toLowerCase();
                const isIndividualOrgQuestion = isIndividualOrgQuestionLabel(label);
                const req = isQuestionRequired(q);
                const hasFieldError = Boolean(fieldErrors[idx]);
                const formKey = filteredForm?._id
                  ? `${filteredForm._id}-q-${idx}`
                  : `q-${idx}-${label.slice(0, 24)}`;

                return (
                  <div className={styles.formGroup} key={formKey}>
                    <h2 className={styles.formGroupTitle} id={`${formKey}-heading`}>
                      <span className={styles.questionNumber}>{idx + 1}.</span> {label}
                      {req && (
                        <>
                          <span className={styles.requiredMark} aria-hidden="true">
                            {' '}
                            *
                          </span>
                          <span className={styles.visuallyHidden}> (required)</span>
                        </>
                      )}
                    </h2>
                    {['textbox', 'text'].includes(qt) &&
                      !isJobApplicationFileUploadQuestion(q) &&
                      !isIndividualOrgQuestion && (
                        <>
                          <input
                            type="text"
                            placeholder={q.placeholder || 'Type your response here'}
                            value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                            onChange={e => handleAnswerChange(idx, e.target.value, label)}
                            required={req}
                            aria-required={req}
                            aria-labelledby={`${formKey}-heading`}
                            className={`${styles.inputField} ${
                              hasFieldError ? styles.inputFieldError : ''
                            }`}
                          />
                          {hasFieldError && (
                            <p className={styles.fieldError} role="alert">
                              {fieldErrors[idx]}
                            </p>
                          )}
                        </>
                      )}
                    {qt === 'textarea' && !isIndividualOrgQuestion && (
                      <>
                        <textarea
                          placeholder={q.placeholder || 'Type your response here'}
                          value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                          onChange={e => handleAnswerChange(idx, e.target.value, label)}
                          rows={5}
                          required={req}
                          aria-required={req}
                          aria-labelledby={`${formKey}-heading`}
                          className={`${styles.inputField} ${
                            hasFieldError ? styles.inputFieldError : ''
                          }`}
                        />
                        {hasFieldError && (
                          <p className={styles.fieldError} role="alert">
                            {fieldErrors[idx]}
                          </p>
                        )}
                      </>
                    )}
                    {(qt === 'date' ||
                      (labelLower.includes('start') && labelLower.includes('date'))) && (
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value, label)}
                        required={req}
                        aria-required={req}
                        aria-labelledby={`${formKey}-heading`}
                      />
                    )}
                    {qt === 'checkbox' && q.options && q.options.length > 0 && (
                      <fieldset
                        className={styles.optionFieldset}
                        aria-labelledby={`${formKey}-heading`}
                      >
                        {q.options.map(opt => (
                          <label key={String(opt)}>
                            <input
                              type="checkbox"
                              name={`question-${formKey}-${String(opt)}`}
                              value={opt}
                              checked={isCheckboxOptionChecked(answers[idx], opt)}
                              onChange={() => toggleCheckboxOption(idx, opt)}
                            />{' '}
                            {opt}
                          </label>
                        ))}
                      </fieldset>
                    )}
                    {qt === 'radio' &&
                      q.options &&
                      q.options.length > 0 &&
                      !isIndividualOrgQuestion && (
                        <fieldset
                          className={styles.optionFieldset}
                          aria-labelledby={`${formKey}-heading`}
                        >
                          {q.options.map(opt => (
                            <label key={String(opt)}>
                              <input
                                type="radio"
                                name={`question-${formKey}`}
                                value={opt}
                                checked={answers[idx] === opt}
                                onChange={() => handleAnswerChange(idx, opt)}
                              />{' '}
                              {opt}
                            </label>
                          ))}
                        </fieldset>
                      )}
                    {isIndividualOrgQuestion ? (
                      <fieldset
                        className={`${styles.optionFieldset} ${styles.optionFieldsetInline}`}
                        aria-labelledby={`${formKey}-heading`}
                      >
                        {(q.options?.length ? q.options : ['Individual', 'Organization']).map(
                          opt => (
                            <label key={String(opt)}>
                              <input
                                type="radio"
                                name={`question-${formKey}`}
                                value={opt}
                                checked={answers[idx] === opt}
                                onChange={() => handleAnswerChange(idx, opt, label)}
                                required={req}
                              />{' '}
                              {opt}
                            </label>
                          ),
                        )}
                      </fieldset>
                    ) : (
                      qt === 'dropdown' && (
                        <select
                          className={styles.selectField}
                          value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                          onChange={e => handleAnswerChange(idx, e.target.value, label)}
                          required={req}
                          aria-required={req}
                          aria-labelledby={`${formKey}-heading`}
                        >
                          <option value="">Select an option</option>
                          {(q.options || []).map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )
                    )}
                    {isJobApplicationFileUploadQuestion(q) && (
                      <FileUploadField
                        id={`${formKey}-file`}
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        file={questionFiles[idx] || null}
                        onChange={e => handleQuestionFileChange(idx, e)}
                        onClear={() => clearQuestionFile(idx)}
                        inputRef={el => {
                          questionFileInputRefs.current[idx] = el;
                        }}
                        required={req}
                      />
                    )}
                    {![
                      'textbox',
                      'text',
                      'textarea',
                      'date',
                      'checkbox',
                      'radio',
                      'dropdown',
                    ].includes(qt) &&
                      !isJobApplicationFileUploadQuestion(q) &&
                      !isIndividualOrgQuestion && (
                        <input
                          type="text"
                          placeholder="Type your response here"
                          value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                          onChange={e => handleAnswerChange(idx, e.target.value, label)}
                          required={req}
                          aria-required={req}
                          aria-labelledby={`${formKey}-heading`}
                          className={styles.inputField}
                        />
                      )}
                  </div>
                );
              })}
              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit your application'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

const requirementsPropType = PropTypes.shape({
  reactExperience: PropTypes.bool,
  twoMonthsCommitment: PropTypes.bool,
  javascriptExperience: PropTypes.bool,
  timeZoneLocation: PropTypes.bool,
  tenHoursPerWeek: PropTypes.bool,
});

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M11.6667 3.5L5.25 9.91667L2.33334 7"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function RequirementsSection({
  requirements,
  darkMode,
  variant = 'admin',
  interactive = false,
  onToggle,
}) {
  const baseClass =
    variant === 'user' ? styles.userRequirementsSection : styles.adminRequirementsSection;
  const sectionClass = interactive
    ? `${baseClass} ${styles.requirementsSectionInteractive}`
    : baseClass;
  const requirementList = REQUIREMENT_ITEMS.map(({ id, label }) => ({
    id,
    label,
    satisfied: !!requirements[id],
  }));

  return (
    <div className={sectionClass}>
      <h3 className={styles.requirementsTitle}>Requirements Status</h3>
      <div className={styles.requirementsList}>
        {requirementList.map(req => (
          <div key={req.id} className={styles.requirementItem}>
            <label className={styles.requirementCheckbox}>
              <input
                type="checkbox"
                className={styles.requirementCheckboxInput}
                checked={req.satisfied}
                onChange={interactive && onToggle ? () => onToggle(req.id) : undefined}
                disabled={!interactive}
              />
              <span
                className={`${styles.requirementCheckboxCustom} ${
                  req.satisfied ? styles.checked : ''
                }`}
              >
                {req.satisfied && <CheckIcon />}
              </span>
              <span style={{ color: darkMode ? '#ffffff' : undefined }}>{req.label}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
RequirementsSection.propTypes = {
  requirements: requirementsPropType.isRequired,
  darkMode: PropTypes.bool,
  variant: PropTypes.oneOf(['admin', 'user']),
  interactive: PropTypes.bool,
  onToggle: PropTypes.func,
};
RequirementsSection.defaultProps = {
  darkMode: false,
  variant: 'admin',
  interactive: false,
  onToggle: undefined,
};

export default JobApplicationForm;

/* const validateEmail = email => {
    if (!email.trim()) return 'Email is required.';

    if (!email.includes('@') || !email.includes('.')) {
      return 'Please enter a valid email address.';
    }

    return '';
  };

  const validatePhone = phone => {
    if (!phone.trim()) return 'Phone number is required.';
    try {
      const phoneNumber = parsePhoneNumberFromString(phone);
      if (!phoneNumber?.isPossible()) {
        return 'Please enter a valid phone number format (e.g., +1 213-456-7890).';
      }
    } catch {
      return 'Invalid phone number format.';
    }
    return '';
  };

  const validateLocation = value => {
    if (!value.trim()) return 'Location is required.';
    if (!/^[a-zA-Z\s,.-]{3,}$/.test(value)) {
      return 'Please enter a valid location (e.g., City, Country).';
    }
    return '';
  };

  const validateTimeZone = tz => {
    if (!tz) return 'Time zone is required.';
    return '';
  };

  const validateAllFields = () => {
    const newErrors = {};

    const emailError = validateEmail(applicantEmail);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(phone);
    if (phoneError) newErrors.phone = phoneError;

    const locationError = validateLocation(location);
    if (locationError) newErrors.location = locationError;

    const tzError = validateTimeZone(timeZone);
    if (tzError) newErrors.timeZone = tzError;

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }

    return newErrors;
  };

  const visibleQuestions = useMemo(() => {
    const seen = new Set(); */
