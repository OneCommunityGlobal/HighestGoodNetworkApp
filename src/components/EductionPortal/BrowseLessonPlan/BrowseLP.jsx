import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './BrowseLP.module.css';
import {
  fetchLessonPlans,
  saveLessonPlan,
  fetchSavedLessonPlans,
  removeLessonPlan,
} from '~/actions/educationPortal/browseLPActions';

export default function BrowseLessonPlan() {
  const dispatch = useDispatch();
  const { plans, loading, error, saved } = useSelector(state => state.browseLessonPlan);
  const darkMode = useSelector(state => state.theme.darkMode);
  const userId = useSelector(state => state.auth.user?.userid || state.auth.userId);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [expandedSections, setExpandedSections] = useState(new Set());

  useEffect(() => {
    dispatch(fetchLessonPlans());
    if (userId) {
      dispatch(fetchSavedLessonPlans(userId));
    }
  }, [dispatch, userId]);

  const savedIds = useMemo(
    () => new Set(Array.isArray(saved) ? saved.map(s => s._id || s.id) : []),
    [saved],
  );

  // Filter plans based on search and subject filter
  const filterPlans = planList => {
    let filtered = planList;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.tags || []).some(tag => tag.toLowerCase().includes(q)),
      );
    }

    if (subjectFilter !== 'All Subjects') {
      filtered = filtered.filter(p => p.subjects && p.subjects.includes(subjectFilter));
    }

    return filtered;
  };

  const filteredPlans = useMemo(() => filterPlans(plans), [plans, search, subjectFilter]);

  const subjects = useMemo(
    () =>
      Array.from(
        new Set(['All Subjects', ...plans.flatMap(p => p.subjects || []).filter(Boolean)]),
      ),
    [plans],
  );

  const groupedSaved = useMemo(() => {
    const groups = {};
    (saved || []).forEach(plan => {
      const subject = plan.subjects?.[0] || 'General';
      if (!groups[subject]) {
        groups[subject] = [];
      }
      groups[subject].push(plan);
    });
    return groups;
  }, [saved]);

  const groupedAllPlans = useMemo(() => {
    const groups = {};
    filteredPlans.forEach(plan => {
      const subject = plan.subjects?.[0] || 'General';
      if (!groups[subject]) {
        groups[subject] = [];
      }
      groups[subject].push(plan);
    });
    return groups;
  }, [filteredPlans]);

  const toggleSection = section => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  function handleToggleSave(plan) {
    if (!userId) {
      return;
    }
    const planId = plan._id || plan.id;
    const isSaved = savedIds.has(planId);

    if (isSaved) {
      dispatch(removeLessonPlan(userId, planId));
    } else {
      dispatch(saveLessonPlan(userId, planId));
    }
  }

  function handleViewDetails(plan) {
    // Navigate to lesson plan detail page
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      <h1 className={styles.mainTitle}>My Saved Interests</h1>

      {/* Search and Filters */}
      <div className={styles.controlsRow}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search across all saved atoms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
        >
          {subjects.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option>All Types</option>
        </select>
      </div>

      {loading && <div className={styles.loadingMsg}>Loading...</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* Display all subjects with saved items at top */}
      <div className={styles.sectionsContainer}>
        {Object.entries(groupedAllPlans).map(([subject, allItems]) => {
          const savedInSubject = (groupedSaved[subject] || []).filter(plan =>
            allItems.some(p => (p._id || p.id) === (plan._id || plan.id)),
          );
          const availableInSubject = allItems.filter(p => !savedIds.has(p._id || p.id));
          const totalCount = allItems.length;
          const sectionKey = subject;

          return (
            <div key={sectionKey} className={styles.section}>
              <div
                className={styles.sectionHeader}
                onClick={() => toggleSection(sectionKey)}
                onKeyDown={e => handleKeyDown(e, sectionKey)}
                role="button"
                tabIndex={0}
                aria-expanded={expandedSections.has(sectionKey)}
                aria-label={`Toggle ${subject} section`}
              >
                <h2 className={styles.sectionTitle}>
                  {subject}
                  <span className={styles.chevron}>
                    {expandedSections.has(sectionKey) ? '▼' : '►'}
                  </span>
                </h2>
                <span className={styles.atomCount}>{totalCount} atoms</span>
              </div>

              {expandedSections.has(sectionKey) && (
                <>
                  {/* Top 3 Priority (if any saved) */}
                  {savedInSubject.length > 0 && (
                    <div className={styles.priorityBox}>
                      <h3 className={styles.priorityTitle}>My Top 3 for {subject} (Next Focus)</h3>
                      {savedInSubject.slice(0, 3).map(plan => (
                        <div key={plan._id || plan.id} className={styles.priorityCard}>
                          <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>{plan.title}</h4>
                            <div className={styles.cardActions}>
                              <button className={styles.iconBtn} title="Star">
                                ⭐
                              </button>
                              <button
                                className={styles.iconBtn}
                                title="View"
                                onClick={() => handleViewDetails(plan)}
                              >
                                👁️
                              </button>
                              <button
                                className={styles.iconBtn}
                                title="Remove"
                                onClick={() => handleToggleSave(plan)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <div className={styles.cardTags}>
                            {plan.subjects?.map(subj => (
                              <span key={subj} className={styles.subjectTag}>
                                {subj}
                              </span>
                            ))}
                            <span
                              className={`${styles.difficultyBadge} ${
                                styles[plan.difficulty || 'beginner']
                              }`}
                            >
                              {plan.difficulty || 'beginner'}
                            </span>
                          </div>
                          <p className={styles.cardDescription}>
                            {plan.description
                              ? plan.description.length > 120
                                ? `${plan.description.slice(0, 120)}...`
                                : plan.description
                              : 'No description available.'}
                          </p>
                          <div className={styles.cardFooter}>
                            <span className={styles.addedDate}>
                              Added: {new Date(plan.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                            <button className={styles.priorityBtn}>★ Priority</button>
                          </div>
                        </div>
                      ))}
                      {savedInSubject.length > 3 && (
                        <div className={styles.pinMoreBox}>
                          Pin up to 2 more atoms to your priority list
                        </div>
                      )}
                    </div>
                  )}

                  {/* All Items in Subject (Saved + Available) */}
                  <div className={styles.allAtomsSection}>
                    <h3 className={styles.allAtomsTitle}>All {subject} Atoms</h3>
                    <div className={styles.atomsList}>
                      {/* Saved items first */}
                      {savedInSubject.map(plan => (
                        <div
                          key={plan._id || plan.id}
                          className={`${styles.atomCard} ${styles.savedCard}`}
                        >
                          <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>{plan.title}</h4>
                            <div className={styles.cardActions}>
                              <button className={styles.iconBtn} title="Star">
                                ⭐
                              </button>
                              <button
                                className={styles.iconBtn}
                                title="View"
                                onClick={() => handleViewDetails(plan)}
                              >
                                👁️
                              </button>
                              <button
                                className={styles.iconBtn}
                                title="Remove"
                                onClick={() => handleToggleSave(plan)}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <div className={styles.cardTags}>
                            {plan.subjects?.map(subj => (
                              <span key={subj} className={styles.subjectTag}>
                                {subj}
                              </span>
                            ))}
                            <span
                              className={`${styles.difficultyBadge} ${
                                styles[plan.difficulty || 'beginner']
                              }`}
                            >
                              {plan.difficulty || 'beginner'}
                            </span>
                          </div>
                          <p className={styles.cardDescription}>
                            {plan.description
                              ? plan.description.length > 100
                                ? `${plan.description.slice(0, 100)}...`
                                : plan.description
                              : 'No description.'}
                          </p>
                          <div className={styles.cardFooter}>
                            <span className={styles.addedDate}>
                              Added: {new Date(plan.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Available items */}
                      {availableInSubject.map(plan => (
                        <div key={plan._id || plan.id} className={styles.atomCard}>
                          <div className={styles.cardHeader}>
                            <h4 className={styles.cardTitle}>{plan.title}</h4>
                            <div className={styles.cardActions}>
                              <button
                                className={`${styles.iconBtn} ${styles.saveBtn}`}
                                title="Save"
                                onClick={() => handleToggleSave(plan)}
                              >
                                ☆
                              </button>
                              <button
                                className={styles.iconBtn}
                                title="View"
                                onClick={() => handleViewDetails(plan)}
                              >
                                👁️
                              </button>
                            </div>
                          </div>
                          <div className={styles.cardTags}>
                            {plan.subjects?.map(subj => (
                              <span key={subj} className={styles.subjectTag}>
                                {subj}
                              </span>
                            ))}
                            <span
                              className={`${styles.difficultyBadge} ${
                                styles[plan.difficulty || 'beginner']
                              }`}
                            >
                              {plan.difficulty || 'beginner'}
                            </span>
                          </div>
                          <p className={styles.cardDescription}>
                            {plan.description
                              ? plan.description.length > 100
                                ? `${plan.description.slice(0, 100)}...`
                                : plan.description
                              : 'No description.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {filteredPlans.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>No lesson plans found.</p>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
