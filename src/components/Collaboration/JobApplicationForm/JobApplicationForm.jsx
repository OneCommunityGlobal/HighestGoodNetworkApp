import React from 'react';
import styles from './JobApplicationForm.module.css';

const JobApplicationForm = () => {
  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <input type="text" placeholder="Enter Job Title" className={styles.jobTitleInput} />
          <select className={styles.jobSelect}>
            <option value="Software Engineer">Software Engineer</option>
            {/* Add more options as needed */}
          </select>
          <button className={styles.goButton}>Go</button>
        </div>
      </header>

      {/* Form Section */}
      <main className={styles.formContainer}>
        <h1 className={styles.formTitle}>FORM FOR SOFTWARE ENGINEERING POSITION</h1>
        <p className={styles.formSubtitle}>
          <a href="#learnMore">Click to know more about this position</a>
        </p>

        <form className={styles.form}>
          {/* Form Fields */}
          <div className={styles.formGroup}>
            <label>Name</label>
            <input type="text" placeholder="Your response here" />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" placeholder="Your response here" />
          </div>
          <div className={styles.formGroup}>
            <label>Company & Position</label>
            <input type="text" placeholder="Your response here" />
          </div>
          <div className={styles.formGroup}>
            <label>Primary Monitor Social</label>
            <input type="text" placeholder="Your response here" />
          </div>
          {/* Add more fields as per the image */}
          <button type="submit" className={styles.submitButton}>
            Proceed to submit with details
          </button>
        </form>
      </main>
    </div>
  );
};

export default JobApplicationForm;
