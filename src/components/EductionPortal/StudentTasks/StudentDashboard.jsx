import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentTasks } from '~/actions/studentTasks';
import TaskTimer from '../StudentDashboard/TaskTimer';
import styles from './StudentDashboard.module.css';

const LIFE_CARD_IDS = ['lc-a', 'lc-b', 'lc-c', 'lc-d', 'lc-e', 'lc-f'];

export default function StudentDashboard() {
  const history = useHistory();
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const tasks = useSelector(state => state.studentTasks?.taskItems || []);

  useEffect(() => {
    dispatch(fetchStudentTasks());
  }, [dispatch]);

  const subjects = [
    'Arts/ Trades',
    'English',
    'Health',
    'Math',
    'Science',
    'Social Sciences',
    'Tech & Innovation',
    'Values',
  ];

  return (
    <div className={`${styles.pageLayout} ${darkMode ? styles.pageLayoutDark : ''}`}>
      <div className={`${styles.content} ${darkMode ? styles.contentDark : ''}`}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Dashboard</h1>
          <TaskTimer tasks={tasks} />
          <div className={styles.welcomeArea}>
            <span className={styles.welcomeLabel}>Welcome, Student Name</span>
            <div className={styles.icons}>
              <span className={styles.icon} aria-hidden="true">
                👤
              </span>
              <span className={styles.icon} aria-hidden="true">
                🔔
              </span>
            </div>
          </div>
        </div>
        <hr className={styles.divider} />

        <div className={styles.mainGrid}>
          <section className={styles.visualArea} aria-label="Knowledge map">
            <div className={styles.visualPlaceholder} />
          </section>

          <aside className={styles.todoPanel} aria-label="To Do">
            <div className={styles.todoHeaderRow}>
              <h2 className={styles.todoTitle}>To Do</h2>
              <button
                className={styles.viewAllBtn}
                type="button"
                onClick={() => history.push('/educationportal/student/tasks')}
              >
                View all tasks
              </button>
            </div>
            <hr className={styles.todoDivider} />

            <ul className={styles.todoList}>
              {tasks.map(task => (
                <li key={task.id || task._id} className={styles.todoItem}>
                  <button
                    className={styles.todoBtn}
                    type="button"
                    onClick={() =>
                      history.push(`/educationportal/student/tasks/${task.id || task._id}`)
                    }
                    aria-label={`Open ${task.course_name || task.title}`}
                  >
                    <div className={styles.todoText}>
                      <div className={styles.todoName}>{task.course_name || task.title}</div>
                      <div className={styles.todoSub}>
                        {task.subtitle || task.lessonPlan?.title}
                      </div>
                    </div>
                    <div className={styles.todoRight}>
                      <div className={styles.progressTrack} aria-hidden="true">
                        <div
                          className={styles.progressFill}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                      <span className={styles.chev} aria-hidden="true">
                        →
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Teaching Strategies</h3>
              <hr className={styles.blockDivider} />
              <ul className={styles.strategyList}>
                {[
                  'Body Smart Exploration',
                  'Crazy Creative Combo Cooperative',
                  'Curious Copycat',
                  'Existential Smart Exploration',
                  'Freedom Learning',
                ].map(s => (
                  <li key={s} className={styles.strategyItem}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Life Strategies</h3>
              <hr className={styles.blockDivider} />
              <div className={styles.lifeGrid}>
                {LIFE_CARD_IDS.map(id => (
                  <div key={id} className={styles.lifeCard} />
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className={styles.subjectChips}>
          {subjects.map(s => (
            <span key={s} className={styles.chip}>
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
