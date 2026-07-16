import { useMemo, useState } from 'react';
import styles from './DailyLogPage.module.css';
import LogItemCard from './LogItemCard';
import { useDailyLog } from './DailyLogContext';

const parseDurationToMin = str => {
  if (!str) return 0;
  const hMatch = str.match(/^\s*(\d+)\s*h\b/i);
  const mMatch = str.match(/^\s*(\d+)\s*m\b/i);

  const h = hMatch ? hMatch[1] : 0;
  const m = mMatch ? mMatch[1] : 0;
  return Number(h || 0) * 60 + Number(m || 0);
};

const formatMin = min => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};

const hourOptions = Array.from({ length: 13 }, (_, i) => i);
const minuteOptions = [0, 15, 30, 45];

export default function DailyLogPage() {
  const { logs, addLog } = useDailyLog();

  const courseOptions = [
    'Mathematics 101 - Algebra Fundamentals',
    'English 200 - Creative Writing',
    'Science 150 - Biology Basics',
  ];

  const [showForm, setShowForm] = useState(false);
  const [durationH, setDurationH] = useState(0);
  const [durationM, setDurationM] = useState(0);
  const [newLog, setNewLog] = useState({
    course: courseOptions[0],
    badge: 'Pending Review',
    notes: '',
  });

  const { totalMin, weekMin, weekCount, activeCourses } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    let tMin = 0;
    let wMin = 0;
    let wCount = 0;
    const courseSet = new Set();

    logs.forEach(row => {
      const dur = parseDurationToMin(row.metadata?.duration);
      tMin += dur;
      courseSet.add(row.metadata?.course);

      const created = new Date(row.created_at);
      if (created >= weekAgo && created <= now) {
        wMin += dur;
        wCount += 1;
      }
    });

    return {
      totalMin: tMin,
      weekMin: wMin || tMin,
      weekCount: wCount || logs.length,
      activeCourses: courseSet.size || 3,
    };
  }, [logs]);

  const handleSave = e => {
    e.preventDefault();
    const id = crypto
      .getRandomValues(new Uint8Array(6))
      .reduce((s, b) => s + b.toString(36), '')
      .slice(0, 8);

    const nowIso = new Date().toISOString();
    const duration = `${durationH}h ${durationM}m`;

    const log = {
      log_id: `lg-${id}`,
      actor_id: 's-1',
      action_type: 'task_upload',
      entity_id: `time-log-${id}`,
      metadata: {
        course: newLog.course,
        duration,
        badge: newLog.badge,
        notes: newLog.notes,
        link: `/time-logs/${id}`,
        noteToTeacher: '',
        teacherFeedback: '',
      },
      created_at: nowIso,
    };

    addLog(log);
    setShowForm(false);
    setDurationH(0);
    setDurationM(0);
    setNewLog({
      course: courseOptions[0],
      badge: 'Pending Review',
      notes: '',
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <h1 className={styles.pageTitle}>Student Dashboard</h1>
        <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
          + New Time Log
        </button>
      </div>

      {/* Stats */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Time Logged</div>
          <div className={styles.statValue}>{formatMin(totalMin)}</div>
          <div className={styles.statSub}>Across all courses</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>This Week</div>
          <div className={styles.statValue}>{formatMin(weekMin)}</div>
          <div className={styles.statSub}>{weekCount} log entries</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active Courses</div>
          <div className={styles.statValue}>{activeCourses}</div>
          <div className={styles.statSub}>Currently enrolled</div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.headerTitle}>Recent Time Logs</h3>
        </div>

        {showForm && (
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.formRow}>
              <label htmlFor="courseSelect">Course</label>
              <select
                id="courseSelect"
                className={styles.input}
                value={newLog.course}
                onChange={e => setNewLog({ ...newLog, course: e.target.value })}
              >
                {courseOptions.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <label htmlFor="durationHours">Duration</label>
              <div className={styles.durationSelects}>
                <select
                  id="durationHours"
                  className={styles.input}
                  value={durationH}
                  onChange={e => setDurationH(Number(e.target.value))}
                  aria-label="Hours"
                >
                  {hourOptions.map(h => (
                    <option key={h} value={h}>
                      {h}h
                    </option>
                  ))}
                </select>
                <select
                  id="durationMinutes"
                  className={styles.input}
                  value={durationM}
                  onChange={e => setDurationM(Number(e.target.value))}
                  aria-label="Minutes"
                >
                  {minuteOptions.map(m => (
                    <option key={m} value={m}>
                      {m}m
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <label htmlFor="notesTextarea">Notes</label>
              <textarea
                id="notesTextarea"
                className={`${styles.input} ${styles.textarea}`}
                rows={4}
                placeholder="Describe what you worked on in this time"
                value={newLog.notes}
                onChange={e => setNewLog({ ...newLog, notes: e.target.value })}
              />
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.btnGhost} onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Save
              </button>
            </div>
          </form>
        )}

        <div className={styles.list}>
          {logs.map(row => (
            <LogItemCard key={row.log_id} row={row} />
          ))}
        </div>
      </section>
    </div>
  );
}
