import styles from './styles/TeacherFeedbackForm.module.css';
import { useSelector } from 'react-redux';

const TeacherFeedback = ({ feedbackData }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.feedbackContainer}>
        <h2 className={styles.feedbackTitle}>Teacher Feedback</h2>

        {feedbackData ? (
          <div className={styles.feedbackCard}>
            <p className={styles.feedbackTeacherName}>{feedbackData.teacherName}</p>
            <p className={styles.feedbackText}>{feedbackData.feedback}</p>
          </div>
        ) : (
          <div className={styles.noFeedbackCard}>No feedback available yet.</div>
        )}
      </div>
    </div>
  );
};

export default TeacherFeedback;
