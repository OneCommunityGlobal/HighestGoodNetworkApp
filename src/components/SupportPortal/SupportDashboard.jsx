// src/components/SupportPortal/SupportDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './SupportDashboard.module.css';
import axios from 'axios';

export default function SupportDashboard() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('supportAuthToken');

        const res = await axios.get('/api/support/students', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const raw = res.data;

        // Make sure we always end up with an array
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.students) ? raw.students : [];

        console.log('Support students:', list);
        setStudents(list);
        setFilteredStudents(list);
      } catch (err) {
        console.error('Error fetching support students:', err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Access denied. You are not authorized to view this dashboard.');
        } else {
          setError('Unable to load students. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setFilteredStudents(students);
      return;
    }
    setFilteredStudents((students || []).filter(s => (s.name || '').toLowerCase().includes(query)));
  }, [search, students]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Support Dashboard</h1>
        <input
          type="text"
          className={styles.searchBar}
          placeholder="Search students…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </header>

      {error && <div className={styles.emptyState}>{error}</div>}

      {isLoading ? (
        <div className={styles.emptyState}>Loading students…</div>
      ) : filteredStudents.length === 0 ? (
        <div className={styles.emptyState}>No students found for your assignment.</div>
      ) : (
        <ul className={styles.list}>
          {filteredStudents.map(s => (
            <li key={s.id} className={styles.listItem}>
              <Link to={`/support/log/${s.id}`} className={styles.studentName}>
                {s.name}
              </Link>
              {s.team && <div className={styles.studentInfo}>Team: {s.team}</div>}
              {s.status && <div className={styles.studentInfo}>Status: {s.status}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
