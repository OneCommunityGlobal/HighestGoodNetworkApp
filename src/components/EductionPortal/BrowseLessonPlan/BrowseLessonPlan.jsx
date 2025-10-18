import React, { useEffect, useState } from 'react';
import styles from './BrowseLessonPlan.module.css';
import LessonPlanCard from './LessonPlanCard';

const API_LIST = '/lesson-plans';
const API_SAVE = '/student/saved-interests';

export default function BrowseLessonPlan() {
  const [plans, setPlans] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(API_LIST)
      .then(res => res.json())
      .then(data => {
        setPlans(data || []);
        setFiltered(data || []);
      })
      .catch(err => setError('Unable to load lesson plans'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let out = plans;
    if (subject !== 'all') {
      out = out.filter(p => p.subject === subject);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q),
      );
    }
    setFiltered(out);
  }, [plans, search, subject]);

  function handleSave(planId) {
    fetch(API_SAVE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonPlanId: planId }),
    })
      .then(r => {
        if (!r.ok) throw new Error('Save failed');
        return r.json();
      })
      .then(() => alert('Saved to My Interests'))
      .catch(() => alert('Unable to save'));
  }

  const subjects = Array.from(new Set(['all', ...plans.map(p => p.subject).filter(Boolean)]));

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lesson Plan Library</h2>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Search lesson plans..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={styles.select}
          value={subject}
          onChange={e => setSubject(e.target.value)}
        >
          {subjects.map(s => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Subjects' : s}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className={styles.message}>Loading...</div>}
      {error && <div className={styles.messageError}>{error}</div>}

      <div className={styles.grid}>
        {filtered.length === 0 && !loading ? (
          <div className={styles.empty}>No lesson plans found.</div>
        ) : (
          filtered.map(plan => (
            <LessonPlanCard key={plan.id} plan={plan} onSave={() => handleSave(plan.id)} />
          ))
        )}
      </div>
    </div>
  );
}
