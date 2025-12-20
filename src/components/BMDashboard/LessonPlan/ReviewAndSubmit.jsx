import React from 'react';
import styles from './reviewAndSubmit.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { saveLessonPlanDraft } from '../../../actions/bmdashboard/lessonPlanBuilderActions';

const ReviewAndSubmit = ({ template, topics = [], activities = [], comments = [] }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userId = user ? user.userid : null;
  const handleSaveDraft = () => {
    const payload = {
      userId,
      templateId: template._id,
      selectedTopics: topics.map(t => t._id),
      activities,
      educatorId: template.createdBy,
      comments,
    };
    console.log('Saving draft with payload:', payload);
    dispatch(saveLessonPlanDraft(payload));
  };
  if (!template) {
    return <p className={styles.wrapper}>No template selected.</p>;
  }

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
              <strong>{template.title}</strong> — {template.description}
            </p>
          </div>

          {/* SELECTED TOPICS */}
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Selected Topics ({topics.length})</h4>

            <div className={styles.pillRow}>
              {topics.length === 0 && <p>No topics selected.</p>}

              {topics.map(topic => (
                <span key={topic._id} className={styles.pill}>
                  {topic.name}
                </span>
              ))}
            </div>
          </div>

          {/* ACTIVITIES */}
          <div className={styles.block}>
            <h4 className={styles.blockTitle}>Activities ({activities.length})</h4>

            {activities.length === 0 && <p>No activities added.</p>}

            {activities.map((activity, index) => (
              <div key={activity._id || index} className={styles.activityBox}>
                <h5 className={styles.activityTitle}>Activity {index + 1}</h5>

                <p className={styles.activityDesc}>
                  <strong>Description:</strong> {activity.description}
                </p>

                <p className={styles.activityDesc}>
                  <strong>Why:</strong> {activity.reason}
                </p>

                <div className={styles.pillRow}>
                  <span className={styles.pill}>{activity.strategy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={styles.rightSection}>
          {/* CHECKLIST */}
          <div className={styles.checklistBox}>
            <h3 className={styles.sectionHeading}>Submission Checklist</h3>

            <ul className={styles.checklist}>
              <li>✓ Template selected</li>
              <li className={topics.length ? '' : styles.incomplete}>✓ Topics chosen</li>
              <li className={activities.length ? '' : styles.incomplete}>✓ Activities created</li>
              <li>✓ All activities described</li>
            </ul>
          </div>

          {/* SUBMIT AREA */}
          <div className={styles.submitBox}>
            <h3 className={styles.sectionHeading}>Ready to Submit?</h3>
            <p className={styles.submitText}>
              Your lesson plan will be sent to your educator for review and feedback.
            </p>

            <button className={styles.primaryBtn} disabled={!topics.length || !activities.length}>
              Submit to Educator
            </button>

            <button className={styles.secondaryBtn} onClick={handleSaveDraft}>
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAndSubmit;
