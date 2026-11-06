// src/components/SupportPortal/SupportDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './SupportDashboard.module.css';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';

export default function SupportDashboard() {
  // Keep the dashboard in sync with the shared HGN theme preference.
  const darkMode = useSelector(state => state.theme?.darkMode || false);
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
        const res = await httpService.get(`${ENDPOINTS.APIEndpoint()}/support/students`);

        const raw = res.data;

        // Make sure we always end up with an array
        const list = Array.isArray(raw) ? raw : [];

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

  const renderContent = () => {
    if (isLoading) {
      return <div className={styles.emptyState}>Loading students…</div>;
    }
    if (error) {
      return <div className={styles.emptyState}>{error}</div>;
    }
    if (filteredStudents.length === 0) {
      return <div className={styles.emptyState}>No students found for your assignment.</div>;
    }
    return (
      <ul className={styles.list}>
        {filteredStudents.map(s => (
          <li key={s.id} className={styles.listItem}>
            <Link to={`/support/log/${s.id}`} className={styles.studentName}>
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
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

      {renderContent()}
    </div>
  );
}
