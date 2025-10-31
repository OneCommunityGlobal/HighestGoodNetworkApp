import React, { useEffect, useState } from 'react';
import styles from './BrowseLessonPlan.module.css';
import LessonPlanCard from './LessonPlanCard';

const API_BASE = process.env.REACT_APP_API_BASE || '/api/education';
const API_LIST = `${API_BASE}/lesson-plans`;
const API_SAVE = `${API_BASE}/student/saved-interests`;
const API_GET_SAVED = `${API_BASE}/student/saved-interests`;

export default function BrowseLessonPlan() {
  const [plans, setPlans] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const studentId = localStorage.getItem('studentId') || null; 
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({ page: 1, size: 200 }).toString();
        const res = await fetch(`${API_LIST}?${q}`, {
          headers: {
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error('List fetch failed');
        const json = await res.json();
        const items = (json && json.data) || [];
        const normalized = items.map((p) => ({
          id: p._id || p.id,
          title: p.title,
          subjects: p.subjects || [],
          subject: (p.subjects && p.subjects[0]) || p.subject || 'General',
          description: p.description || '',
          difficulty: p.difficulty || '',
          thumbnail: (p.metadata && p.metadata.thumbnail) || p.thumbnail || '',
          raw: p,
        }));
        setPlans(normalized);
        setFiltered(normalized);
      } catch (err) {
        console.error(err);
        setError('Unable to load lesson plans');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (studentId) {
      (async () => {
        try {
          const res = await fetch(`${API_GET_SAVED}?studentId=${encodeURIComponent(studentId)}`, {
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) return;
          const json = await res.json();
          const saved = (json && json.data) || [];
          const ids = new Set(saved.map((s) => s._id || s.id));
          setSavedIds(ids);
        } catch (e) {
        }
      })();
    }
  }, [studentId]);

  useEffect(() => {
    let out = plans;
    if (subject !== 'all') {
      out = out.filter((p) => p.subject === subject || (p.subjects && p.subjects.includes(subject)));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.subject || '').toLowerCase().includes(q),
      );
    }
    setFiltered(out);
  }, [plans, search, subject]);

  async function handleSave(planId) {
    if (!studentId) {
      alert('Please sign in to save lesson plans.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_SAVE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ studentId, lessonPlanId: planId }),
      });
      if (!res.ok) throw new Error('Save failed');
      const json = await res.json();
      const ids = new Set(savedIds);
      ids.add(planId);
      setSavedIds(ids);
      alert('Saved to My Interests');
    } catch (err) {
      console.error(err);
      alert('Unable to save');
    }
  }

  const subjects = Array.from(new Set(['all', ...plans.flatMap((p) => p.subjects || [p.subject]).filter(Boolean)]));

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lesson Plan Library</h2>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Search lesson plans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={styles.select} value={subject} onChange={(e) => setSubject(e.target.value)}>
          {subjects.map((s) => (
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
          filtered.map((plan) => (
            <LessonPlanCard
              key={plan.id}
              plan={plan}
              onSave={() => handleSave(plan.id)}
              isSaved={savedIds.has(plan.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}