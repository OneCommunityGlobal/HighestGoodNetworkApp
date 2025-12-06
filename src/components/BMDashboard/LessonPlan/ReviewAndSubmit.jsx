import React from 'react';
import styles from './reviewAndSubmit.module.css';

const ReviewAndSubmit = () => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.pageTitle}>Review & Submit</h2>
      <p className={styles.pageSubtitle}>
        Review your lesson plan and submit it to your educator for approval.
      </p>

      <div className={styles.mainGrid}>
        {/* LEFT PANEL */}
        <div className={styles.leftSection}>
          <h3 className={styles.sectionHeading}>Lesson Plan Summary</h3>

          {/* TEMPLATE */}
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Template</h4>
            <p className={styles.blockText}>
              Global Citizen - Understanding world cultures, history, and social responsibility
            </p>
          </div>

          {/* SELECTED TOPICS */}
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Selected Topics (2)</h4>
            <div className={styles.pillRow}>
              <span className={styles.pill}>Algebra Fundamentals</span>
              <span className={styles.pill}>Geometry Basics</span>
            </div>
          </div>

          {/* ACTIVITIES */}
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Activities (1)</h4>

            <div className={styles.activityBox}>
              <h5 className={styles.activityTitle}>Activity 1</h5>
              <p className={styles.activityDesc}>hi</p>

              <div className={styles.pillRow}>
                <span className={styles.pill}>Hands-on Practice</span>
                <span className={styles.pill}>Project-based Learning</span>
                <span className={styles.pill}>Real-world Applications</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightSection}>
          {/* CHECKLIST */}
          <div className={styles.checklistBox}>
            <h3 className={styles.sectionHeading}>Submission Checklist</h3>

            <ul className={styles.checklist}>
              <li>✓ Template selected</li>
              <li>✓ Topics chosen</li>
              <li>✓ Activities created</li>
              <li>✓ All activities described</li>
            </ul>
          </div>

          {/* SUBMIT AREA */}
          <div className={styles.submitBox}>
            <h3 className={styles.sectionHeading}>Ready to Submit?</h3>
            <p className={styles.submitText}>
              Your lesson plan will be sent to your educator for review and feedback.
            </p>

            <button className={styles.primaryBtn}>Submit to Educator</button>
            <button className={styles.secondaryBtn}>Save as Draft</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAndSubmit;
