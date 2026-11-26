import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import styles from './DraftApproval.module.css';
import {
  getLessonPlanDrafts,
  updateLessonPlanDraft,
} from '../../../../services/lessonPlanDraftService';

const parseLines = value =>
  value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

const DraftApproval = () => {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDraftId, setExpandedDraftId] = useState(null);
  const [editState, setEditState] = useState({});
  const [savingDraftId, setSavingDraftId] = useState(null);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLessonPlanDrafts();
      setDrafts(data);
    } catch (err) {
      setError('Failed to load pending lesson plan drafts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const startEditing = draft => {
    setExpandedDraftId(draft._id);
    setEditState({
      goals: draft.goals.join('\n'),
      topics: draft.topics.join('\n'),
      suggestedTasks: draft.suggestedTasks.join('\n'),
      assessmentFormTitle: '',
      assessmentFormDescription: '',
      assessmentForms: draft.assessmentForms || [],
    });
  };

  const handleAddAssessmentForm = () => {
    if (!editState.assessmentFormTitle.trim()) return;
    setEditState(prev => ({
      ...prev,
      assessmentForms: [
        ...prev.assessmentForms,
        {
          title: prev.assessmentFormTitle.trim(),
          description: prev.assessmentFormDescription.trim(),
        },
      ],
      assessmentFormTitle: '',
      assessmentFormDescription: '',
    }));
  };

  const handleApprove = async draftId => {
    setSavingDraftId(draftId);
    setError(null);
    try {
      await updateLessonPlanDraft(draftId, {
        goals: parseLines(editState.goals),
        topics: parseLines(editState.topics),
        suggestedTasks: parseLines(editState.suggestedTasks),
        assessmentForms: editState.assessmentForms,
      });
      setExpandedDraftId(null);
      await fetchDrafts();
    } catch (err) {
      setError('Failed to approve this draft. Please try again.');
    } finally {
      setSavingDraftId(null);
    }
  };

  return (
    <div className={`${styles.pageLayout} ${darkMode ? styles.pageLayoutDark : ''}`}>
      <div className={`${styles.content} ${darkMode ? styles.contentDark : ''}`}>
        <h2 className={styles.title}>Pending Lesson Plan Drafts</h2>

        {error && <p className={styles.errorText}>{error}</p>}

        {loading && <p>Loading drafts...</p>}

        {!loading && drafts.length === 0 && !error && (
          <p className={styles.emptyText}>No pending drafts to review.</p>
        )}

        <ul className={styles.draftList}>
          {drafts.map(draft => (
            <li key={draft._id} className={styles.draftCard}>
              <div className={styles.draftSummary}>
                <span>{draft.topics.join(', ') || 'Untitled draft'}</span>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => startEditing(draft)}
                >
                  {expandedDraftId === draft._id ? 'Editing...' : 'Review'}
                </button>
              </div>

              {expandedDraftId === draft._id && (
                <div className={styles.editPanel}>
                  <label htmlFor={`goals-${draft._id}`}>Goals</label>
                  <textarea
                    id={`goals-${draft._id}`}
                    className={styles.textarea}
                    rows={3}
                    value={editState.goals}
                    onChange={e => setEditState(prev => ({ ...prev, goals: e.target.value }))}
                  />

                  <label htmlFor={`topics-${draft._id}`}>Topics</label>
                  <textarea
                    id={`topics-${draft._id}`}
                    className={styles.textarea}
                    rows={3}
                    value={editState.topics}
                    onChange={e => setEditState(prev => ({ ...prev, topics: e.target.value }))}
                  />

                  <label htmlFor={`tasks-${draft._id}`}>Suggested Tasks</label>
                  <textarea
                    id={`tasks-${draft._id}`}
                    className={styles.textarea}
                    rows={3}
                    value={editState.suggestedTasks}
                    onChange={e =>
                      setEditState(prev => ({ ...prev, suggestedTasks: e.target.value }))
                    }
                  />

                  <h4>Assessment Forms</h4>
                  <ul>
                    {editState.assessmentForms.map(form => (
                      <li key={form.title}>{form.title}</li>
                    ))}
                  </ul>
                  <div className={styles.assessmentFormRow}>
                    <input
                      type="text"
                      placeholder="Form title"
                      value={editState.assessmentFormTitle}
                      onChange={e =>
                        setEditState(prev => ({ ...prev, assessmentFormTitle: e.target.value }))
                      }
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={editState.assessmentFormDescription}
                      onChange={e =>
                        setEditState(prev => ({
                          ...prev,
                          assessmentFormDescription: e.target.value,
                        }))
                      }
                    />
                    <button type="button" onClick={handleAddAssessmentForm}>
                      Add
                    </button>
                  </div>

                  <div className={styles.actionRow}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => setExpandedDraftId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => handleApprove(draft._id)}
                      disabled={savingDraftId === draft._id}
                    >
                      {savingDraftId === draft._id ? 'Approving...' : 'Approve & Finalize'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DraftApproval;
