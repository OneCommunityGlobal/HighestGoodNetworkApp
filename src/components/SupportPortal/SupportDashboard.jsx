// src/components/SupportPortal/SupportDashboard.jsx
import React, { useEffect, useState } from 'react';
import styles from './SupportDashboard.module.css';
import { Link } from 'react-router-dom';

export default function SupportDashboard() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetch('/api/students?assignedTo=supportUserId')
      .then(res => res.json())
      .then(data => setStudents(data));
  }, []);

  return (
    <div className={styles.container}>
      <h1>Support Dashboard</h1>
      <ul>
        {students.map(s => (
          <li key={s.id}>
            <Link to={`/support/log/${s.id}`}>{s.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
