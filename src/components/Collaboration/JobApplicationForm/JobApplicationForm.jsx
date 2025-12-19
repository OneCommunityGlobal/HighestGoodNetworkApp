// ...existing code...
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './JobApplicationForm.module.css';
import OneCommunityImage from '../../../assets/images/logo2.png';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [jobDataFromRedirect, setJobDataFromRedirect] = useState(null);
  // Additional fields for requirements checking
  const [fullTimeYears, setFullTimeYears] = useState('');
  const [monthsVolunteer, setMonthsVolunteer] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [roleSkills, setRoleSkills] = useState('');

  const darkMode = useSelector(state => state.theme?.darkMode);
  const isAdmin = useSelector(state => {
    try {
      const user = state?.auth?.user;
      const role = user?.role;
      return (
        role === 'Administrator' ||
        role === 'Owner' ||
        role === 'admin' ||
        role === 'ADMINISTRATOR' ||
        role === 'OWNER'
      );
    } catch (error) {
      return false;
    }
  });

  // Get job data from redirect
  useEffect(() => {
    if (location.state) {
      setJobDataFromRedirect(location.state);
      if (location.state.jobTitle) {
        setJobTitleInput(location.state.jobTitle);
      }
    }
  }, [location.state]);

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
        const formsArr = Array.isArray(res.data.forms) ? res.data.forms : [];
        setForms(formsArr);
        
        // If we have job data from redirect, try to match it
        if (jobDataFromRedirect?.jobTitle) {
          const matchedForm = formsArr.find(
            f => f.title?.toLowerCase() === jobDataFromRedirect.jobTitle?.toLowerCase()
          );
          if (matchedForm) {
            setSelectedJob(matchedForm.title);
            setFilteredForm(matchedForm);
            setAnswers(new Array((matchedForm.questions ?? []).length).fill(''));
            return;
          }
        }
        
        const firstWithQuestions = formsArr.find(f => f.questions && f.questions.length > 0);
        if (firstWithQuestions) {
          setSelectedJob(firstWithQuestions.title);
          setFilteredForm(firstWithQuestions);
          setAnswers(new Array((firstWithQuestions.questions ?? []).length).fill(''));
        } else if (formsArr.length > 0) {
          setSelectedJob(formsArr[0].title);
          setFilteredForm(formsArr[0]);
          setAnswers(new Array((formsArr[0].questions ?? []).length).fill(''));
        }
      } catch (err) {
        setForms([]);
        setSelectedJob('');
        setFilteredForm(null);
        setAnswers([]);
        toast.error('Failed to load job forms.');
      }
    }
    fetchForms();
  }, [jobDataFromRedirect]);

  useEffect(() => {
    if (!selectedJob) return;
    const form = forms.find(f => f.title === selectedJob);
    setFilteredForm(form);
    setAnswers(new Array((form?.questions ?? []).length).fill(''));
  }, [selectedJob, forms]);

  const handleJobChange = e => {
    setSelectedJob(e.target.value);
  };

  const handleJobTitleInputChange = e => {
    setJobTitleInput(e.target.value);
  };

  const handleGoClick = () => {
    const form = forms.find(f => f.title?.toLowerCase() === jobTitleInput.trim().toLowerCase());
    if (form) {
      setSelectedJob(form.title);
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

  const handleResumeChange = e => {
    const f = e.target.files?.[0] || null;
    setResumeFile(f);
  };

  // Check if requirements are satisfied (for admin view) - matching reference implementation
  const checkRequirements = () => {
    const requirements = {
      reactExperience: false,
      twoMonthsCommitment: false,
      javascriptExperience: false,
      timeZoneLocation: false,
      tenHoursPerWeek: false,
    };

    // Check 1+ years of Full-Time ReactJS Experience
    const reactKeywords = ['react', 'reactjs', 'react.js'];
    const roleSkillsLower = (roleSkills || '').toLowerCase();
    requirements.reactExperience =
      (fullTimeYears && parseFloat(fullTimeYears) >= 1) ||
      reactKeywords.some(keyword => roleSkillsLower.includes(keyword));

    // Check Minimum of 2 Months Commitment
    requirements.twoMonthsCommitment =
      monthsVolunteer && parseFloat(monthsVolunteer) >= 2;

    // Check 1+ years of Full-Time JavaScript Experience
    requirements.javascriptExperience = fullTimeYears && parseFloat(fullTimeYears) >= 1;

    // Check Time Zone and Location Matches
    requirements.timeZoneLocation = !!(locationTimezone && locationTimezone.trim());

    // Check Minimum of 10 hours of work a week
    requirements.tenHoursPerWeek = hoursPerWeek && parseFloat(hoursPerWeek) >= 10;

    return requirements;
  };

  // Helper function to strip HTML tags and clean text
  const stripHtml = html => {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const text = doc.body.textContent || doc.body.innerText || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
      return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }
  };

  const validateBeforeSubmit = () => {
    const missing = [];
    if (!applicantName.trim()) missing.push('Name');
    if (!applicantEmail.trim()) missing.push('Email');

    if (filteredForm?.questions?.length) {
      for (const [idx, q] of filteredForm.questions.entries()) {
        const required = q.required ?? false;
        if (required && !String(answers[idx] ?? '').trim()) {
          missing.push(q.label || q.questionText || `Question ${idx + 1}`);
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
    setAnswers(new Array((filteredForm?.questions ?? []).length).fill(''));
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
          <header className={styles.jaHeader}>
            <h1 className={styles.jaTitle}>Job Application – {selectedJob || 'General Position'}</h1>
            {(jobDataFromRedirect?.jobDescription || filteredForm?.description) && (
              <p className={styles.jaDesc}>
                {stripHtml(jobDataFromRedirect?.jobDescription || filteredForm?.description || '')}
              </p>
            )}
          </header>
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
                <h2>{filteredForm.title}</h2>
                <p>{filteredForm.description || 'No description available.'}</p>
              </div>
            </div>
          )}
          <form className={styles.form} onSubmit={handleSubmit}>
            {/* Requirements Section - Shows checkboxes only in admin view */}
            {isAdmin && <RequirementsSection requirements={checkRequirements()} darkMode={darkMode} />}
            
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
              <div className={styles.formGroup}>
                <h2>1. How did you hear about One Community?</h2>
                <input type="text" placeholder="Type your response here" />
              </div>
              <div className={styles.formGroup}>
                <h2>2. Are you applying as an individual or organization?</h2>
                <input type="text" placeholder="Type your response here" />
              </div>
              <div className={styles.formGroup}>
                <h2>3. Why are you wanting to volunteer/work/collaborate with us?</h2>
                <input type="text" placeholder="Type your response here" />
              </div>
              <div className={styles.formGroup}>
                <h2>4. What skills/experience do you possess?</h2>
                <input
                  type="text"
                  placeholder="Type your response here"
                  value={roleSkills}
                  onChange={e => setRoleSkills(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <h2>5. How many volunteer hours per week are you willing to commit to?</h2>
                <input
                  type="number"
                  min="0"
                  placeholder="Type your response here"
                  value={hoursPerWeek}
                  onChange={e => setHoursPerWeek(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <h2>6. For how long do you wish to volunteer with us? (Enter your answer in months)</h2>
                <input
                  type="number"
                  min="0"
                  placeholder="Type your response here"
                  value={monthsVolunteer}
                  onChange={e => setMonthsVolunteer(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <h2>How Many Years of FULL TIME experience do you have?</h2>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter years of experience"
                  value={fullTimeYears}
                  onChange={e => setFullTimeYears(e.target.value)}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.formGroup}>
                <h2>7. What is your desired start date?</h2>
                <input type="date" className={styles.dateInput} />
              </div>
              <div className={styles.formGroup}>
                <h2>8. Will your volunteer time require documentation of your hours?</h2>
                <select className={styles.selectField}>
                  <option value="">Select an appropriate option</option>
                  <option value="Yes, I'm volunteering just because I want to">
                    Yes, I&apos;m volunteering just because I want to
                  </option>
                  <option value="Yes, I'm on OPT and don't yet have my EAD Card">
                    Yes, I&apos;m on OPT and don&apos;t yet have my EAD Card
                  </option>
                  <option value="Yes, I'm on OPT and this time is for CPT, Co-op, or similar">
                    Yes, I&apos;m on OPT and this time is for CPT, Co-op, or similar
                  </option>
                  <option value="STEM OPT: Sorry, we are 100% volunteer and don't qualify">
                    STEM OPT: Sorry, we are 100% volunteer and don&apos;t qualify
                  </option>
                </select>
              </div>
              {filteredForm &&
                (filteredForm.questions || []).map((q, idx) => (
                  <div className={styles.formGroup} key={q._id?.$oid || q._id || idx}>
                    <h2>{q.label || q.questionText}</h2>
                    {q.type === 'text' || q.questionType === 'textbox' ? (
                      <input
                        type="text"
                        placeholder="Type your response here"
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                      />
                    ) : null}
                    {q.type === 'textarea' || q.questionType === 'textarea' ? (
                      <textarea
                        placeholder="Type your response here"
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                      />
                    ) : null}
                    {q.type === 'date' || q.questionType === 'date' ? (
                      <input
                        type="date"
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                      />
                    ) : null}
                    {['checkbox', 'radio'].includes(q.type || q.questionType) && q.options && (
                      <div>
                        {q.options.map(opt => (
                          <label key={opt}>
                            <input
                              type={q.type || q.questionType}
                              name={`question-${idx}`}
                              value={opt}
                              checked={answers[idx] === opt}
                              onChange={() => handleAnswerChange(idx, opt)}
                            />{' '}
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {q.type === 'dropdown' || q.questionType === 'dropdown' ? (
                      <select
                        value={answers[idx] || ''}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                      >
                        <option value="">Select an option</option>
                        {q.options &&
                          q.options.map(opt => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    ) : null}
                  </div>
                ))}
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

/* Requirements Section Component */
function RequirementsSection({ requirements, darkMode }) {
  const requirementList = [
    {
      id: 'reactExperience',
      label: '1+ years of Full-Time ReactJS Experience',
      satisfied: requirements.reactExperience,
    },
    {
      id: 'twoMonthsCommitment',
      label: 'Minimum of 2 Months Commitment',
      satisfied: requirements.twoMonthsCommitment,
    },
    {
      id: 'javascriptExperience',
      label: '1+ years of Full-Time JavaScript Experience',
      satisfied: requirements.javascriptExperience,
    },
    {
      id: 'timeZoneLocation',
      label: 'Time Zone and Location Matches',
      satisfied: requirements.timeZoneLocation,
    },
    {
      id: 'tenHoursPerWeek',
      label: 'Minimum of 10 hours of work a week',
      satisfied: requirements.tenHoursPerWeek,
    },
  ];

  return (
    <div className={styles.adminRequirementsSection}>
      <h3 className={styles.requirementsTitle}>Requirements Status</h3>
      <div className={styles.requirementsList}>
        {requirementList.map(req => (
          <div key={req.id} className={styles.requirementItem}>
            <label className={styles.requirementCheckbox}>
              <input
                type="checkbox"
                className={styles.requirementCheckboxInput}
                checked={req.satisfied}
                readOnly
                disabled
              />
              <span className={`${styles.requirementCheckboxCustom} ${req.satisfied ? styles.checked : ''}`}>
                {req.satisfied && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span style={{ color: darkMode ? '#ffffff' : undefined }}>{req.label}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobApplicationForm;
