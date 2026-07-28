import { useMemo, useState } from 'react';
import styles from './DailyLogPage.module.css';
import LogItemCard from './LogItemCard';
import { useDailyLog } from './DailyLogContext';
import { formatDuration, getCurrentWeekRange, parseDurationToMin } from './dailyLogUtils';

const courseOptions = [
  'Mathematics 101 - Algebra Fundamentals',
  'English 200 - Creative Writing',
  'Science 150 - Biology Basics',
];

function getDefaultFormState() {
  return {
    course: courseOptions[0],
    badge: 'Pending Review',
    notes: '',
  };
}

const hourOptions = Array.from({ length: 13 }, (_, i) => i);
const minuteOptions = [0, 15, 30, 45];

export default function DailyLogPage() {
  const { logs, addLog } = useDailyLog();

  const [showForm, setShowForm] = useState(false);
  const [durationH, setDurationH] = useState(0);
  const [durationM, setDurationM] = useState(0);
  const [newLog, setNewLog] = useState(() => getDefaultFormState());
  const [validationError, setValidationError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const resetForm = () => {
    setDurationH(0);
    setDurationM(0);
    setNewLog(getDefaultFormState());
    setValidationError('');
    setFormSuccess('');
  };

  const handleOpenForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const { totalMin, weekMin, weekCount, activeCourses } = useMemo(() => {
    const now = new Date();
    const { start, end } = getCurrentWeekRange(now);

    let totalMinutes = 0;
    let weeklyMinutes = 0;
    let weeklyCount = 0;
    const courseSet = new Set();

    logs.forEach(row => {
      const durationMinutes = parseDurationToMin(row.metadata?.duration);
      totalMinutes += durationMinutes;
      courseSet.add(row.metadata?.course);

      const createdAt = new Date(row.created_at);
      if (!Number.isNaN(createdAt.getTime()) && createdAt >= start && createdAt <= end) {
        weeklyMinutes += durationMinutes;
        weeklyCount += 1;
      }
    });

    return {
      totalMin: totalMinutes,
      weekMin: weeklyMinutes,
      weekCount: weeklyCount,
      activeCourses: courseSet.size,
    };
  }, [logs]);

  const handleSave = e => {
    e.preventDefault();
    const totalMinutes = durationH * 60 + durationM;

    if (totalMinutes <= 0) {
      setValidationError('Duration must be greater than zero.');
      setFormSuccess('');
      return;
    }

    const id = crypto
      .getRandomValues(new Uint8Array(6))
      .reduce((s, b) => s + b.toString(36), '')
      .slice(0, 8);

    const nowIso = new Date().toISOString();
    const duration = formatDuration(totalMinutes);

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
    resetForm();
    setFormSuccess('Time log saved.');
  };

  const weeklyEntryLabel = weekCount === 1 ? '1 log entry' : `${weekCount} log entries`;

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <h1 className={styles.pageTitle}>Student Dashboard</h1>
        <button className={styles.btnPrimary} onClick={handleOpenForm}>
          + New Time Log
        </button>
      </div>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Time Logged</div>
          <div className={styles.statValue}>{formatDuration(totalMin)}</div>
          <div className={styles.statSub}>Across all courses</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>This Week</div>
          <div className={styles.statValue}>{formatDuration(weekMin)}</div>
          <div className={styles.statSub}>{weeklyEntryLabel}</div>
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
                  onChange={e => {
                    const nextHours = Number(e.target.value);
                    setDurationH(nextHours);
                    if (nextHours * 60 + durationM > 0) setValidationError('');
                  }}
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
                  onChange={e => {
                    const nextMinutes = Number(e.target.value);
                    setDurationM(nextMinutes);
                    if (durationH * 60 + nextMinutes > 0) setValidationError('');
                  }}
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
                onChange={e => {
                  setNewLog({ ...newLog, notes: e.target.value });
                  setValidationError('');
                  setFormSuccess('');
                }}
              />
            </div>

            {validationError && (
              <div role="alert" className={`${styles.formMessage} ${styles.formMessageError}`}>
                {validationError}
              </div>
            )}

            {formSuccess && (
              <div className={`${styles.formMessage} ${styles.formMessageSuccess}`}>
                {formSuccess}
              </div>
            )}

            <div className={styles.formActions}>
              <button type="button" className={styles.btnGhost} onClick={handleCancel}>
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
