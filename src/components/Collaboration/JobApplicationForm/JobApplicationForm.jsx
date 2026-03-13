import React, { useState, useEffect, useRef } from 'react';
import styles from './JobApplicationForm.module.css';
import OneCommunityImage from '../../../assets/images/logo2.png';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function JobApplicationForm() {
  const [forms, setForms] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [answers, setAnswers] = useState([]);
  const [filteredForm, setFilteredForm] = useState(null);

  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [locationTimezone, setLocationTimezone] = useState('');
  const [phone, setPhone] = useState('');
  const [companyPosition, setCompanyPosition] = useState('');
  const [websiteSocial, setWebsiteSocial] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const resumeInputRef = useRef(null);

  const darkMode = useSelector(state => state.theme?.darkMode);

  useEffect(() => {
    async function fetchForms() {
      try {
        const res = await axios.get(ENDPOINTS.GET_ALL_JOB_FORMS);
        const formsArr = Array.isArray(res.data.forms) ? res.data.forms : [];

        setForms(formsArr);

        if (formsArr.length > 0) {
          setSelectedJob(formsArr[0].title);
          setFilteredForm(formsArr[0]);
          setAnswers(new Array(formsArr[0].questions?.length || 0).fill(''));
        }
      } catch (err) {
        toast.error('Failed to load job forms.');
      }
    }

    fetchForms();
  }, []);

  useEffect(() => {
    if (!selectedJob) return;

    const form = forms.find(f => f.title === selectedJob);
    setFilteredForm(form);
    setAnswers(new Array(form?.questions?.length || 0).fill(''));
  }, [selectedJob, forms]);

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleResumeChange = e => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
  };

  const validateBeforeSubmit = () => {
    const missing = [];

    if (!applicantName.trim()) missing.push('Name');
    if (!applicantEmail.trim()) missing.push('Email');

    filteredForm?.questions?.forEach((q, idx) => {
      const required = q.required ?? false;

      if (required && !answers[idx]) {
        missing.push(q.label || q.questionText);
      }
    });

    return missing;
  };

  const handleSubmit = e => {
    e.preventDefault();

    const missing = validateBeforeSubmit();

    if (missing.length > 0) {
      toast.error(`Please complete: ${missing.join(', ')}`);
      return;
    }

    toast.success('Application submitted successfully.');

    setApplicantName('');
    setApplicantEmail('');
    setLocationTimezone('');
    setPhone('');
    setCompanyPosition('');
    setWebsiteSocial('');
    setResumeFile(null);

    if (resumeInputRef.current) {
      resumeInputRef.current.value = '';
    }

    setAnswers(new Array(filteredForm?.questions?.length || 0).fill(''));
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <ToastContainer />

      <header className={styles.logo}>
        <img src={OneCommunityImage} alt="One Community Logo" />
      </header>

      <main className={styles.header}>
        <section className={styles.formContainer}>
          <h1 className={styles.formTitle}>
            FORM FOR {selectedJob?.toUpperCase()} POSITION
          </h1>

          <form className={styles.form} onSubmit={handleSubmit}>
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

              {/* Dynamic Questions */}

              {(filteredForm?.questions || [])
                .filter(
                  q =>
                    (q.label || q.questionText || '')
                      .toLowerCase()
                      .trim() !== 'what is your degree major?'
                )
                .map((q, index) => (
                  <div key={index} className={styles.formGroup}>
                    <h2>{q.label || q.questionText}</h2>

                    <input
                      type="text"
                      placeholder="Type your response here"
                      value={answers[index] || ''}
                      onChange={e =>
                        handleAnswerChange(index, e.target.value)
                      }
                    />
                  </div>
                ))}

              {/* Submit Button */}

              <button type="submit" className={styles.submitButton}>
                Submit Now
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default JobApplicationForm;