import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Bell,
  BookOpen,
  ChartNoAxesColumn,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Compass,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Wrench,
} from 'lucide-react';
import styles from './StudentDashboard.module.css';

const subjects = [
  { name: 'Arts/ Trades', complete: 5, total: 10, color: '#ec4899' },
  { name: 'English', complete: 12, total: 15, color: '#f59e0b' },
  { name: 'Health', complete: 4, total: 8, color: '#14b8a6' },
  { name: 'Math', complete: 8, total: 12, color: '#6366f1' },
  { name: 'Science', complete: 9, total: 12, color: '#22c55e' },
  { name: 'Social Sciences', complete: 6, total: 10, color: '#06b6d4' },
  { name: 'Tech & Innovation', complete: 7, total: 10, color: '#8b5cf6' },
  { name: 'Values', complete: 3, total: 6, color: '#f97316' },
];

const tasks = [
  { id: 1, title: 'Activity 1', subtitle: 'Technology, Art, Trades, Health', progress: 25 },
  { id: 2, title: 'Activity 2', subtitle: 'Math, Science, Innovation', progress: 50 },
  { id: 3, title: 'Activity 3', subtitle: 'Social Sciences, English, Values', progress: 33 },
];

const navigation = [
  { label: 'Homepage', icon: LayoutDashboard, to: '/educationportal/dashboard' },
  { label: 'Knowledge Evolution', icon: Compass, to: '/student/knowledge-evolution' },
  { label: 'Past Lesson Plans', icon: BookOpen, to: '/educationportal/lesson-library' },
  { label: 'My Saved Interests', icon: GraduationCap, to: '/educationportal/lesson-library' },
  { label: 'Evaluation results', icon: ClipboardList, to: '/educationportal/evaluation-results' },
  { label: 'Analytics', icon: ChartNoAxesColumn, to: '/educationportal/InsightWidget' },
  { label: 'Build Lesson Plan', icon: Wrench, to: '/educationportal/tasks/upload' },
];

const mapNodes = [
  { name: 'Arts', x: 50, y: 14, color: '#ec4899' },
  { name: 'English', x: 77, y: 25, color: '#f59e0b' },
  { name: 'Health', x: 86, y: 53, color: '#14b8a6' },
  { name: 'Math', x: 70, y: 80, color: '#6366f1' },
  { name: 'Science', x: 31, y: 81, color: '#22c55e' },
  { name: 'Social Sciences', x: 14, y: 54, color: '#06b6d4' },
  { name: 'Tech & Innovation', x: 24, y: 25, color: '#8b5cf6' },
  { name: 'Values', x: 50, y: 92, color: '#f97316' },
];

