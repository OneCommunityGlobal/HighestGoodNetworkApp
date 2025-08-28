import React from 'react';
import styles from './JobApplicationForm.module.css';
import OneCommunityImage from '../../../assets/images/logo2.png';

const JobApplicationForm = () => {
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
            <select className={styles.jobSelect}>
              <option value="Software Engineer">Software Engineer</option>
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
            <div className={styles.row}>
              <input type="text" placeholder="Name" className={styles.inputField} />
              <input type="email" placeholder="Email" className={styles.inputField} />
            </div>
            <div className={styles.row}>
              <input type="text" placeholder="Location & Timezone" className={styles.inputField} />
              <input type="text" placeholder="Phone Number" className={styles.inputField} />
            </div>
            <div className={styles.row}>
              <input type="text" placeholder="Company & Position" className={styles.inputField} />
              <input
                type="text"
                placeholder="Primary Website/ Social"
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label>1. How did you hear about One Community?</label>
              <input type="text" placeholder="Type your response here" />
            </div>
            <div className={styles.formGroup}>
              <label>2. Are you applying as an individual or organization?</label>
              <input type="text" placeholder="Type your response here" />
            </div>
            <div className={styles.formGroup}>
              <label>3. Why are you wanting to volunteer/work/collaborate with us?</label>
              <input type="text" placeholder="Type your response here" />
            </div>
            <div className={styles.formGroup}>
              <label>4. What skills/experience do you possess?</label>
              <input type="text" placeholder="Type your response here" />
            </div>
            <div className={styles.formGroup}>
              <label>5. How many volunteer hours per week are you willing to commit to?</label>
              <input type="text" placeholder="Type your response here" />
            </div>
            <div className={styles.formGroup}>
              <label>6. For how long do you wish to volunteer with us?</label>
              <input type="text" placeholder="Type your response here" />
            </div>
            <div className={styles.formGroup}>
              <label>7. What is your desired start date?</label>
              <input type="date" className={styles.dateInput} />
            </div>
            <div className={styles.formGroup}>
              <label>8. Will your volunteer time require documentation of your hours?</label>
              <select className={styles.selectField}>
                <option value="">Select an appropriate option</option>
                <option value="Yes, I'm volunteering just because I want to">
                  Yes, I'm volunteering just because I want to
                </option>
                <option value="Yes, I'm on OPT and don't yet have my EAD Card">
                  Yes, I'm on OPT and don't yet have my EAD Card
                </option>
                <option value="Yes, I'm on OPT and this time is for CPT, Co-op, or similar">
                  Yes, I'm on OPT and this time is for CPT, Co-op, or similar
                </option>
                <option value="STEM OPT: Sorry, we are 100% volunteer and don't qualify">
                  STEM OPT: Sorry, we are 100% volunteer and don't qualify
                </option>
              </select>
            </div>
            <button type="submit" className={styles.submitButton}>
              Proceed to submit with details
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default JobApplicationForm;
