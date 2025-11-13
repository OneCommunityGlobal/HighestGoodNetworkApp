import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_USERS, INITIAL_MOCK_LOGS } from './MockLogs';
import { useSelector } from 'react-redux';
import styles3 from './CreateLogForm.module.css';
import styles1 from './LogEntryView.module.css'; // renamed from styles to styles1
import styles from './DailyLogPage.module.css';
import {
  Sun,
  Moon,
  User,
  Briefcase,
  GraduationCap,
  Send,
  MessageSquare,
  BookOpen,
  CheckCircle,
  PlusSquare,
} from 'lucide-react';

// --- UTILITY COMPONENTS ---

const IconByRole = ({ role, className = 'w-4 h-4' }) => {
  switch (role) {
    case 'Educator':
      return <Briefcase className={className} />;
    case 'Student':
      return <GraduationCap className={className} />;
    case 'Support':
      return <User className={className} />;
    default:
      return <User className={className} />;
  }
};

const Tag = ({ children, colorClass }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
  >
    {children}
  </span>
);

// --- FUNCTIONALITY COMPONENTS ---

/**
 * Component for Educators to submit feedback on a log.
 */

const EducatorFeedbackForm = ({
  logId,
  currentTeacherName,
  logHasFeedback,
  handleFeedbackSubmit,
}) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const labelText = logHasFeedback ? 'Update Teacher Feedback' : 'Submit Teacher Feedback';

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
    <div className={`${styles1.feedbackFormContainer}`}>
      <h3 className={`${styles1.feedbackFormTitle}`}>{labelText}</h3>

      {isSubmitted && (
        <div className={`${styles1.successAlert}`} role="alert">
          <CheckCircle className={`${styles1.alertIcon}`} />
          <span className={`${styles1.alertText}`}>Success!</span> Feedback submitted for the
          student.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          rows="3"
          placeholder={`Enter your feedback for the student here, ${currentTeacherName}...`}
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          className={`${styles1.feedbackTextarea}`}
        ></textarea>
        <button
          type="submit"
          disabled={!feedback.trim() || isSubmitted}
          className={`${`${styles1.feedbackSubmitBtn}`} ${
            isSubmitted ? styles1.feedbackSubmitDisabled : ''
          }`}
        >
          <Send className={`${styles1.submitIcon}`} />
          <span>{isSubmitted ? 'Feedback Sent' : 'Send Feedback'}</span>
        </button>
      </form>
    </div>
  );
};

/**
 * Component for Students and Support to create a new log entry.
 * ADDED handleAddLog prop to submit the new log to the global state.
 */

