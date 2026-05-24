import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import styles from './JobApplicationForm.module.css';
import OneCommunityImage from '../../../assets/images/logo2.png';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  return m || null;
}

/** Role clicked on the job board: React Router state and/or ?jobTitle= query (reliable across redirects). */
function getJobTitleFromNavigation(location) {
  const fromState = location.state?.jobTitle;
  if (fromState != null && String(fromState).trim()) return String(fromState).trim();
  const q = new URLSearchParams(location.search || '');
  const fromQuery = q.get('jobTitle') || q.get('role');
  if (fromQuery != null && String(fromQuery).trim()) return String(fromQuery).trim();
  return '';
}

function pickInitialForm(formsArr, navState) {
  if (!formsArr?.length) return null;
  if (navState?.jobTitle) {
    const matched = findFormForJobTitle(formsArr, navState.jobTitle);
    if (matched) return matched;
  }
  return formsArr.find(f => f.questions?.length) || formsArr[0];
}

function parseFormsResponse(res) {
  return Array.isArray(res.data.forms) ? res.data.forms : [];
}

function resolveNavigationJobTitle(jobDataFromRedirect, location) {
  return (
    (jobDataFromRedirect?.jobTitle && String(jobDataFromRedirect.jobTitle).trim()) ||
    getJobTitleFromNavigation(location)
  );
}

function notifyInitialFormSelection(navTitle, formMatch, chosen) {
  if (!navTitle || formMatch) return;
  if (chosen) {
    toast.info(
      `Could not match "${navTitle}" to a form title. Showing "${chosen.title}" — pick another role from the dropdown if this is not the right application.`,
      { autoClose: 7000 },
    );
    return;
  }
  toast.warn('No application form is available. Please contact support or try again later.');
}

function getInitialFormState(chosen, navTitle) {
  if (!chosen) {
    return {
      selectedJob: '',
      filteredForm: null,
      answers: [],
      bannerJobTitle: '',
      jobTitleInput: null,
    };
  }
  return {
    selectedJob: chosen.title,
    filteredForm: chosen,
    answers: initialAnswersForQuestions(getVisibleQuestionsForForm(chosen)),
    bannerJobTitle: navTitle || chosen.title,
    jobTitleInput: navTitle || null,
  };
}

