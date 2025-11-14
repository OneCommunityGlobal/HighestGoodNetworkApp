// src/components/SupportPortal/SupportLogViewer.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './SupportLogViewer.module.css';
import axios from 'axios';

export default function SupportLogViewer() {
  const { studentId } = useParams();
  const [studentName, setStudentName] = useState('');
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      setIsLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('supportAuthToken');

        // TODO: adjust these endpoints to the real API
        const [studentRes, logRes] = await Promise.all([
          axios.get(`/api/support/students/${studentId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
          axios.get(`/api/support/students/${studentId}/daily-log`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }),
        ]);

        setStudentName(studentRes.data?.name || 'Student');
        setEntries(logRes.data || []);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Access denied. You are not authorized to view this log.');
        } else {
          setError('Unable to load daily log. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchLog();
    }
  }, [studentId]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{studentName} — Daily Log</h1>
          <p className={styles.subtitle}>Review this student&apos;s timeline and support notes.</p>
        </div>

        <Link to="/support/dashboard" className={styles.backLink}>
          ← Back to students
        </Link>
      </header>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {isLoading ? (
        <div className={styles.emptyState}>Loading daily log…</div>
      ) : entries.length === 0 ? (
        <div className={styles.emptyState}>No log entries found for this student.</div>
      ) : (
        <div className={styles.timeline}>
          {entries.map(entry => (
            <div key={entry.id} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <span className={styles.entryDate}>{entry.date}</span>
                  {entry.mood && <span className={styles.badge}>Mood: {entry.mood}</span>}
                </div>
                <p className={styles.entryText}>{entry.text}</p>
                {entry.supportNotes && (
                  <p className={styles.supportNotes}>
                    <strong>Support notes: </strong>
                    {entry.supportNotes}
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
