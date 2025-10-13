import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import SubmissionCard from './SubmissionCard';
import styles from './TaskSubmissionsPage.module.css';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const TaskSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeClassId, setActiveClassId] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${process.env.REACT_APP_APIENDPOINT}/educationportal/educator/task-submissions`,
        );
        const fetchedSubmissions = res.data || [];
        setSubmissions(fetchedSubmissions);

        if (fetchedSubmissions.length > 0) {
          const classIds = [...new Set(fetchedSubmissions.map(sub => sub.lessonPlanId))];
          if (classIds.length > 0) {
            setActiveClassId(classIds[0]);
          }
          const firstClassTasks = fetchedSubmissions.filter(
            sub => sub.lessonPlanId === classIds[0],
          );
          if (firstClassTasks.length > 0) {
            setExpandedTasks({ [firstClassTasks[0].taskName]: true });
          }
        }
      } catch (err) {
        setError('Failed to load submissions. Please try again.');
        // The console.error was here, it has been removed.
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const groupedData = useMemo(() => {
    const data = {};
    submissions.forEach(sub => {
      if (!sub.lessonPlanId || !sub.taskName) return;

      const classId = sub.lessonPlanId;
      const className = sub.className || `Class ${classId.slice(-1)}`;

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

  const filteredTasks = useMemo(() => {
    const filtered = {};
    Object.entries(activeClassTasks).forEach(([taskName, subs]) => {
      const filteredSubs = subs.filter(sub => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'received' && sub.status === 'Pending Review') return true;
        if (filterStatus === 'pending') return false;
        return false;
      });
      if (filteredSubs.length > 0) {
        filtered[taskName] = filteredSubs;
      }
    });
    return filtered;
  }, [activeClassTasks, filterStatus]);

  const handleExpand = taskName => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskName]: !prev[taskName],
    }));
  };

  if (loading) return <div className={styles.loadingState}>Loading submissions...</div>;
  if (error) return <div className={styles.errorState}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submissions Overview</h1>
        <div className={styles.filterWrapper}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter submissions"
          >
            <option value="all">Select student list</option>
            <option value="received">Submissions received</option>
            <option value="pending">Submissions pending</option>
          </select>
          <FiChevronDown className={styles.filterIcon} />
        </div>
      </div>

      <div className={styles.tabs}>
        {Object.keys(groupedData).map(classId => (
          <button
            key={classId}
            className={`${styles.tab} ${activeClassId === classId ? styles.activeTab : ''}`}
            onClick={() => setActiveClassId(classId)}
          >
            {groupedData[classId].className}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {Object.keys(filteredTasks).length === 0 ? (
          <div className={styles.noData}>
            <p>No submissions match the current filter.</p>
          </div>
        ) : (
          Object.entries(filteredTasks).map(([taskName, subs]) => (
            <div key={taskName} className={styles.taskSection}>
              <div
                className={styles.sectionHeader}
                onClick={() => handleExpand(taskName)}
                role="button"
                tabIndex={0}
                aria-expanded={!!expandedTasks[taskName]}
                onKeyPress={e => {
                  if (['Enter', ' '].includes(e.key)) {
                    handleExpand(taskName);
                  }
                }}
              >
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
                <span className={styles.expandIcon}>
                  {expandedTasks[taskName] ? <FiChevronUp /> : <FiChevronDown />}
                </span>
              </div>
              {expandedTasks[taskName] && (
                <div className={styles.cardsGrid}>
                  {subs.map(submission => (
                    <SubmissionCard key={submission._id} submission={submission} />
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
