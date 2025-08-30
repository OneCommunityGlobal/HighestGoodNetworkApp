import React, { useState } from 'react';
import styles from './JobApplicationForm.module.css';
import OneCommunityImage from '../../../assets/images/logo2.png';

const jobQuestions = {
  'Software Engineer': [
    'How would you rate your frontend skills out of 10?',
    'How would you rate your backend skills out of 10?',
    'How would you rate your overall programming skills out of 10?',
    'Have you worked with any version control systems? If so, which ones?',
  ],
  Designer: [
    'Can you provide examples of your design work?',
    'What design tools are you proficient in?',
    'How do you approach a new design project?',
    'Can you describe your design process from start to finish?',
  ],
};

const jobOptions = Object.keys(jobQuestions);

const JobApplicationForm = () => {
  const [answers, setAnswers] = useState(Array(jobQuestions[selectedJob].length).fill(''));

  const dispatch = useDispatch();
  const { forms, selectedJob } = useSelector(state => state.jobApplication);

  useEffect(() => {
    dispatch(getAllForms());
  }, [dispatch]);

  const filteredForm = forms.find(
    form => form.formName.toLowerCase() === jobTitleInput.toLowerCase(),
  );
  const questions = filteredForm ? filteredForm.questions : [];

  const handleJobChange = e => {
    const job = e.target.value;
    setSelectedJob(job);
    setAnswers(Array(jobQuestions[job].length).fill(''));
  };

  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className={styles.container}>
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
            <input type="text" placeholder="Enter Job Title" className={styles.jobTitleInput} />
            <button className="btn btn-secondary">Go</button>
          </div>
          <div className={styles.headerRight}>
            <select className={styles.jobSelect} value={selectedJob} onChange={handleJobChange}>
              {jobOptions.map(job => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>
        </section>
        <section className={styles.formContainer}>
          <h1 className={styles.formTitle}>FORM FOR SOFTWARE ENGINEERING POSITION</h1>
          <p className={styles.formSubtitle}>
            <a href="#learnMore">Click to know more about this position</a>
          </p>

          <form className={styles.form}>
            <div>
              Here is a questionare to apply to work with us. To complete your application and
              schedule zoom interview, please answer the pre-interview questions below.
            </div>
            <div className={styles.formContentGroup}>
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
              {questions.map((q, idx) => (
                <div key={q._id?.$oid || idx}>
                  <h2>{q.label}</h2>
                  {q.type === 'text' && <input type="text" placeholder="Type your response here" />}
                  {q.type === 'checkbox' && (
                    <div>
                      {q.options.map(opt => (
                        <label key={opt}>
                          <input type="checkbox" value={opt} /> {opt}
                        </label>
                      ))}
                    </div>
                  )}
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
};

export default JobApplicationForm;
