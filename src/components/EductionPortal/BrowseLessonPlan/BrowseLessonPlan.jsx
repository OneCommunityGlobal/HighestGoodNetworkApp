import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './BrowseLessonPlan.module.css';
import LessonPlanCard from './LessonPlanCard';
import {
  fetchLessonPlans,
  saveLessonPlan,
  fetchSavedLessonPlans,
} from '~/actions/educationPortal/browseLessonPlanActions';

export default function BrowseLessonPlan() {
  const dispatch = useDispatch();
  const { plans, loading, error, saved, saving } = useSelector(
    state => state.browseLessonPlanReducer,
  );
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const studentId = localStorage.getItem('studentId') || null;

  useEffect(() => {
    dispatch(fetchLessonPlans());
    if (studentId) {
      dispatch(fetchSavedLessonPlans(studentId));
    }
  }, [dispatch, studentId]);

  const savedIds = useMemo(
    () => new Set(Array.isArray(saved) ? saved.map(s => s._id || s.id) : []),
    [saved],
  );

  const filtered = useMemo(() => {
    let out = plans;
    if (subject !== 'all') {
      out = out.filter(
        p => p.subject === subject || (Array.isArray(p.subjects) && p.subjects.includes(subject)),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(
        p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.subject || '').toLowerCase().includes(q),
      );
    }
    return out;
  }, [plans, search, subject]);

  const subjects = useMemo(
    () =>
      Array.from(
        new Set(['all', ...plans.flatMap(p => p.subjects || [p.subject]).filter(Boolean)]),
      ),
    [plans],
  );

  function handleSave(planId) {
    if (!studentId) {
      alert('Please sign in to save lesson plans.');
      return;
    }
    dispatch(saveLessonPlan(studentId, planId));
  }

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
            <LessonPlanCard
              key={plan.id || plan._id}
              plan={plan}
              onSave={() => handleSave(plan.id || plan._id)}
              isSaved={savedIds.has(plan.id || plan._id)}
              saving={saving}
            />
          ))
        )}
      </div>
    </div>
  );
}