function getQuestionType(q) {
  return String(q.questionType || q.type || '').toLowerCase();
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

function getQuestionLabel(q, idx) {
  const raw = (q.label || q.questionText || '').trim();
  if (!raw) return `Question ${idx + 1}`;
  const cleaned = stripLeadingQuestionEnumeration(raw);
  return cleaned || raw;
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
  const filtered = form.questions.filter(q => q.visible !== false);
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

const REQUIREMENT_ITEMS = [
  { id: 'reactExperience', label: '1+ years of Full-Time ReactJS Experience' },
  { id: 'twoMonthsCommitment', label: 'Minimum of 2 Months Commitment' },
  { id: 'javascriptExperience', label: '1+ years of Full-Time JavaScript Experience' },
  { id: 'timeZoneLocation', label: 'Time Zone and Location Matches' },
  { id: 'tenHoursPerWeek', label: 'Minimum of 10 hours of work a week' },
];

function JobApplicationForm() {
  const location = useLocation();
  const [forms, setForms] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [answers, setAnswers] = useState([]);
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [filteredForm, setFilteredForm] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [locationTimezone, setLocationTimezone] = useState('');
  const [phone, setPhone] = useState('');
  const [companyPosition, setCompanyPosition] = useState('');
  const [websiteSocial, setWebsiteSocial] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const resumeInputRef = useRef(null);
  /** Shown in the page title — the role the user clicked, not only the matched DB form name. */
  const [bannerJobTitle, setBannerJobTitle] = useState('');
  const [jobDataFromRedirect, setJobDataFromRedirect] = useState(null);
  const [fullTimeYears, setFullTimeYears] = useState('');
  const [monthsVolunteer, setMonthsVolunteer] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [roleSkills, setRoleSkills] = useState('');
  /** Owner/Admin: optional manual toggles on top of auto-calculated requirement flags. */
  const [requirementPreviewOverrides, setRequirementPreviewOverrides] = useState({});

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

  /* Global back-to-top lives outside #root in index.html; hide it on this long form page. */
  useEffect(() => {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return undefined;
    const prev = btn.style.display;
    btn.style.display = 'none';
    return () => {
      btn.style.display = prev;
    };
  }, []);

  /*
   * Match html/body/#root to the page strip. Global #root is white; dark mode uses !important —
   * route class + :global rules in the module CSS set backgrounds with !important while mounted.
   */
  useEffect(() => {
    const c = 'job-application-route';
    document.documentElement.classList.add(c);
    document.body.classList.add(c);
    return () => {
      document.documentElement.classList.remove(c);
      document.body.classList.remove(c);
    };
  }, []);

  const visibleQuestions = useMemo(() => getVisibleQuestionsForForm(filteredForm), [filteredForm]);

  const applyQuestionnairePreFill = data => {
    if (!data) return;
    if (data.name) setApplicantName(data.name);
    if (data.email) setApplicantEmail(data.email);
    if (data.locationTimezone) setLocationTimezone(data.locationTimezone);
    if (data.phone) setPhone(data.phone);
    if (data.fullTimeYears) setFullTimeYears(data.fullTimeYears);
    if (data.monthsVolunteer) setMonthsVolunteer(data.monthsVolunteer);
    if (data.hoursPerWeek) setHoursPerWeek(data.hoursPerWeek);
    if (data.roleSkills) setRoleSkills(data.roleSkills);
  };

  const fetchUserQuestionnaireData = async referralId => {
    try {
      const response = await axios.get(`${ENDPOINTS.GET_USER_QUESTIONNAIRE}/${referralId}`);
      if (response.data) {
        applyQuestionnairePreFill(response.data);
      }
    } catch (error) {
      console.error('Error fetching user questionnaire data:', error);
    }
  };

  const fetchJobData = async jobId => {
    try {
      const response = await axios.get(`${ENDPOINTS.GET_JOB}/${jobId}`);
      if (response.data) {
        setJobDataFromRedirect({
          jobId: response.data._id,
          jobTitle: response.data.title,
          jobDescription: response.data.description || '',
          requirements: response.data.requirements || [],
          category: response.data.category || 'General',
        });
        if (response.data.title) {
          setJobTitleInput(response.data.title);
        }
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
      toast.error('Failed to load job details');
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const referralId = searchParams.get('ref') || searchParams.get('referral');
    const jobIdParam = searchParams.get('jobId');
    const pathJobId = location.pathname.split('/').pop();
    const jobId = jobIdParam || (pathJobId && pathJobId !== 'job-application' ? pathJobId : null);

    if (referralId && isValidId(referralId)) {
      fetchUserQuestionnaireData(referralId);
    }

    if (location.state) {
      setJobDataFromRedirect(location.state);
      if (location.state.jobTitle) {
        setJobTitleInput(location.state.jobTitle);
      }
    } else if (jobId && isValidId(jobId)) {
      fetchJobData(jobId);
    }
  }, [location.state, location.search, location.pathname]);

  useEffect(() => {
    let cancelled = false;

    async function fetchForms() {
      try {
        const res = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
        if (cancelled) return;
        const formsArr = parseFormsResponse(res);
        setForms(formsArr);

        const navTitle = resolveNavigationJobTitle(jobDataFromRedirect, location);
        const navState = { ...location.state, jobTitle: navTitle || location.state?.jobTitle };
        const formMatch = navTitle ? findFormForJobTitle(formsArr, navTitle) : null;
        const chosen = pickInitialForm(formsArr, navState);
        notifyInitialFormSelection(navTitle, formMatch, chosen);

        const initial = getInitialFormState(chosen, navTitle);
        setSelectedJob(initial.selectedJob);
        setFilteredForm(initial.filteredForm);
        setAnswers(initial.answers);
        setBannerJobTitle(initial.bannerJobTitle);
        if (initial.jobTitleInput) setJobTitleInput(initial.jobTitleInput);
      } catch (err) {
        if (!cancelled) {
          setForms([]);
          setSelectedJob('');
          setFilteredForm(null);
          setAnswers([]);
          toast.error('Failed to load job forms.');
        }
      }
    }

    fetchForms();
    return () => {
      cancelled = true;
    };
  }, [location.key, jobDataFromRedirect]);

  useEffect(() => {
    if (!selectedJob) return;
    const form = forms.find(f => f.title === selectedJob);
    setFilteredForm(form);
    const qs = getVisibleQuestionsForForm(form);
    setAnswers(initialAnswersForQuestions(qs));
  }, [selectedJob, forms]);

  const handleJobChange = e => {
    const next = e.target.value;
    setSelectedJob(next);
    setBannerJobTitle(next);
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
    let form = forms.find(f => f.title?.toLowerCase() === raw.toLowerCase());
    if (!form) form = findFormForJobTitle(forms, raw);
    if (form) {
      setSelectedJob(form.title);
      setBannerJobTitle(form.title);
    } else {
      toast.info('No form matches that job title.');
    }
  };

  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
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

  const handleShowDescription = e => {
    e.preventDefault();
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
    setResumeFile(f);
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
    const missing = [];
    if (!applicantName.trim()) missing.push('Name');
    if (!applicantEmail.trim()) missing.push('Email');

    if (visibleQuestions.length) {
      for (const [idx, q] of visibleQuestions.entries()) {
        if (isQuestionRequired(q) && isAnswerEmpty(answers[idx], q)) {
          missing.push(getQuestionLabel(q, idx));
        }
      }
    }

    return missing;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const missing = validateBeforeSubmit();
    if (missing.length > 0) {
      toast.error(`Please complete required fields: ${missing.join(', ')}`, { autoClose: 7000 });
      return;
    }

    toast.success('Application submitted. A copy will be sent to your email.');

    setApplicantName('');
    setApplicantEmail('');
    setLocationTimezone('');
    setPhone('');
    setCompanyPosition('');
    setWebsiteSocial('');
    setResumeFile(null);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
    setFullTimeYears('');
    setMonthsVolunteer('');
    setHoursPerWeek('');
    setRoleSkills('');
    setAnswers(initialAnswersForQuestions(visibleQuestions));
    setRequirementPreviewOverrides({});
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
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
            <select className={styles.jobSelect} value={selectedJob} onChange={handleJobChange}>
              {forms.map(form => (
                <option key={form._id || form.id} value={form.title}>
                  {form.title}
                </option>
              ))}
            </select>
          </div>
        </section>
        <section className={styles.formContainer}>
          <h1 className={styles.formTitle}>
            Job Application – {(bannerJobTitle || selectedJob || 'this role').trim()}
          </h1>
          <p className={styles.formSubtitle}>
            <a href="#learnMore" onClick={handleShowDescription}>
              Click to know more about this position
            </a>
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
                  <label htmlFor="jaf-applicant-name" className={styles.fieldLabel}>
                    <span>Name</span>
                    <span className={styles.requiredMark} aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="jaf-applicant-name"
                    type="text"
                    placeholder="Name"
                    className={styles.inputField}
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    required
                    aria-required="true"
                    autoComplete="name"
                  />
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
                    type="email"
                    placeholder="Email"
                    className={styles.inputField}
                    value={applicantEmail}
                    onChange={e => setApplicantEmail(e.target.value)}
                    required
                    aria-required="true"
                    autoComplete="email"
                  />
                </div>
                <div className={styles.profileField}>
                  <label htmlFor="jaf-location-tz" className={styles.fieldLabel}>
                    Location &amp; timezone
                  </label>
                  <input
                    id="jaf-location-tz"
                    type="text"
                    placeholder="Location & Timezone"
                    className={styles.inputField}
                    value={locationTimezone}
                    onChange={e => setLocationTimezone(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.profileField}>
                  <label htmlFor="jaf-phone" className={styles.fieldLabel}>
                    Phone number
                  </label>
                  <input
                    id="jaf-phone"
                    type="text"
                    placeholder="Phone Number"
                    className={styles.inputField}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
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
                <label className={styles.resumeLabel}>
                  Upload Resume (optional)
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                  />
                </label>
              </div>
              {visibleQuestions.map((q, idx) => {
                const qt = getQuestionType(q);
                const label = getQuestionLabel(q, idx);
                const req = isQuestionRequired(q);
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
                    {['textbox', 'text'].includes(qt) && (
                      <input
                        type="text"
                        placeholder={q.placeholder || 'Type your response here'}
                        value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                        required={req}
                        aria-required={req}
                        aria-labelledby={`${formKey}-heading`}
                        className={styles.inputField}
                      />
                    )}
                    {qt === 'textarea' && (
                      <textarea
                        placeholder={q.placeholder || 'Type your response here'}
                        value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                        rows={5}
                        required={req}
                        aria-required={req}
                        aria-labelledby={`${formKey}-heading`}
                        className={styles.inputField}
                      />
                    )}
                    {qt === 'date' && (
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
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
                    {qt === 'radio' && q.options && q.options.length > 0 && (
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
                    {qt === 'dropdown' && (
                      <select
                        className={styles.selectField}
                        value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
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
                    )}
                    {![
                      'textbox',
                      'text',
                      'textarea',
                      'date',
                      'checkbox',
                      'radio',
                      'dropdown',
                    ].includes(qt) && (
                      <input
                        type="text"
                        placeholder="Type your response here"
                        value={Array.isArray(answers[idx]) ? '' : answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                        required={req}
                        aria-required={req}
                        aria-labelledby={`${formKey}-heading`}
                        className={styles.inputField}
                      />
                    )}
                  </div>
                );
              })}
              <button type="submit" className={styles.submitButton}>
                Submit your application
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
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
