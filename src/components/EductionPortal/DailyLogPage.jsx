import { useMemo, useState } from "react";
import styles from "./DailyLogPage.module.css";
import LogItemCard from "./LogItemCard";

const parseDurationToMin = (str) => {
  if (!str) return 0;
  const h = /(\d+)\s*h/i.exec(str)?.[1];
  const m = /(\d+)\s*m/i.exec(str)?.[1];
  return Number(h || 0) * 60 + Number(m || 0);
};

const formatMin = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};

export default function DailyLogPage() {
  const courseOptions = [
    "Mathematics 101 - Algebra Fundamentals",
    "English 200 - Creative Writing",
    "Science 150 - Biology Basics",
  ];

  const [logs, setLogs] = useState([
    {
      log_id: "lg-2",
      actor_id: "s-1",
      action_type: "task_upload",
      entity_id: "time-log-101",
      metadata: {
        course: "Mathematics 101 - Algebra Fundamentals",
        duration: "2h 0m",
        grade: "A-",
        badge: "Graded (A-)",
        link: "/time-logs/101",
        comments_count: 8,
        notes: "Worked on quadratic equations practice and reviewed feedback.",
      },
      created_at: "2025-09-10T14:00:00Z",
    },
    {
      log_id: "lg-3",
      actor_id: "s-1",
      action_type: "task_upload",
      entity_id: "time-log-102",
      metadata: {
        course: "English 200 - Creative Writing",
        duration: "1h 30m",
        badge: "Reviewed",
        link: "/time-logs/102",
        notes: "Drafted a short story outline and edited the introduction.",
      },
      created_at: "2025-09-09T16:00:00Z",
    },
    {
      log_id: "lg-4",
      actor_id: "s-1",
      action_type: "task_upload",
      entity_id: "time-log-103",
      metadata: {
        course: "Science 150 - Biology Basics",
        duration: "1h 15m",
        badge: "Pending Review",
        link: "/time-logs/103",
        notes: "Completed notes on cell structure and watched lecture video.",
      },
      created_at: "2025-09-08T18:00:00Z",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState({
    course: courseOptions[0],
    duration: "",
    badge: "Pending Review",
    notes: "",
  });

  const { totalMin, weekMin, weekCount, activeCourses } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    let tMin = 0;
    let wMin = 0;
    let wCount = 0;
    const courseSet = new Set();

    logs.forEach((row) => {
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

  const handleSave = (e) => {
    e.preventDefault();
    const id = Math.random().toString(36).slice(2, 8);
    const nowIso = new Date().toISOString();

    const log = {
      log_id: `lg-${id}`,
      actor_id: "s-1",
      action_type: "task_upload",
      entity_id: `time-log-${id}`,
      metadata: {
        course: newLog.course,
        duration: newLog.duration,
        badge: newLog.badge,
        notes: newLog.notes,
        link: `/time-logs/${id}`,
      },
      created_at: nowIso,
    };

    setLogs((prev) => [log, ...prev]);
    setShowForm(false);
    setNewLog({
      course: courseOptions[0],
      duration: "",
      badge: "Pending Review",
      notes: "",
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
                onChange={(e) =>
                  setNewLog({ ...newLog, course: e.target.value })
                }
              >
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <label htmlFor="durationInput">Duration</label>
              <input
                id="durationInput"
                type="text"
                className={styles.input}
                placeholder="e.g. 1h 20m"
                value={newLog.duration}
                onChange={(e) =>
                  setNewLog({ ...newLog, duration: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formRow}>
              <label htmlFor="notesTextarea">Notes</label>
              <textarea
                id="notesTextarea"
                className={`${styles.input} ${styles.textarea}`}
                rows={4}
                placeholder="Describe what you worked on in this time"
                value={newLog.notes}
                onChange={(e) =>
                  setNewLog({ ...newLog, notes: e.target.value })
                }
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary}>
                Save
              </button>
            </div>
          </form>
        )}

        <div className={styles.list}>
          {logs.map((row) => (
            <LogItemCard key={row.log_id} row={row} />
          ))}
        </div>
      </section>
    </div>
  );
}
