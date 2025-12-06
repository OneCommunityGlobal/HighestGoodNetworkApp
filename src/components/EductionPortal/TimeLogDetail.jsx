import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import styles from "./DailyLogPage.module.css";
import { FaRegCalendarAlt } from "react-icons/fa";

async function fetchTimeLogExtras(logId) {
  await new Promise((r) => setTimeout(r, 300));
  return {
    noteToTeacher: "",
    teacherFeedback:
      "Good progress on quadratic equations. Focus on translating word problems into equations and check fraction operations carefully.",
  };
}

async function saveNoteToTeacher(logId, note) {
  await new Promise((r) => setTimeout(r, 350));
  return { ok: true };
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function TimeLogDetail() {
  const { id } = useParams();
  const location = useLocation();
  const passedLog = location.state?.log;

  const [log, setLog] = useState(
    passedLog || {
      log_id: `lg-${id}`,
      created_at: new Date().toISOString(),
      metadata: { course: "Course", duration: "—", badge: "", notes: "" },
    }
  );

  const [noteValue, setNoteValue] = useState("");
  const [serverNote, setServerNote] = useState("");
  const [teacherFeedback, setTeacherFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError("");

      try {
        const { noteToTeacher, teacherFeedback } = await fetchTimeLogExtras(id);

        if (!cancelled) {
          setServerNote(noteToTeacher || "");
          setNoteValue(noteToTeacher || "");
          setTeacherFeedback(teacherFeedback || "");
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load extras:", e);
          setError("Failed to load notes or feedback.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const md = useMemo(() => log?.metadata || {}, [log]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const res = await saveNoteToTeacher(id, noteValue);
      if (!res.ok) {
        throw new Error("Save failed");
      }

      setServerNote(noteValue);
    } catch (e) {
      console.error("Error saving note:", e);
      setError("Saving failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setNoteValue(serverNote);

  if (!log) {
    return (
      <div className={styles.page}>
        <div className={styles.detailCard}>
          <h1 className={styles.pageTitle}>Time Log {id}</h1>
          <p className={styles.detailNote}>
            No data found for this entry. Please return to the Daily Log and open the item again.
          </p>
          <Link to="/educationportal/dailylog" className={styles.viewBtn}>
            Back to Daily Log
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.sectionTitle}>Time Log Details</h2>

      <div className={styles.entryCard}>
        <div className={styles.entryHeader}>
          <div className={styles.entryHeaderLeft}>
            <FaRegCalendarAlt className={styles.entryIcon} aria-hidden="true" />
            <div>
              <div className={styles.entryTitle}>Time Log Entry</div>
              <div className={styles.entrySubmeta}>
                Course: <strong>{md.course || "—"}</strong>
                <span className={styles.dot}>•</span>
                Submitted: {formatDate(log.created_at)}
              </div>
            </div>
          </div>

          <div className={styles.entryHeaderRight}>
            {md.duration && <span className={styles.pill}>{md.duration}</span>}
            {md.badge && (
              <span className={`${styles.pill} ${styles.grade}`}>{md.badge}</span>
            )}
          </div>
        </div>

        <div className={styles.entryBody}>
          <div className={styles.entryBodyLabel}>Log Entry</div>
          <div className={styles.entryBodyNote}>
            {md.notes || "No notes were provided for this time log."}
          </div>
        </div>
      </div>

      <div className={styles.blockCard}>
        <div className={styles.blockTitle}>Notes to Teacher</div>

        {loading ? (
          <div className={styles.detailNote}>Loading…</div>
        ) : (
          <>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              rows={5}
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder="Write a note to your teacher…"
            />

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>

            {error && (
              <div className={styles.detailNote} style={{ color: "#b91c1c" }}>
                {error}
              </div>
            )}
          </>
        )}
      </div>

      <div className={`${styles.blockCard} ${styles.feedbackCard}`}>
        <div className={styles.blockTitle}>Teacher Feedback</div>

        {loading ? (
          <div className={styles.detailNote}>Loading…</div>
        ) : (
          <div className={styles.feedbackBody}>
            {md.badge && (
              <div className={styles.feedbackBadgeRow}>
                <span className={`${styles.pill} ${styles.grade}`}>{md.badge}</span>
              </div>
            )}
            <p className={styles.feedbackText}>
              {teacherFeedback || "No feedback yet."}
            </p>
          </div>
        )}
      </div>

      <div className={styles.detailActions}>
        <Link to="/educationportal/dailylog" className={styles.viewBtn}>
          Back to Daily Log
        </Link>
      </div>
    </div>
  );
}
