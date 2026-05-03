import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './StudentSidebar';
import TaskCard from './TaskCard';
import RubricModal from './RubricModal';
import { fetchStudentTasks } from '../../../actions/studentTasks';
import styles from './StudentTasks.module.css';

const FILTER_OPTIONS = ['All', 'Incomplete', 'Submitted', 'Graded'];
const GROUP_OPTIONS = ['subject', 'colorLevel', 'activityGroup', 'strategy'];
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Map API status values to display labels used by TaskCard / filters
const STATUS_DISPLAY_MAP = {
  assigned: 'Incomplete',
  in_progress: 'Incomplete',
  completed: 'Submitted',
  graded: 'Graded',
};

// Normalise a Redux task (flat format from actions) into the shape TaskCard expects
const normalizeTask = task => ({
  ...task,
  title: task.subtitle || task.course_name || 'Untitled Task',
  subject: task.subject?.name || task.course_name || 'Unknown Subject',
  colorLevel: task.color_level || 'Unknown',
  activityGroup: task.activity_group || 'Unassigned',
  strategy: task.strategy || 'General',
  description: task.subtitle || '',
  status: STATUS_DISPLAY_MAP[task.status] || 'Incomplete',
  progress:
    task.suggested_total_hours > 0
      ? Math.round((task.logged_hours / task.suggested_total_hours) * 100)
      : 0,
  dueDate: task.dueAt ? new Date(task.dueAt).toISOString().split('T')[0] : 'N/A',
  logged_hours: task.logged_hours || 0,
  suggested_total_hours: task.suggested_total_hours || 0,
});

const StudentTasks = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const reduxTasks = useSelector(state => state.studentTasks?.taskItems || []);
  const loading = useSelector(state => state.studentTasks?.isFetching);

  useEffect(() => {
    dispatch(fetchStudentTasks());
  }, [dispatch]);

  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const prevHtmlBg = htmlEl.style.backgroundColor;
    const prevBodyBg = bodyEl.style.backgroundColor;

    if (darkMode) {
      htmlEl.style.backgroundColor = '#0b1220';
      bodyEl.style.backgroundColor = '#0b1220';
    } else {
      htmlEl.style.backgroundColor = '#f9fafb';
      bodyEl.style.backgroundColor = '#f9fafb';
    }

    return () => {
      htmlEl.style.backgroundColor = prevHtmlBg;
      bodyEl.style.backgroundColor = prevBodyBg;
    };
  }, [darkMode]);

  const tasks = useMemo(() => reduxTasks.map(normalizeTask), [reduxTasks]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('All');
  const [groupBy, setGroupBy] = useState('subject');

  const filteredTasks = useMemo(() => {
    if (filter === 'All') return tasks;
    return tasks.filter(t => t.status === filter);
  }, [tasks, filter]);

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((groups, task) => {
      const keyMap = {
        subject: task.subject,
        colorLevel: task.colorLevel,
        activityGroup: task.activityGroup,
        strategy: task.strategy,
      };
      const key = keyMap[groupBy];
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
      return groups;
    }, {});
  }, [filteredTasks, groupBy]);

  const groupKeys = useMemo(() => Object.keys(groupedTasks), [groupedTasks]);

  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (groupKeys.length > 0) {
      setExpandedGroups(prev => {
        const stillValid = Object.fromEntries(
          Object.entries(prev).filter(([k]) => groupKeys.includes(k)),
        );
        if (Object.keys(stillValid).length > 0) return stillValid;
        return { [groupKeys[0]]: true };
      });
    } else {
      setExpandedGroups({});
    }
  }, [groupKeys]);

  const toggleGroup = key => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sortTasksByDueDate = (a, b) => {
    const today = new Date();
    const aDiff = Math.ceil((new Date(a.dueDate) - today) / MS_PER_DAY);
    const bDiff = Math.ceil((new Date(b.dueDate) - today) / MS_PER_DAY);

    if (aDiff < 0 && bDiff >= 0) return -1;
    if (bDiff < 0 && aDiff >= 0) return 1;
    if (aDiff <= 3 && bDiff > 3) return -1;
    if (bDiff <= 3 && aDiff > 3) return 1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  };

  return (
    <>
      {darkMode && <div className={styles.darkBackdrop} aria-hidden="true" />}

      <div className={`${styles.pageLayout} ${darkMode ? styles.pageLayoutDark : ''}`}>
        <Sidebar />

        <div
          className={`${styles.content} ${darkMode ? styles.contentDark : ''}`}
          style={{ paddingBottom: '4.5rem' }}
        >
          <h2 className={styles.heading}>To Do</h2>

          <div className={styles.filterBar}>
            {FILTER_OPTIONS.map(type => (
              <button
                key={type}
                className={`${styles.filterBtn} ${filter === type ? styles.activeFilter : ''}`}
                type="button"
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className={styles.groupBar}>
            {GROUP_OPTIONS.map(type => (
              <button
                key={type}
                className={`${styles.groupBtn} ${groupBy === type ? styles.activeGroup : ''}`}
                type="button"
                onClick={() => setGroupBy(type)}
              >
                Group by {type}
              </button>
            ))}
          </div>

          {loading && <p className={styles.loadingMsg}>Loading tasks…</p>}

          <div className={styles.taskList}>
            {!loading && groupKeys.length === 0 && (
              <p className={styles.emptyMsg}>No tasks found.</p>
            )}
            {groupKeys.map(key => (
              <div key={key} className={styles.subjectGroup}>
                <button
                  className={styles.subjectHeader}
                  type="button"
                  aria-expanded={!!expandedGroups[key]}
                  onClick={() => toggleGroup(key)}
                >
                  <span>{key}</span>
                  <span>{expandedGroups[key] ? '−' : '+'}</span>
                </button>

                {expandedGroups[key] && (
                  <div className={styles.subjectTasks}>
                    {groupedTasks[key].sort(sortTasksByDueDate).map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpenRubric={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedTask && <RubricModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
      </div>
    </>
  );
};

export default StudentTasks;
