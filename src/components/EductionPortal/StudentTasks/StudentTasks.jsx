// src/components/EductionPortal/StudentTasks/StudentTasks.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './StudentSidebar';
import TaskCard from './TaskCard';
import RubricModal from './RubricModal';
import styles from './StudentTasks.module.css';

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

  const overallProgress = tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    if (filter === 'Incomplete') return task.status === 'Incomplete';
    if (filter === 'Submitted') return task.status === 'Submitted';
    if (filter === 'Graded') return task.status === 'Graded';
    return true;
  });

  const groupedTasks = filteredTasks.reduce((groups, task) => {
    const key =
      groupBy === 'subject'
        ? task.subject
        : groupBy === 'colorLevel'
        ? task.colorLevel
        : groupBy === 'activityGroup'
        ? task.activityGroup
        : task.strategy;
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
    return groups;
  }, {});

  const groupKeys = Object.keys(groupedTasks);
  const [expandedGroups, setExpandedGroups] = useState(
    groupKeys.length > 0 ? { [groupKeys[0]]: true } : {},
  );

  const toggleGroup = key => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sortTasksByDueDate = (a, b) => {
    const today = new Date();
    const aDiff = Math.ceil((new Date(a.dueDate) - today) / (1000 * 60 * 60 * 24));
    const bDiff = Math.ceil((new Date(b.dueDate) - today) / (1000 * 60 * 60 * 24));
    if (aDiff < 0 && bDiff >= 0) return -1;
    if (bDiff < 0 && aDiff >= 0) return 1;
    if (aDiff <= 3 && bDiff > 3) return -1;
    if (bDiff <= 3 && aDiff > 3) return 1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  };

  return (
    <>
      {/* 🔒 Dark backdrop to cover any stray light surfaces */}
      {darkMode && <div className={styles.darkBackdrop} aria-hidden="true" />}

      <div className={`${styles.pageLayout} ${darkMode ? styles.pageLayoutDark : ''}`}>
        <Sidebar />
        <div
          className={`${styles.content} ${darkMode ? styles.contentDark : ''}`}
          style={{ paddingBottom: '4.5rem' }}
        >
          <h2 className={styles.heading}>To Do</h2>

          <div className={styles.filterBar}>
            {['All', 'Incomplete', 'Submitted', 'Graded'].map(type => (
              <button
                key={type}
                className={`${styles.filterBtn} ${filter === type ? styles.activeFilter : ''}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className={styles.groupBar}>
            {['subject', 'colorLevel', 'activityGroup', 'strategy'].map(type => (
              <button
                key={type}
                className={`${styles.groupBtn} ${groupBy === type ? styles.activeGroup : ''}`}
                onClick={() => {
                  setGroupBy(type);
                  setExpandedGroups({ [Object.keys(groupedTasks)[0]]: true });
                }}
              >
                Group by {type}
              </button>
            ))}
          </div>

          <div className={styles.taskList}>
            {Object.keys(groupedTasks).map(key => (
              <div key={key} className={styles.subjectGroup}>
                <button className={styles.subjectHeader} onClick={() => toggleGroup(key)}>
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
