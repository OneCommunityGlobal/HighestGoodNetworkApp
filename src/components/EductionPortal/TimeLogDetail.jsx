import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import styles from './DailyLogPage.module.css';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { useDailyLog } from './DailyLogContext';

const formatDate = iso =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function TimeLogDetail() {
  const { id } = useParams();
  const location = useLocation();
  const passedLog = location.state?.log;
  const { logs, updateLogNote } = useDailyLog();

  const logFromContext = useMemo(
    () => logs.find(row => row.entity_id === `time-log-${id}` || row.log_id === `lg-${id}`),
    [logs, id],
  );

  const log = logFromContext || passedLog;

  const [noteValue, setNoteValue] = useState('');
  const [serverNote, setServerNote] = useState('');
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (log) {
      const note = log.metadata?.noteToTeacher || '';
      setServerNote(note);
      setNoteValue(note);
      setTeacherFeedback(log.metadata?.teacherFeedback || '');
      setLoading(false);
    }
  }, [log]);

  const md = useMemo(() => log?.metadata || {}, [log]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSaved(false);

      await new Promise(r => setTimeout(r, 300));

      updateLogNote(id, noteValue);
      setServerNote(noteValue);
      setSaved(true);

      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Error saving note:', e);
      setError('Saving failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNoteValue(serverNote);
    setSaved(false);
  };

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
                Course: <strong>{md.course || '—'}</strong>
                <span className={styles.dot}>•</span>
                Submitted: {formatDate(log.created_at)}
              </div>
            </div>
          </div>

          <div className={styles.entryHeaderRight}>
            {md.duration && <span className={styles.pill}>{md.duration}</span>}
            {md.badge && <span className={`${styles.pill} ${styles.grade}`}>{md.badge}</span>}
          </div>
        </div>

        <div className={styles.entryBody}>
          <div className={styles.entryBodyLabel}>Log Entry</div>
          <div className={styles.entryBodyNote}>
            {md.notes || 'No notes were provided for this time log.'}
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
              onChange={e => {
                setNoteValue(e.target.value);
                setSaved(false);
              }}
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
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>

            {saved && (
              <div className={styles.detailNote} style={{ color: '#15803d' }}>
                Note saved successfully.
              </div>
            )}

            {error && (
              <div className={styles.detailNote} style={{ color: '#b91c1c' }}>
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
            <p className={styles.feedbackText}>{teacherFeedback || 'No feedback yet.'}</p>
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