const CreateLogForm = ({ userRole, currentUserName, setViewMode, handleAddLog }) => {
  const isSupport = userRole === 'Support';
  const roleName = isSupport ? 'Support Member' : 'Student';

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
    setError(null); // Clear error on change
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
    <div className={`${styles3.formContainer}`}>
      <h2 className={`${styles3.title}`}>Create Daily Log</h2>
      <p className={`${styles3.description}`}>
        Add your log details below. Currently acting as a{' '}
        <strong className={`${styles3.roleName}`}>{roleName}</strong>.
      </p>

      {isSubmitted && (
        <div className={`${styles3.successMessage}`} role="alert">
          <CheckCircle className={`${styles3.icon}`} />
          <span className={`${styles3.bold}`}>Success!</span> Log entry submitted successfully.
          Switching back to Viewer...
        </div>
      )}

      {error && (
        <div className={`${styles3.errorMessage}`} role="alert">
          <span className={`${styles3.bold}`}>Error:</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${styles3.formGrid}`}>
        {/* Log Content */}
        <div>
          <label htmlFor="logContent" className={`${styles3.label}`}>
            Log Content
          </label>
          <textarea
            id="logContent"
            rows="4"
            placeholder="Enter your log here"
            value={formData.logContent}
            onChange={handleChange}
            className={`${styles3.textarea}`}
          ></textarea>
        </div>

        {/* Course Selection & Notes */}
        <div className={`${styles3.rightColumn}`}>
          <div>
            <label htmlFor="course" className={`${styles3.label}`}>
              Course/Assignment Selection
            </label>
            <select
              id="course"
              value={formData.course}
              onChange={handleChange}
              className={`${styles3.select}`}
            >
              <option value="Course A">Course A</option>
              <option value="Course B">Course B</option>
              <option value="General Log">General Log</option>
            </select>
          </div>

          <div>
            <label htmlFor="notesToTeacher" className={`${styles3.label}`}>
              Notes to Teacher (Optional)
            </label>
            <input
              type="text"
              id="notesToTeacher"
              placeholder="Add any notes for the teacher here"
              value={formData.notesToTeacher}
              onChange={handleChange}
              className={`${styles3.input}`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitted || !formData.logContent.trim()}
            className={`${styles3.submitBtn} ${isSubmitted ? styles3.disabledBtn : ''}`}
          >
            <Send className={`${styles3.icon}`} />
            <span>{isSubmitted ? 'Submitting...' : 'Submit Log'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Component to display teacher feedback.
 */
const TeacherFeedback = ({ feedbackData }) => (
  <div className={`${styles1.feedbackContainer}`}>
    <h2 className={`${styles1.feedbackTitle}`}>Teacher Feedback</h2>

    {feedbackData ? (
      <div className={`${styles1.feedbackCard}`}>
        <p className={`${styles1.feedbackTeacherName}`}>{feedbackData.teacherName}</p>
        <p className={`${styles1.feedbackText}`}>{feedbackData.feedback}</p>
      </div>
    ) : (
      <div className={`${styles1.noFeedbackCard}`}>No feedback available yet.</div>
    )}
  </div>
);

/**
 * Component for interaction/comment section.
 */
const CommentSection = ({ logId, comments, userRole, handleCommentSubmit, currentUserName }) => {
  const [newComment, setNewComment] = useState('');

  const onSubmit = () => {
    if (newComment.trim()) {
      handleCommentSubmit(logId, newComment);
      setNewComment('');
    }
  };

  return (
    <div className={`${styles1.commentSectionContainer}`}>
      <h2 className={`${styles1.commentSectionTitle}`}>Interaction / Comments</h2>

      {/* Display Existing Comments */}
      <div className={`${styles1.commentList}`}>
        {comments.length === 0 && (
          <p className={`${styles1.noComments}`}>No comments yet. Start the conversation!</p>
        )}
        {comments.map(comment => (
          <div key={comment.id} className={`${styles1.commentCard}`}>
            <div className={`${styles1.commentHeader}`}>
              <IconByRole role={comment.role} className={`${styles1.commentIcon}`} />
              <span className={`${styles1.commentAuthor}`}>{comment.author}</span>
              <Tag colorClass={styles1.commentRoleTag}>{comment.role}</Tag>
            </div>
            <p className={`${styles1.commentText}`}>{comment.text}</p>
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      <div className={`${styles1.commentInputWrapper}`}>
        <textarea
          rows="2"
          placeholder={`Leave a comment to interact... (As ${userRole})`}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className={`${styles1.commentTextarea}`}
        ></textarea>
        <button
          onClick={onSubmit}
          disabled={!newComment.trim()}
          className={`${`${styles1.commentSubmitBtn}`} ${
            !newComment.trim() ? styles1.commentSubmitDisabled : ''
          }`}
        >
          <MessageSquare className={`${styles1.submitIcon}`} />
          Comment
        </button>
      </div>
    </div>
  );
};

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

  return (
    <div className={`${styles1.container}`}>
      {/* Student/Log Header Card */}
      <div className={`${styles1.headerCard}`}>
        <div className={`${styles1.headerLeft}`}>
          <div className={`${styles1.avatar}`}>
            <User className={`${styles1.avatarIcon}`} />
          </div>
          <div>
            <h3 className={`${styles1.studentName}`}>
              <span>{log.studentName}</span>
              {showAssistedTag && (
                <Tag colorClass={styles1.assistedTag}>
                  <BookOpen className={`${styles1.assistedIcon}`} />
                  Assisted by: {log.assistedBy.name}
                </Tag>
              )}
            </h3>
            <p className={`${styles1.studentRole}`}>
              {log.studentRole} | Teacher: {log.teacher}
            </p>
            <p className={`${styles1.courseInfo}`}>Log for {log.course}</p>
          </div>
        </div>

        {/* Educator Assisted Tag Toggle (Only visible for Educators) */}
        <div className={`${styles1.headerRight}`}>
          {isEducator && (
            <button
              onClick={() => toggleAssistedStatus(log.id)}
              className={`${log.assistedBy ? styles1.removeAssistedBtn : styles1.markAssistedBtn}`}
            >
              {log.assistedBy ? 'Remove Assisted Tag' : 'Mark as Assisted'}
            </button>
          )}
          <button className={`${styles1.printBtn}`}>Print View</button>
        </div>
      </div>

      {/* Log Content & Notes */}
      <div className={`${styles1.grid}`}>
        <div className={`${styles1.gridItem}`}>
          <h4 className={`${styles1.gridTitle}`}>Log Content</h4>
          <p className={`${styles1.gridContent}`}>{log.logContent}</p>
        </div>
        <div className={`${styles1.gridItem}`}>
          <h4 className={`${styles1.gridTitle}`}>Notes to Teacher</h4>
          <p className={`${styles1.gridContentItalic}`}>
            {log.notesToTeacher || 'No optional notes provided.'}
          </p>
        </div>
      </div>

      {/* Teacher Feedback Section */}
      <TeacherFeedback feedbackData={log.teacherFeedback} />

      {/* Educator Feedback Form */}
      {isEducator && (
        <EducatorFeedbackForm
          logId={log.id}
          currentTeacherName={currentUserName}
          logHasFeedback={!!log.teacherFeedback}
          handleFeedbackSubmit={handleFeedbackSubmit}
        />
      )}

      {/* Comment/Interaction Section */}
      <CommentSection
        logId={log.id}
        comments={log.comments}
        userRole={currentUserRole}
        handleCommentSubmit={handleCommentSubmit}
        currentUserName={currentUserName}
      />
    </div>
  );
};

const ActivityLogs = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [currentUserRole, setCurrentUserRole] = useState('Educator');
  const [logs, setLogs] = useState(INITIAL_MOCK_LOGS);
  const [logToDisplayId, setLogToDisplayId] = useState(1);
  const [viewMode, setViewMode] = useState('viewer');

  const currentUserName = MOCK_USERS[currentUserRole.toLowerCase()]?.name || 'Unknown User';
  const isEducator = currentUserRole === 'Educator';
  const isCreator = currentUserRole === 'Student' || currentUserRole === 'Support';

  const logToDisplay = useMemo(() => logs.find(log => log.id === logToDisplayId), [
    logs,
    logToDisplayId,
  ]);

  const handleAddLog = newLog => {
    setLogs(prevLogs => [newLog, ...prevLogs]);
    setLogToDisplayId(newLog.id);
  };

  const toggleAssistedStatus = logId => {
    const supportUser = MOCK_USERS.support;
    setLogs(prevLogs =>
      prevLogs.map(log => {
        if (log.id === logId) {
          const isCurrentlyAssisted = !!log.assistedBy;
          return {
            ...log,
            assistedBy: isCurrentlyAssisted
              ? null
              : { name: supportUser.name, role: supportUser.role },
          };
        }
        return log;
      }),
    );
  };

  const handleFeedbackSubmit = (logId, feedbackContent) => {
    if (!isEducator) return;
    setLogs(prevLogs =>
      prevLogs.map(log => {
        if (log.id === logId) {
          return {
            ...log,
            teacherFeedback: {
              teacherName: currentUserName,
              feedback: feedbackContent,
              timestamp: new Date().toISOString(),
            },
          };
        }
        return log;
      }),
    );
  };

  const handleCommentSubmit = (logId, commentText) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: currentUserName,
      role: currentUserRole,
      text: commentText,
      timestamp: new Date().toISOString(),
    };

    setLogs(prevLogs =>
      prevLogs.map(log => {
        if (log.id === logId) {
          return { ...log, comments: [...log.comments, newComment] };
        }
        return log;
      }),
    );
  };

  const roleOptions = Object.keys(MOCK_USERS);

  useEffect(() => {
    if (isEducator) setViewMode('viewer');
    if (!logToDisplay && logs.length > 0) setLogToDisplayId(logs[0].id);
  }, [currentUserRole, logs, logToDisplay]);

  let PageContent;
  if (viewMode === 'viewer' && logToDisplay) {
    PageContent = (
      <LogEntryView
        log={logToDisplay}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
        toggleAssistedStatus={toggleAssistedStatus}
        handleCommentSubmit={handleCommentSubmit}
        handleFeedbackSubmit={handleFeedbackSubmit}
      />
    );
  } else if (viewMode === 'creator' && isCreator) {
    PageContent = (
      <CreateLogForm
        userRole={currentUserRole}
        currentUserName={currentUserName}
        setViewMode={setViewMode}
        handleAddLog={handleAddLog}
      />
    );
  } else {
    PageContent = (
      <div className={`${styles.noLogs}`}>
        No logs are available to display or review. Try submitting one as a Student/Support user
        first!
      </div>
    );
  }

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.container}`}>
        <header className={`${styles.header}`}>
          <h1 className={`${styles.title}`}>Daily Log System</h1>
          <div className={`${styles.controls}`}>
            {isCreator && (
              <button
                onClick={() => setViewMode(viewMode === 'viewer' ? 'creator' : 'viewer')}
                className={`${viewMode === 'viewer' ? styles.createButton : styles.viewButton}`}
              >
                {viewMode === 'viewer' ? (
                  <>
                    <PlusSquare className={`${styles.icon}`} />
                    <span>Create New Log</span>
                  </>
                ) : (
                  <>
                    <BookOpen className={`${styles.icon}`} />
                    <span>View Current Log</span>
                  </>
                )}
              </button>
            )}

            {logs.length > 0 && viewMode === 'viewer' && (
              <div className={`${styles.logSwitcher}`}>
                <BookOpen className={`${styles.iconSmall}`} />
                <span>View Log:</span>
                <select
                  value={logToDisplayId}
                  onChange={e => setLogToDisplayId(parseInt(e.target.value))}
                  className={`${styles.select}`}
                >
                  {[...logs]
                    .sort((a, b) => b.id - a.id)
                    .map(log => (
                      <option key={log.id} value={log.id}>
                        {log.studentName}s Log (ID: {log.id})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className={`${styles.roleSelector}`}>
              <User className={`${styles.iconSmall}`} />
              <span>User Role:</span>
              <select
                value={currentUserRole}
                onChange={e => {
                  setCurrentUserRole(e.target.value);
                  setViewMode('viewer');
                }}
                className={`${styles.select}`}
              >
                {roleOptions.map(role => (
                  <option key={role} value={MOCK_USERS[role].role}>
                    {MOCK_USERS[role].role} ({MOCK_USERS[role].name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className={`${styles.main}`}>{PageContent}</main>

        <footer className={`${styles.footer}`}>
          Current User: <strong>{currentUserName}</strong> ({currentUserRole}).
          <br />
          <strong>Test:</strong> Switch to <strong>Student</strong> or <strong>Support</strong>,
          create a new log, and then switch to <strong>Educator</strong> to confirm the new log
          appears in the Log Switcher.
        </footer>
      </div>
    </div>
  );
};

export default ActivityLogs;
