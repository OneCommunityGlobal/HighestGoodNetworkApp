import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import styles from './styles/CreateLogForm.module.css';
import { MOCK_USERS } from './MockLogs';
import { useSelector } from 'react-redux';

const CreateLogForm = ({ userRole, currentUserName, setViewMode, handleAddLog }) => {
  const isSupport = userRole === 'Support';
  const roleName = isSupport ? 'Support Member' : 'Student';

  const darkMode = useSelector(state => state.theme.darkMode);
  const [formData, setFormData] = useState({
    logContent: '',
    course: 'Course A',
    notesToTeacher: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!formData.logContent.trim()) {
      setError('Log Content is required to submit a log entry.');
      return;
    }

    const newLog = {
      id: Date.now(),
      submittedBy: currentUserName,
      role: userRole,
      timestamp: new Date().toISOString(),
      logContent: formData.logContent,
      course: formData.course,
      notesToTeacher: formData.notesToTeacher || 'N/A',
      assistedBy: isSupport ? { name: currentUserName, role: 'Support' } : null,
      studentName: isSupport ? 'Young Learner Placeholder' : currentUserName,
      studentRole: isSupport ? 'Unknown Grade' : MOCK_USERS.student.role,
      teacher: isSupport ? 'Educator to be assigned' : MOCK_USERS.educator.name,
      teacherFeedback: null,
      comments: [],
    };

    handleAddLog(newLog);

    setIsSubmitted(true);
    setFormData({ logContent: '', course: 'Course A', notesToTeacher: '' });

    setTimeout(() => {
      setIsSubmitted(false);
      if (setViewMode) setViewMode('viewer');
    }, 2000);
  };

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.formContainer}`}>
        <h2 className={`${styles.title}`}>Create Daily Log</h2>
        <p className={`${styles.description}`}>
          Add your log details below. Currently acting as a{' '}
          <strong className={`${styles.roleName}`}>{roleName}</strong>.
        </p>

        {isSubmitted && (
          <div className={`${styles.successMessage}`} role="alert">
            <CheckCircle className={`${styles.icon}`} />
            <span className={`${styles.bold}`}>Success!</span> Log entry submitted successfully.
            Switching back to Viewer...
          </div>
        )}

        {error && (
          <div className={`${styles.errorMessage}`} role="alert">
            <span className={`${styles.bold}`}>Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={`${styles.formGrid}`}>
          {/* Log Content */}
          <div>
            <label htmlFor="logContent" className={`${styles.label}`}>
              Log Content
            </label>
            <textarea
              id="logContent"
              rows="4"
              placeholder="Enter your log here"
              value={formData.logContent}
              onChange={handleChange}
              className={`${styles.textarea}`}
            ></textarea>
          </div>

          {/* Course Selection & Notes */}
          <div className={`${styles.rightColumn}`}>
            <div>
              <label htmlFor="course" className={`${styles.label}`}>
                Course/Assignment Selection
              </label>
              <select
                id="course"
                value={formData.course}
                onChange={handleChange}
                className={`${styles.select}`}
              >
                <option value="Course A">Course A</option>
                <option value="Course B">Course B</option>
                <option value="General Log">General Log</option>
              </select>
            </div>

            <div>
              <label htmlFor="notesToTeacher" className={`${styles.label}`}>
                Notes to Teacher (Optional)
              </label>
              <input
                type="text"
                id="notesToTeacher"
                placeholder="Add any notes for the teacher here"
                value={formData.notesToTeacher}
                onChange={handleChange}
                className={`${styles.input}`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitted || !formData.logContent.trim()}
              className={`${styles.submitBtn} ${isSubmitted ? styles.disabledBtn : ''}`}
            >
              <Send className={`${styles.icon}`} />
              <span>{isSubmitted ? 'Submitting...' : 'Submit Log'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLogForm;
