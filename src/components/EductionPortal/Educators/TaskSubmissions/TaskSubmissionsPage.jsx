import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import SubmissionCard from './SubmissionCard';
import styles from './TaskSubmissionsPage.module.css';
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const isLateSubmission = sub => {
  const { submittedAt, dueAt } = sub;
  return (
    submittedAt &&
    dueAt &&
    !Number.isNaN(new Date(submittedAt).getTime()) &&
    !Number.isNaN(new Date(dueAt).getTime()) &&
    new Date(submittedAt) > new Date(dueAt)
  );
};

const TaskSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeClassId, setActiveClassId] = useState('');
  const [filterStatus, setFilterStatus] = useState('submissions');
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const params = (() => {
          if (filterStatus === 'pending_submissions') return { status: 'pending submissions' };
          if (filterStatus === 'graded') return { status: 'graded' };
          return {};
        })();
        const res = await axios.get(
          `${process.env.REACT_APP_APIENDPOINT}/educationportal/educator/task-submissions`,
          { params },
        );
        const rawSubmissions = res.data || [];
        const fetchedSubmissions =
          filterStatus === 'late' ? rawSubmissions.filter(isLateSubmission) : rawSubmissions;
        setSubmissions(fetchedSubmissions);

        if (fetchedSubmissions.length > 0) {
          const uniqueClassIds = [
            ...new Set(fetchedSubmissions.map(sub => sub.lessonPlanId)),
          ].filter(Boolean);

          const nextActiveClassId =
            activeClassId && uniqueClassIds.includes(activeClassId)
              ? activeClassId
              : uniqueClassIds[0] || '';
          setActiveClassId(nextActiveClassId);

          setExpandedTasks(prevExpandedTasks => {
            const availableTaskNames = new Set(fetchedSubmissions.map(sub => sub.taskName));
            const preserved = Object.fromEntries(
              Object.entries(prevExpandedTasks).filter(([taskName]) =>
                availableTaskNames.has(taskName),
              ),
            );
            if (Object.keys(preserved).length > 0) {
              return preserved;
            }

            const firstClassTasks = fetchedSubmissions.filter(
              sub => sub.lessonPlanId === nextActiveClassId,
            );
            return firstClassTasks.length > 0 ? { [firstClassTasks[0].taskName]: true } : {};
          });
        } else {
          setActiveClassId('');
          setExpandedTasks({});
        }
      } catch (err) {
        setError('Failed to load submissions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [filterStatus]);

  const groupedData = useMemo(() => {
    const data = {};
    submissions.forEach(sub => {
      if (!sub.lessonPlanId || !sub.taskName) return;

      const classId = sub.lessonPlanId;
      const className = sub.lessonPlanTitle || `Class ${String(classId).slice(-6)}`;

      if (!data[classId]) {
        data[classId] = { className, tasks: {} };
      }
      if (!data[classId].tasks[sub.taskName]) {
        data[classId].tasks[sub.taskName] = [];
      }
      data[classId].tasks[sub.taskName].push(sub);
    });
    return data;
  }, [submissions]);

  const activeClassTasks = useMemo(() => {
    return activeClassId ? groupedData[activeClassId]?.tasks || {} : {};
  }, [activeClassId, groupedData]);

  const handleExpand = taskName => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskName]: !prev[taskName],
    }));
  };

  const handleKeyPress = (e, taskName) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleExpand(taskName);
    }
  };

  const scrollTabs = direction => {
    const tabsElement = document.querySelector(`.${styles.tabs}`);
    if (tabsElement) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabsElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading Submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submissions Overview</h1>
        <div className={styles.filterWrapper}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter Submissions"
          >
            <option value="submissions">Submissions</option>
            <option value="pending_submissions">Pending submissions</option>
            <option value="graded">Graded</option>
            <option value="late">Late Submissions</option>
          </select>
          <FiChevronDown className={styles.filterIcon} />
        </div>
      </div>

      <div className={styles.tabsContainer}>
        <button
          type="button"
          className={styles.scrollButton}
          onClick={() => scrollTabs('left')}
          aria-label="Scroll left"
        >
          <FiChevronLeft size={20} />
        </button>

        <div className={styles.tabs}>
          {Object.keys(groupedData).map(classId => (
            <button
              key={classId}
              type="button"
              className={`${styles.tab} ${activeClassId === classId ? styles.activeTab : ''}`}
              onClick={() => setActiveClassId(classId)}
            >
              {groupedData[classId].className}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.scrollButton}
          onClick={() => scrollTabs('right')}
          aria-label="Scroll right"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      <div className={styles.content}>
        {Object.keys(activeClassTasks).length === 0 ? (
          <div className={styles.noData}>
            <p>No submissions match the current filter.</p>
          </div>
        ) : (
          Object.entries(activeClassTasks).map(([taskName, subs]) => (
            <div key={taskName} className={styles.taskSection}>
              <div
                className={styles.sectionHeader}
                onClick={() => handleExpand(taskName)}
                role="button"
                tabIndex={0}
                aria-expanded={!!expandedTasks[taskName]}
                onKeyPress={e => handleKeyPress(e, taskName)}
              >
                <div className={styles.sectionInfo}>
                  <h3>{taskName}</h3>
                  {subs[0]?.dueAt && (
                    <p className={styles.dueDate}>
                      Due{' '}
                      {new Date(subs[0].dueAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at{' '}
                      {new Date(subs[0].dueAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  )}
                </div>
                <div className={styles.sectionActions}>
                  <span className={styles.submissionCount}>
                    {subs.length} {subs.length === 1 ? 'submission' : 'submissions'}
                  </span>
                  <span className={styles.expandIcon}>
                    {expandedTasks[taskName] ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </div>
              </div>
              {expandedTasks[taskName] && (
                <div className={styles.cardsGrid}>
                  {subs.map(submission => (
                    <SubmissionCard
                      key={
                        submission._id ||
                        `${submission.studentEmail}-${submission.taskName}-${submission.submittedAt}`
                      }
                      submission={submission}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskSubmissionsPage;
