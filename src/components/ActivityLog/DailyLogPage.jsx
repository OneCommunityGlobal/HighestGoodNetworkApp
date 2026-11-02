import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_USERS, INITIAL_MOCK_LOGS } from './MockLogs';
import { useSelector } from 'react-redux';
import styles from './styles/DailyLogPage.module.css';
import CreateLogForm from './CreateLogForm';
import { User, BookOpen, PlusSquare } from 'lucide-react';
import LogEntryView from './LogEntryView';
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
                  onChange={e => setLogToDisplayId(Number.parseInt(e.target.value))}
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
