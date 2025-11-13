import PropTypes from 'prop-types';
import { User, BookOpen } from 'lucide-react';
import styles from './styles/LogEntryView.module.css';
import { Tag } from './icons';
import { useSelector } from 'react-redux';
import TeacherFeedback from './TeacherFeedback';
import EducatorFeedbackForm from './EducatorFeedbackForm';
import CommentSection from './CommentSection';

const LogEntryView = ({
  log,
  currentUserRole,
  currentUserName,
  toggleAssistedStatus,
  handleCommentSubmit,
  handleFeedbackSubmit,
}) => {
  const isEducator = currentUserRole === 'Educator';
  const showAssistedTag = log.assistedBy;

  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.container}`}>
        {/* Student/Log Header Card */}
        <div className={`${styles.headerCard}`}>
          <div className={`${styles.headerLeft}`}>
            <div className={`${styles.avatar}`}>
              <User className={`${styles.avatarIcon}`} />
            </div>
            <div>
              <h3 className={`${styles.studentName}`}>
                <span>{log.studentName}</span>
                {showAssistedTag && (
                  <Tag color="tagSupport">
                    <BookOpen className={`${styles.assistedIcon}`} />
                    Assisted by: {log.assistedBy.name}
                  </Tag>
                )}
              </h3>
              <p className={`${styles.studentRole}`}>
                {log.studentRole} | Teacher: {log.teacher}
              </p>
              <p className={`${styles.courseInfo}`}>Log for {log.course}</p>
            </div>
          </div>

          {/* Educator Assisted Tag Toggle */}
          <div className={`${styles.headerRight}`}>
            {isEducator && (
              <button
                onClick={() => toggleAssistedStatus(log.id)}
                className={`${log.assistedBy ? styles.removeAssistedBtn : styles.markAssistedBtn}`}
              >
                {log.assistedBy ? 'Remove Assisted Tag' : 'Mark as Assisted'}
              </button>
            )}
            <button className={`${styles.printBtn}`}>Print View</button>
          </div>
        </div>

        {/* Log Content & Notes */}
        <div className={`${styles.grid}`}>
          <div className={`${styles.gridItem}`}>
            <h4 className={`${styles.gridTitle}`}>Log Content</h4>
            <p className={`${styles.gridContent}`}>{log.logContent}</p>
          </div>
          <div className={`${styles.gridItem}`}>
            <h4 className={`${styles.gridTitle}`}>Notes to Teacher</h4>
            <p className={`${styles.gridContentItalic}`}>
              {log.notesToTeacher || 'No optional notes provided.'}
            </p>
          </div>
        </div>

        <TeacherFeedback feedbackData={log.teacherFeedback} />

        {isEducator && (
          <EducatorFeedbackForm
            logId={log.id}
            currentTeacherName={currentUserName}
            logHasFeedback={!!log.teacherFeedback}
            handleFeedbackSubmit={handleFeedbackSubmit}
          />
        )}

        <CommentSection
          logId={log.id}
          comments={log.comments}
          userRole={currentUserRole}
          handleCommentSubmit={handleCommentSubmit}
          currentUserName={currentUserName}
        />
      </div>
    </div>
  );
};

LogEntryView.propTypes = {
  log: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    studentName: PropTypes.string.isRequired,
    studentRole: PropTypes.string.isRequired,
    teacher: PropTypes.string.isRequired,
    course: PropTypes.string.isRequired,
    logContent: PropTypes.string.isRequired,
    notesToTeacher: PropTypes.string,
    teacherFeedback: PropTypes.any,
    assistedBy: PropTypes.shape({
      name: PropTypes.string.isRequired,
      role: PropTypes.string,
    }),
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        role: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
  currentUserRole: PropTypes.string.isRequired,
  currentUserName: PropTypes.string.isRequired,
  toggleAssistedStatus: PropTypes.func.isRequired,
  handleCommentSubmit: PropTypes.func.isRequired,
  handleFeedbackSubmit: PropTypes.func.isRequired,
};

export default LogEntryView;