export default function StudentDashboard() {
  const history = useHistory();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const authUser = useSelector(state => state.auth?.user);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All subjects');
  const [notice, setNotice] = useState('');

  const studentName = authUser?.firstName || 'Student';
  const filteredSubjects = useMemo(
    () =>
      selectedSubject === 'All subjects'
        ? subjects
        : subjects.filter(subject => subject.name === selectedSubject),
    [selectedSubject],
  );

  const logOut = () => {
    if (globalThis.sessionStorage) globalThis.sessionStorage.setItem('gePortalLoggedOut', 'true');
    history.push('/dashboard');
  };

  return (
    <div
      className={`${styles.dashboard} ${darkMode ? styles.dark : ''}`}
      data-testid="student-dashboard"
    >
      <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            GE
          </span>
          {!collapsed && <span className={styles.brandName}>Good Education</span>}
          <button
            className={styles.collapseButton}
            type="button"
            onClick={() => setCollapsed(value => !value)}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
        <nav className={styles.navigation} aria-label="Student dashboard navigation">
          {navigation.map(({ label, icon: Icon, to }) => (
            <button
              key={label}
              type="button"
              className={`${styles.navItem} ${label === 'Homepage' ? styles.navActive : ''}`}
              onClick={() => history.push(to)}
              aria-current={label === 'Homepage' ? 'page' : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon size={19} aria-hidden="true" />
              {!collapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <button
            className={styles.navItem}
            type="button"
            onClick={() => setNotice('Settings are not available yet.')}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={19} aria-hidden="true" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button
            className={styles.navItem}
            type="button"
            onClick={logOut}
            title={collapsed ? 'Log out' : undefined}
          >
            <LogOut size={19} aria-hidden="true" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <Menu size={20} aria-hidden="true" />
            <h1>Dashboard</h1>
          </div>
          <div className={styles.userArea}>
            <span>Welcome, {studentName}</span>
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Notifications"
              onClick={() => setNotice('You are all caught up.')}
            >
              <Bell size={19} />
            </button>
            {authUser?.profilePic ? (
              <img
                className={styles.avatar}
                src={authUser.profilePic}
                alt={`${studentName} profile`}
              />
            ) : (
              <span className={styles.avatar} aria-label={`${studentName} profile`}>
                {studentName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </header>

        <div className={styles.workspace}>
          {notice && (
            <div role="status" className={styles.notice}>
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice('')} aria-label="Dismiss message">
                ×
              </button>
            </div>
          )}
          <div className={styles.dashboardGrid}>
            <section className={styles.learningColumn} aria-label="Learning progress">
              <div className={styles.mapCard}>
                <div className={styles.sectionHeading}>
                  <div>
                    <p className={styles.eyebrow}>YOUR LEARNING JOURNEY</p>
                    <h2>Knowledge Evolution</h2>
                  </div>
                  <span className={styles.mapLegend}>
                    <i /> Subject areas
                  </span>
                </div>
                <div className={styles.map} role="group" aria-label="Knowledge map subjects">
                  <svg
                    className={styles.connections}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {mapNodes.map(node => (
                      <line key={node.name} x1="50" y1="51" x2={node.x} y2={node.y} />
                    ))}
                  </svg>
                  {mapNodes.map(node => (
                    <button
                      key={node.name}
                      type="button"
                      className={`${styles.mapNode} ${
                        selectedSubject === node.name ? styles.mapNodeSelected : ''
                      }`}
                      style={{ left: `${node.x}%`, top: `${node.y}%`, '--node-color': node.color }}
                      onClick={() => setSelectedSubject(node.name)}
                      aria-pressed={selectedSubject === node.name}
                    >
                      <span className={styles.nodeDot} />
                      {node.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles.mapHub}
                    onClick={() => setSelectedSubject('All subjects')}
                    aria-label="Show all subjects"
                  >
                    My
                    <br />
                    Learning
                  </button>
                </div>
              </div>

              <section className={styles.progressCard} aria-labelledby="progress-title">
                <div className={styles.progressHeading}>
                  <div>
                    <p className={styles.eyebrow}>KEEP MOVING FORWARD</p>
                    <h2 id="progress-title">Subject Progress</h2>
                  </div>
                  <span className={styles.progressSummary}>{filteredSubjects.length} subjects</span>
                </div>
                <div
                  className={styles.subjectFilters}
                  role="group"
                  aria-label="Filter progress by subject"
                >
                  <button
                    type="button"
                    className={`${styles.filterPill} ${
                      selectedSubject === 'All subjects' ? styles.filterSelected : ''
                    }`}
                    aria-pressed={selectedSubject === 'All subjects'}
                    onClick={() => setSelectedSubject('All subjects')}
                  >
                    All subjects
                  </button>
                  {subjects.map(subject => (
                    <button
                      key={subject.name}
                      type="button"
                      className={`${styles.filterPill} ${
                        selectedSubject === subject.name ? styles.filterSelected : ''
                      }`}
                      aria-pressed={selectedSubject === subject.name}
                      onClick={() => setSelectedSubject(subject.name)}
                    >
                      {subject.name}
                    </button>
                  ))}
                </div>
                <div className={styles.progressGrid}>
                  {filteredSubjects.map(subject => {
                    const percent = Math.round((subject.complete / subject.total) * 100);
                    return (
                      <article key={subject.name} className={styles.subjectProgress}>
                        <div className={styles.subjectLine}>
                          <span className={styles.subjectName}>
                            <i style={{ backgroundColor: subject.color }} />
                            {subject.name}
                          </span>
                          <strong>
                            {subject.complete}/{subject.total}
                          </strong>
                        </div>
                        <div
                          className={styles.barTrack}
                          role="progressbar"
                          aria-label={`${subject.name} progress`}
                          aria-valuenow={percent}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <span style={{ width: `${percent}%`, backgroundColor: subject.color }} />
                        </div>
                        <span className={styles.percent}>{percent}% complete</span>
                      </article>
                    );
                  })}
                </div>
              </section>
            </section>

            <aside className={styles.rightColumn} aria-label="Student resources">
              <section className={styles.todoPanel} aria-labelledby="todo-title">
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.eyebrow}>UP NEXT</p>
                    <h2 id="todo-title">To Do</h2>
                  </div>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => history.push('/educationportal/student/tasks')}
                  >
                    View all tasks <ChevronRight size={15} />
                  </button>
                </div>
                <div className={styles.todoList}>
                  {tasks.map(task => (
                    <button
                      key={task.id}
                      type="button"
                      className={styles.todoItem}
                      onClick={() => history.push(`/educationportal/student/tasks/${task.id}`)}
                    >
                      <span className={styles.taskIcon}>
                        <ClipboardList size={18} />
                      </span>
                      <span className={styles.taskDetails}>
                        <strong>{task.title}</strong>
                        <small>{task.subtitle}</small>
                        <span className={styles.taskBar}>
                          <i style={{ width: `${task.progress}%` }} />
                        </span>
                      </span>
                      <ChevronRight className={styles.taskArrow} size={17} />
                    </button>
                  ))}
                </div>
              </section>
              <section className={styles.resourcePanel} aria-labelledby="strategies-title">
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.eyebrow}>IDEAS FOR YOU</p>
                    <h2 id="strategies-title">Teaching Strategies</h2>
                  </div>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => history.push('/educationportal/lesson-library')}
                  >
                    Explore <ChevronRight size={15} />
                  </button>
                </div>
                <ul className={styles.strategyList}>
                  {[
                    'Body Smart Exploration',
                    'Crazy Creative Combo Cooperative',
                    'Curious Copycat',
                    'Existential Smart Exploration',
                    'Freedom Learning',
                  ].map((strategy, index) => (
                    <li key={strategy}>
                      <span className={styles.strategyNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {strategy}
                      <ChevronRight size={15} />
                    </li>
                  ))}
                </ul>
              </section>
              <section className={styles.lifePanel} aria-labelledby="life-title">
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.eyebrow}>BUILD HEALTHY HABITS</p>
                    <h2 id="life-title">Life Strategies</h2>
                  </div>
                </div>
                <div className={styles.lifeCards}>
                  <span>Focus</span>
                  <span>Curiosity</span>
                  <span>Balance</span>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
