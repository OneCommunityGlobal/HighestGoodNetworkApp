import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_USERS, INITIAL_MOCK_LOGS } from './MockLogs';

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
      setFeedback(''); // Clear input
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 2000);
    }
  };

  return (
    <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl shadow border border-yellow-200 dark:border-yellow-700">
      <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">{labelText}</h3>

      {isSubmitted && (
        <div
          className="flex items-center p-3 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-900/50 dark:text-green-300 transition-opacity duration-300"
          role="alert"
        >
          <CheckCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">Success!</span> Feedback submitted for the student.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          rows="3"
          placeholder={`Enter your feedback for the student here, ${currentTeacherName}...`}
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          className="w-full rounded-lg border-yellow-300 dark:border-yellow-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 p-3 transition duration-150 ease-in-out"
        ></textarea>
        <button
          type="submit"
          disabled={!feedback.trim() || isSubmitted}
          className={`w-full flex items-center justify-center space-x-2 font-bold py-3 rounded-lg shadow-md transition duration-200 ease-in-out mt-3 ${
            isSubmitted
              ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50'
          }`}
        >
          <Send className="w-5 h-5" />
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

    // 1. Construct the new log object (Simulation of a new entry)
    const newLog = {
      id: Date.now(), // Use timestamp as unique ID
      submittedBy: currentUserName,
      role: userRole,
      timestamp: new Date().toISOString(),
      logContent: formData.logContent,
      course: formData.course,
      notesToTeacher: formData.notesToTeacher || 'N/A',
      // If submitted by Support, record it as assisted
      assistedBy: isSupport ? { name: currentUserName, role: 'Support' } : null,
      studentName: isSupport ? 'Young Learner Placeholder' : currentUserName,
      studentRole: isSupport ? 'Unknown Grade' : MOCK_USERS.student.role,
      teacher: isSupport ? 'Educator to be assigned' : MOCK_USERS.educator.name, // Assign a mock teacher
      teacherFeedback: null,
      comments: [],
    };

    // 2. Add log to global state
    handleAddLog(newLog);

    // 3. Simulate successful submission
    setIsSubmitted(true);
    setFormData({ logContent: '', course: 'Course A', notesToTeacher: '' });

    setTimeout(() => {
      setIsSubmitted(false);
      // Automatically switch back to the viewer after submission
      if (setViewMode) {
        setViewMode('viewer');
      }
    }, 2000);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
        Create Daily Log
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Add your log details below. Currently acting as a{' '}
        <strong className="font-semibold text-indigo-500">{roleName}</strong>.
      </p>

      {/* Submission Status Message */}
      {isSubmitted && (
        <div
          className="flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-900 dark:text-green-300 transition-opacity duration-300"
          role="alert"
        >
          <CheckCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">Success!</span> Log entry submitted successfully. Switching
          back to Viewer...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900 dark:text-red-300 transition-opacity duration-300"
          role="alert"
        >
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Log Content */}
        <div>
          <label
            htmlFor="logContent"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Log Content
          </label>
          <textarea
            id="logContent"
            rows="4"
            placeholder="Enter your log here"
            value={formData.logContent}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 p-3 transition duration-150 ease-in-out"
          ></textarea>
        </div>

        {/* Course/Assignment Selection & Notes */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="course"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Course/Assignment Selection
            </label>
            <select
              id="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 p-3 transition duration-150 ease-in-out"
            >
              <option value="Course A">Course A</option>
              <option value="Course B">Course B</option>
              <option value="General Log">General Log</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="notesToTeacher"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Notes to Teacher (Optional)
            </label>
            <input
              type="text"
              id="notesToTeacher"
              placeholder="Add any notes for the teacher here"
              value={formData.notesToTeacher}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 p-3 transition duration-150 ease-in-out"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitted || !formData.logContent.trim()}
            className={`w-full flex items-center justify-center space-x-2 font-bold py-3 rounded-lg shadow-md transition duration-200 ease-in-out mt-4 ${
              isSubmitted
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
            }`}
          >
            <Send className="w-5 h-5" />
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
  <div className="mt-8">
    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">Teacher Feedback</h2>

    {feedbackData ? (
      <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          {feedbackData.teacherName}
        </p>
        <p className="text-gray-700 dark:text-gray-300 italic">{feedbackData.feedback}</p>
      </div>
    ) : (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
        No feedback available yet.
      </div>
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
      setNewComment(''); // Clear input after submission
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
        Interaction / Comments
      </h2>

      {/* Display Existing Comments */}
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-4">
        {comments.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 italic">
            No comments yet. Start the conversation!
          </p>
        )}
        {comments.map(comment => (
          <div
            key={comment.id}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-1">
              <IconByRole role={comment.role} className="w-3 h-3 text-indigo-500" />
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {comment.author}
              </span>
              <Tag colorClass="bg-indigo-100 text-indigo-80:0 dark:bg-indigo-900 dark:text-indigo-300">
                {comment.role}
              </Tag>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      <div className="flex items-start space-x-3">
        <textarea
          rows="2"
          placeholder={`Leave a comment to interact... (As ${userRole})`}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="flex-grow rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 p-3 transition duration-150 ease-in-out"
        ></textarea>
        <button
          onClick={onSubmit}
          disabled={!newComment.trim()}
          className="shrink-0 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 mt-0.5 rounded-lg shadow-md transition duration-200 ease-in-out self-stretch disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Comment
        </button>
      </div>
    </div>
  );
};

/**
 * Main component displaying a single log entry.
 */
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
    <div className="space-y-8">
      {/* Student/Log Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>{log.studentName}</span>
              {showAssistedTag && (
                <Tag colorClass="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                  <BookOpen className="w-3 h-3 mr-1" />
                  Assisted by: {log.assistedBy.name}
                </Tag>
              )}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {log.studentRole} | Teacher: {log.teacher}
            </p>
            <p className="text-md font-medium text-indigo-600 dark:text-indigo-400 mt-1">
              Log for {log.course}
            </p>
          </div>
        </div>

        {/* Educator Assisted Tag Toggle (Only visible for Educators) */}
        <div className="flex space-x-2 mt-4 sm:mt-0">
          {isEducator && (
            <button
              onClick={() => toggleAssistedStatus(log.id)}
              className={`font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md ${
                log.assistedBy
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {log.assistedBy ? 'Remove Assisted Tag' : 'Mark as Assisted'}
            </button>
          )}
          <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-md">
            Print View
          </button>
        </div>
      </div>

      {/* Log Content & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Log Content</h4>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log.logContent}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Notes to Teacher
          </h4>
          <p className="text-gray-700 dark:text-gray-300 italic">
            {log.notesToTeacher || 'No optional notes provided.'}
          </p>
        </div>
      </div>

      {/* Teacher Feedback Section (Visible to ALL roles) */}
      <TeacherFeedback feedbackData={log.teacherFeedback} />

      {/* Educator Feedback Form (Only visible to Educator) */}
      {isEducator && (
        <EducatorFeedbackForm
          logId={log.id}
          currentTeacherName={currentUserName}
          logHasFeedback={!!log.teacherFeedback}
          handleFeedbackSubmit={handleFeedbackSubmit}
        />
      )}

      {/* Comment/Interaction Section (Visible to ALL roles) */}
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

// --- MAIN APP COMPONENT ---

const ActivityLogs = () => {
  const [theme, setTheme] = useState('light');
  // State to simulate different user roles viewing the page
  const [currentUserRole, setCurrentUserRole] = useState('Educator'); // Default to Educator
  // State for all logs
  const [logs, setLogs] = useState(INITIAL_MOCK_LOGS);
  // Default to Log ID 1 (John Doe's, initially unassisted) for viewing
  const [logToDisplayId, setLogToDisplayId] = useState(1);
  // State to switch between viewing a log and creating a new one (Only for Student/Support)
  const [viewMode, setViewMode] = useState('viewer');

  // Get current user details
  const currentUserName = MOCK_USERS[currentUserRole.toLowerCase()]?.name || 'Unknown User';
  const isEducator = currentUserRole === 'Educator';
  const isCreator = currentUserRole === 'Student' || currentUserRole === 'Support';

  // Find the currently displayed log
  const logToDisplay = useMemo(() => logs.find(log => log.id === logToDisplayId), [
    logs,
    logToDisplayId,
  ]);

  // Effect to apply/remove dark class to the HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  /**
   * NEW: Function to add a new log entry to the state.
   */
  const handleAddLog = newLog => {
    // Add the new log to the beginning of the array so it's easily visible.
    setLogs(prevLogs => [newLog, ...prevLogs]);
    // Also switch to viewing the newly created log immediately
    setLogToDisplayId(newLog.id);
  };

  /**
   * Educator function to toggle the assisted status on a log.
   */
  const toggleAssistedStatus = logId => {
    const supportUser = MOCK_USERS.support; // Get the mock support user details

    setLogs(prevLogs =>
      prevLogs.map(log => {
        if (log.id === logId) {
          const isCurrentlyAssisted = !!log.assistedBy;
          return {
            ...log,
            // If not assisted, set the assistedBy to the mock Support user.
            // If currently assisted, set to null.
            assistedBy: isCurrentlyAssisted
              ? null
              : { name: supportUser.name, role: supportUser.role },
          };
        }
        return log;
      }),
    );

    // Logging for observation
    const currentLog = logs.find(log => log.id === logId);
    const newStatusName = !currentLog?.assistedBy ? supportUser.name : 'None';
  };

  /**
   * Function for Educator to submit feedback, which updates teacherFeedback.
   */
  const handleFeedbackSubmit = (logId, feedbackContent) => {
    if (!isEducator) {
      return;
    }
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

  /**
   * Function to add a new comment to a log.
   */
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
          return {
            ...log,
            comments: [...log.comments, newComment],
          };
        }
        return log;
      }),
    );
  };

  const roleOptions = Object.keys(MOCK_USERS);

  // Ensure the Educator always starts in viewer mode
  useEffect(() => {
    if (isEducator) {
      setViewMode('viewer');
    }
    // If the log we were viewing got deleted (not happening here, but defensive)
    if (!logToDisplay && logs.length > 0) {
      setLogToDisplayId(logs[0].id);
    }
  }, [currentUserRole, logs, logToDisplay]);

  // Determine the content based on the view mode
  let PageContent;

  if (viewMode === 'viewer' && logToDisplay) {
    PageContent = (
      <LogEntryView
        log={logToDisplay}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
        toggleAssistedStatus={toggleAssistedStatus}
        handleCommentSubmit={handleCommentSubmit}
        handleFeedbackSubmit={handleFeedbackSubmit} // Passed down for Educator form
      />
    );
  } else if (viewMode === 'creator' && isCreator) {
    // Only Student/Support use the creator form
    PageContent = (
      <CreateLogForm
        userRole={currentUserRole}
        currentUserName={currentUserName}
        setViewMode={setViewMode}
        handleAddLog={handleAddLog} // <--- Pass the new handler
      />
    );
  } else {
    // Fallback for an empty state (e.g., if the user switches to Educator and no logs exist)
    PageContent = (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-gray-500 dark:text-gray-400">
        No logs are available to display or review. Try submitting one as a Student/Support user
        first!
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 transition-colors duration-300 bg-gray-50 dark:bg-gray-900 font-sans">
      {/* Header and Controls */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-10 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-4 sm:mb-0">
          Daily Log System
        </h1>
        <div className="flex space-x-4 items-center flex-wrap justify-center sm:justify-end">
          {/* Create New Log / View Log Button (Only for Student/Support) */}
          {isCreator && (
            <button
              onClick={() => setViewMode(viewMode === 'viewer' ? 'creator' : 'viewer')}
              className={`flex items-center space-x-2 font-bold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out ${
                viewMode === 'viewer'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-400 hover:bg-gray-500 text-gray-800'
              }`}
            >
              {viewMode === 'viewer' ? (
                <>
                  <PlusSquare className="w-5 h-5" />
                  <span>Create New Log</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  <span>View Current Log</span>
                </>
              )}
            </button>
          )}

          {/* Log Switcher (For all roles in viewer mode) */}
          {logs.length > 0 && viewMode === 'viewer' && (
            <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                View Log:
              </span>
              <select
                value={logToDisplayId}
                onChange={e => setLogToDisplayId(parseInt(e.target.value))}
                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm py-1 px-2 text-gray-900 dark:text-white"
              >
                {/* Ensure the list is sorted by ID descending (newest first) for visual ease */}
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

          {/* User Role Switcher */}
          <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">User Role:</span>
            <select
              value={currentUserRole}
              onChange={e => {
                setCurrentUserRole(e.target.value);
                // Reset to viewer mode when changing roles for cleaner transition
                setViewMode('viewer');
              }}
              className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm py-1 px-2 text-gray-900 dark:text-white"
            >
              {roleOptions.map(role => (
                <option key={role} value={MOCK_USERS[role].role}>
                  {MOCK_USERS[role].role} ({MOCK_USERS[role].name})
                </option>
              ))}
            </select>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors duration-200 shadow-md"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto">{PageContent}</main>

      {/* Footer / Role Information */}
      <footer className="mt-10 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
        Current User: **{currentUserName}** ({currentUserRole}).
        <br />
        **Test:** Switch to **Student** or **Support**, create a new log, and then switch to
        **Educator** to confirm the new log appears in the Log Switcher.
      </footer>
    </div>
  );
};

export default ActivityLogs;
