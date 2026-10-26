// src/components/SupportPortal/SupportLogViewer.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './SupportLogViewer.module.css';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';

const formatEntryDate = timestamp => {
  if (typeof timestamp !== 'string' || !timestamp.trim()) return 'Date unavailable';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
};

export default function SupportLogViewer({ match }) {
  // Keep the log viewer in sync with the shared HGN theme preference.
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const { studentId } = match.params; // ← get :studentId from route props

  const [studentName, setStudentName] = useState('Student');
  const [dataStudentId, setDataStudentId] = useState(studentId);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ignore responses from a previous student or an unmounted viewer.
    let active = true;
    setDataStudentId(studentId);
    setStudentName('Student');
    setEntries([]);
    setError('');
    setIsLoading(true);

    const fetchProfile = async () => {
      try {
        const { data } = await httpService.get(ENDPOINTS.USER_PROFILE(studentId), {
          skipGlobalErrorToast: true,
        });
        const name = [data?.firstName, data?.lastName]
          .filter(part => typeof part === 'string' && part.trim())
          .join(' ')
          .trim();
        if (active) setStudentName(name || 'Student');
      } catch {
        // Profile details are optional and must not prevent logs from loading.
        if (active) setStudentName('Student');
      }
    };

    const fetchLog = async () => {
      try {
        const { data } = await httpService.get(
          `${ENDPOINTS.APIEndpoint()}/support/daily-log/${studentId}`,
        );
        if (active) setEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!active) return;
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Access denied. You are not authorized to view this log.');
        } else {
          setError('Unable to load daily log. Please try again later.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (studentId) {
      fetchProfile();
      fetchLog();
    }
    return () => {
      active = false;
    };
  }, [studentId]);

  // Hide the previous student's data even before the new effect resets state.
  const isCurrentStudent = dataStudentId === studentId;

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{isCurrentStudent ? studentName : 'Student'} — Daily Log</h1>
          <p className={styles.subtitle}>Review this student&apos;s timeline and support notes.</p>
        </div>

        <Link to="/support/dashboard" className={styles.backLink}>
          ← Back to students
        </Link>
      </header>

      {isLoading || !isCurrentStudent ? (
        <div className={styles.emptyState}>Loading daily log…</div>
      ) : error ? (
        <div className={styles.errorBanner}>{error}</div>
      ) : entries.length === 0 ? (
        <div className={styles.emptyState}>No log entries found for this student.</div>
      ) : (
        <div className={styles.timeline}>
          {entries.map(entry => (
            <div key={entry.log_id} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <span className={styles.entryDate}>{formatEntryDate(entry.created_at)}</span>
                </div>
                <p className={styles.entryText}>{entry.action_type}</p>
                {entry.metadata != null && (
                  <p className={styles.supportNotes}>
                    <strong>Details: </strong>
                    {typeof entry.metadata === 'string'
                      ? entry.metadata
                      : JSON.stringify(entry.metadata)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
