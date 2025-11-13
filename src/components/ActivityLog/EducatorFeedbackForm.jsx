import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import styles from './styles/EducatorFeedback.module.css';
import { useSelector } from 'react-redux';
const EducatorFeedbackForm = ({
  logId,
  currentTeacherName,
  logHasFeedback,
  handleFeedbackSubmit,
}) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const labelText = logHasFeedback ? 'Update Teacher Feedback' : 'Submit Teacher Feedback';

  const darkMode = useSelector(state => state.theme.darkMode);
  const handleSubmit = e => {
    e.preventDefault();
    if (feedback.trim()) {
      handleFeedbackSubmit(logId, feedback);
      setFeedback('');
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 2000);
    }
  };

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.feedbackFormContainer}`}>
        <h3 className={`${styles.feedbackFormTitle}`}>{labelText}</h3>

        {isSubmitted && (
          <div className={`${styles.successAlert}`} role="alert">
            <CheckCircle className={`${styles.alertIcon}`} />
            <span className={`${styles.alertText}`}>Success!</span> Feedback submitted for the
            student.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            rows="3"
            placeholder={`Enter your feedback for the student here, ${currentTeacherName}...`}
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            className={`${styles.feedbackTextarea}`}
          ></textarea>
          <button
            type="submit"
            disabled={!feedback.trim() || isSubmitted}
            className={`${styles.feedbackSubmitBtn} ${
              isSubmitted ? styles.feedbackSubmitDisabled : ''
            }`}
          >
            <Send className={`${styles.submitIcon}`} />
            <span>{isSubmitted ? 'Feedback Sent' : 'Send Feedback'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EducatorFeedbackForm;
