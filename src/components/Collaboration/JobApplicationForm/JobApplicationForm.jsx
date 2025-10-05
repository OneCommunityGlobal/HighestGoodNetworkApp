import React, { useState, useEffect } from 'react';
import styles from './JobApplicationForm.module.css';
import OneCommunityImage from '../../../assets/images/logo2.png';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { useSelector } from 'react-redux';

function JobApplicationForm() {
  const [forms, setForms] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [answers, setAnswers] = useState([]);
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [filteredForm, setFilteredForm] = useState(null);
  const [showDescription, setShowDescription] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);

  // Fetch all job forms on mount
  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
        console.log('API Response:', res.data);
        const formsArr = Array.isArray(res.data.forms) ? res.data.forms : [];
        setForms(formsArr);
        // Log all forms and their titles
        console.log('All forms:', formsArr);
        formsArr.forEach(f => console.log('Form title:', f.title));
        // Set first job with questions as default
        const firstWithQuestions = formsArr.find(f => f.questions && f.questions.length > 0);
        if (firstWithQuestions) {
          setSelectedJob(firstWithQuestions.title);
          setFilteredForm(firstWithQuestions);
          setAnswers(Array((firstWithQuestions.questions || []).length).fill(''));
        } else if (formsArr.length > 0) {
          setSelectedJob(formsArr[0].title);
          setFilteredForm(formsArr[0]);
          setAnswers(Array((formsArr[0].questions || []).length).fill(''));
        }
      } catch (err) {
        setForms([]);
        setSelectedJob('');
        setFilteredForm(null);
        setAnswers([]);
        console.error('Error fetching forms:', err);
      }
    }
    fetchForms();
  }, []);

  // Update filteredForm and answers when selectedJob changes
  useEffect(() => {
    if (!selectedJob) return;
    const form = forms.find(f => f.title === selectedJob);
    setFilteredForm(form);
    setAnswers(Array((form?.questions || []).length).fill(''));
  }, [selectedJob, forms]);

  const handleJobChange = e => {
    setSelectedJob(e.target.value);
  };

  const handleJobTitleInputChange = e => {
    setJobTitleInput(e.target.value);
  };

  const handleGoClick = () => {
    const form = forms.find(f => f.title.toLowerCase() === jobTitleInput.trim().toLowerCase());
    if (form) {
      setSelectedJob(form.title);
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
            <button className="btn btn-secondary" onClick={handleGoClick}>
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
          <h1 className={styles.formTitle}>FORM FOR {selectedJob?.toUpperCase()} POSITION</h1>
          <p className={styles.formSubtitle}>
            <a href="#learnMore" onClick={handleShowDescription}>
              Click to know more about this position
            </a>
          </p>
          {/* Popup for job description */}
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

          <form className={styles.form}>
            <div>
              Here is a questionnaire to apply to work with us. To complete your application and
              schedule a Zoom interview, please answer the pre-interview questions below.
            </div>
            <div className={styles.formContentGroup}>
              {/* These questions stay the same and are necessary */}
              <div className={styles.formProfileDetailGroup}>
                <input type="text" placeholder="Name" className={styles.inputField} />
                <input type="email" placeholder="Email" className={styles.inputField} />
                <input
                  type="text"
                  placeholder="Location & Timezone"
                  className={styles.inputField}
                />
                <input type="text" placeholder="Phone Number" className={styles.inputField} />
                <input type="text" placeholder="Company & Position" className={styles.inputField} />
                <input
                  type="text"
                  placeholder="Primary Website/Social"
                  className={styles.inputField}
                />
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
                <input type="text" placeholder="Type your response here" />
              </div>
              <div className={styles.formGroup}>
                <h2>5. How many volunteer hours per week are you willing to commit to?</h2>
                <input type="text" placeholder="Type your response here" />
              </div>
              <div className={styles.formGroup}>
                <h2>6. For how long do you wish to volunteer with us?</h2>
                <input type="text" placeholder="Type your response here" />
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
              {/* Render dynamic questions from the selected form */}
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
                              onChange={e => handleAnswerChange(idx, opt)}
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

export default JobApplicationForm;
