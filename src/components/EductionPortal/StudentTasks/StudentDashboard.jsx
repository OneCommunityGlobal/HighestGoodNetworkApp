import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './StudentSidebar';
import styles from './StudentDashboard.module.css';

const LIFE_CARD_IDS = ['lc-a', 'lc-b', 'lc-c', 'lc-d', 'lc-e', 'lc-f'];

export default function StudentDashboard() {
  const history = useHistory();
  const darkMode = useSelector(state => state.theme?.darkMode);

  const tasks = [
    {
      id: 1,
      title: 'Activity 1: Technology, Art, Trades, Health',
      subtitle: 'Technology, Art, Trades, Health',
      progress: 25,
    },
    {
      id: 2,
      title: 'Activity 2: Math, Science, Innovation',
      subtitle: 'Math, Science, Innovation',
      progress: 50,
    },
    {
      id: 3,
      title: 'Activity 3: Social Sciences, English, Values',
      subtitle: 'Social Sciences, English, Values',
      progress: 33,
    },
  ];

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
      <Sidebar active="home" />
      <div className={`${styles.content} ${darkMode ? styles.contentDark : ''}`}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Dashboard</h1>
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
              {tasks.map(t => (
                <li key={t.id} className={styles.todoItem}>
                  <button
                    className={styles.todoBtn}
                    type="button"
                    onClick={() => history.push(`/educationportal/student/tasks/${t.id}`)}
                    aria-label={`Open ${t.title}`}
                  >
                    <div className={styles.todoText}>
                      <div className={styles.todoName}>{t.title}</div>
                      <div className={styles.todoSub}>{t.subtitle}</div>
                    </div>
                    <div className={styles.todoRight}>
                      <div className={styles.progressTrack} aria-hidden="true">
                        <div className={styles.progressFill} style={{ width: `${t.progress}%` }} />
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
