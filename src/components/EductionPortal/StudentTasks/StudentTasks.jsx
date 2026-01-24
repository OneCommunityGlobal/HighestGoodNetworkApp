import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './StudentSidebar';
import TaskCard from './TaskCard';
import RubricModal from './RubricModal';
import styles from './StudentTasks.module.css';

const FILTER_OPTIONS = ['All', 'Incomplete', 'Submitted', 'Graded'];
const GROUP_OPTIONS = ['subject', 'colorLevel', 'activityGroup', 'strategy'];
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const StudentTasks = () => {
  const darkMode = useSelector(state => state.theme?.darkMode);

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

  const [tasks] = useState([
    {
      id: 1,
      title: 'Activity 1: Technology, Art, Trades, Health',
      subject: 'Technology / Art / Health',
      colorLevel: 'Red',
      activityGroup: 'Creative Projects',
      strategy: 'Teaching Strategy',
      description:
        'Choose a person listed in the Technology Subject Page and a related trade. Visit at least 1 location and observe 5 professionals in action. Create a blog post or video.',
      status: 'Incomplete',
      progress: 25,
      dueDate: '2025-10-15',
      rubric: ['Clarity', 'Creativity', 'Effort'],
    },
    {
      id: 2,
      title: 'Activity 2: Math, Science, Innovation',
      subject: 'Math / Science',
      colorLevel: 'Blue',
      activityGroup: 'Research Assignments',
      strategy: 'Life Strategy',
      description:
        'Research patterns of climate bands and write a pamphlet showing your findings. Distribute pamphlets to students.',
      status: 'Submitted',
      progress: 50,
      dueDate: '2025-10-20',
      rubric: ['Accuracy', 'Presentation', 'Depth of Research'],
    },
    {
      id: 3,
      title: 'Activity 3: Social Sciences, English, Values',
      subject: 'Social Sciences / English',
      colorLevel: 'Violet',
      activityGroup: 'Written Work',
      strategy: 'Teaching Strategy',
      description:
        'Write a 10–15 page research paper on cultural development. Include fictional story and empathy-driven examples.',
      status: 'Graded',
      progress: 80,
      dueDate: '2025-10-25',
      rubric: ['Critical Thinking', 'Empathy', 'Writing Style'],
    },
  ]);

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

          <div className={styles.taskList}>
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
