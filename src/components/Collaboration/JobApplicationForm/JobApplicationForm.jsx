import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  return q.isRequired === true || q.required === true;
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

  const darkMode = useSelector(state => state.theme?.darkMode);

  const visibleQuestions = useMemo(
    () => (filteredForm?.questions ?? []).filter(q => q.visible !== false),
    [filteredForm],
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchForms() {
      try {
        const res = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
        if (cancelled) return;
        const formsArr = Array.isArray(res.data.forms) ? res.data.forms : [];
        setForms(formsArr);

        const navTitle = getJobTitleFromNavigation(location);
        const navState = { ...location.state, jobTitle: navTitle || location.state?.jobTitle };
        const chosen = pickInitialForm(formsArr, navState);
        if (navTitle && !findFormForJobTitle(formsArr, navTitle)) {
          toast.warn(
            `No application form matched "${navTitle}". Pick the correct role from the dropdown or enter the exact form title.`,
            { autoClose: 8000 },
          );
        }
        if (chosen) {
          setSelectedJob(chosen.title);
          setFilteredForm(chosen);
          if (navTitle) {
            setJobTitleInput(navTitle);
            setBannerJobTitle(navTitle);
          } else {
            setBannerJobTitle(chosen.title);
          }
          const n = (chosen.questions ?? []).filter(q => q.visible !== false).length;
          setAnswers(new Array(n).fill(''));
        } else {
          setSelectedJob('');
          setFilteredForm(null);
          setAnswers([]);
          setBannerJobTitle('');
        }
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
  }, [location.key]);

  useEffect(() => {
    if (!selectedJob) return;
    const form = forms.find(f => f.title === selectedJob);
    setFilteredForm(form);
    const n = (form?.questions ?? []).filter(q => q.visible !== false).length;
    setAnswers(new Array(n).fill(''));
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

  const validateBeforeSubmit = () => {
    const missing = [];
    if (!applicantName.trim()) missing.push('Name');
    if (!applicantEmail.trim()) missing.push('Email');

    if (visibleQuestions.length) {
      for (const [idx, q] of visibleQuestions.entries()) {
        if (isQuestionRequired(q) && !String(answers[idx] ?? '').trim()) {
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
    setAnswers(new Array(visibleQuestions.length).fill(''));
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
            FORM FOR {(bannerJobTitle || selectedJob || '').toUpperCase()} POSITION
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
            <div>
              Here is a questionnaire to apply to work with us. To complete your application and
              schedule a Zoom interview, please answer the pre-interview questions below.
            </div>
            <div className={styles.formContentGroup}>
              <div className={styles.formProfileDetailGroup}>
                <input
                  type="text"
                  placeholder="Name"
                  className={styles.inputField}
                  value={applicantName}
                  onChange={e => setApplicantName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className={styles.inputField}
                  value={applicantEmail}
                  onChange={e => setApplicantEmail(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Location & Timezone"
                  className={styles.inputField}
                  value={locationTimezone}
                  onChange={e => setLocationTimezone(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className={styles.inputField}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Company & Position"
                  className={styles.inputField}
                  value={companyPosition}
                  onChange={e => setCompanyPosition(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Primary Website/Social"
                  className={styles.inputField}
                  value={websiteSocial}
                  onChange={e => setWebsiteSocial(e.target.value)}
                />
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
                const formKey = filteredForm?._id
                  ? `${filteredForm._id}-q-${idx}`
                  : `q-${idx}-${label.slice(0, 24)}`;

                return (
                  <div className={styles.formGroup} key={formKey}>
                    <h2>
                      {idx + 1}. {label}
                    </h2>
                    {['textbox', 'text'].includes(qt) && (
                      <input
                        type="text"
                        placeholder={q.placeholder || 'Type your response here'}
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                      />
                    )}
                    {qt === 'textarea' && (
                      <textarea
                        placeholder={q.placeholder || 'Type your response here'}
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                        rows={5}
                      />
                    )}
                    {qt === 'date' && (
                      <input
                        type="date"
                        className={styles.dateInput}
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                      />
                    )}
                    {['checkbox', 'radio'].includes(qt) && q.options && q.options.length > 0 && (
                      <div>
                        {q.options.map(opt => (
                          <label key={opt}>
                            <input
                              type={qt === 'checkbox' ? 'checkbox' : 'radio'}
                              name={`question-${formKey}`}
                              value={opt}
                              checked={answers[idx] === opt}
                              onChange={() => handleAnswerChange(idx, opt)}
                            />{' '}
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {qt === 'dropdown' && (
                      <select
                        className={styles.selectField}
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
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
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
              <button type="submit" className={styles.submitButton}>
                Proceed to submit with details
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default JobApplicationForm;
