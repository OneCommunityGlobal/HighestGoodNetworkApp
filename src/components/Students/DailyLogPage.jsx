import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./DailyLogPage.module.css";

export default function DailyLogPage() {
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
      },
      created_at: "2025-09-08T18:00:00Z",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newLog, setNewLog] = useState({
    course: "",
    duration: "",
    badge: "Pending Review",
  });

  const handleSave = (e) => {
    e.preventDefault();
    const id = Math.random().toString(36).slice(2, 8);
    const now = new Date().toISOString();

    const log = {
      log_id: `lg-${id}`,
      actor_id: "s-1",
      action_type: "task_upload",
      entity_id: `time-log-${id}`,
      metadata: {
        course: newLog.course,
        duration: newLog.duration,
        badge: newLog.badge,
        link: `/time-logs/${id}`,
      },
      created_at: now,
    };

    setLogs([log, ...logs]);
    setShowForm(false);
    setNewLog({ course: "", duration: "", badge: "Pending Review" });
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <h1 className={styles.pageTitle}>Student Dashboard</h1>
        <button className={styles.btnPrimary} onClick={() => setShowForm(true)}>
          + New Time Log
        </button>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.headerIcon}>🗓</span>
          <h3 className={styles.headerTitle}>Recent Time Logs</h3>
        </div>

        {showForm && (
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.formRow}>
              <label>Course</label>
              <input
                type="text"
                className={styles.input}
                value={newLog.course}
                onChange={(e) =>
                  setNewLog({ ...newLog, course: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.formRow}>
              <label>Duration</label>
              <input
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
              <label>Status</label>
              <select
                className={styles.input}
                value={newLog.badge}
                onChange={(e) =>
                  setNewLog({ ...newLog, badge: e.target.value })
                }
              >
                <option>Pending Review</option>
                <option>Reviewed</option>
                <option>Graded (A-)</option>
                <option>Graded (A)</option>
              </select>
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
            <div className={styles.row} key={row.log_id}>
              <div className={styles.left}>
                <div className={styles.titleLine}>
                  <span className={styles.title}>{row.metadata.course}</span>
                  {row.metadata.badge && (
                    <span className={styles.badge}>{row.metadata.badge}</span>
                  )}
                  {typeof row.metadata.comments_count === "number" && (
                    <span className={styles.pill}>Comments</span>
                  )}
                </div>
                <div className={styles.metaLine}>
                  <span className={styles.metaDot}>⏱</span>
                  <span className={styles.meta}>{row.metadata.duration}</span>
                  <span className={styles.metaSep}>•</span>
                  <span className={styles.meta}>
                    {new Date(row.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Link to={row.metadata.link} className={styles.viewBtn}>
                View
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
