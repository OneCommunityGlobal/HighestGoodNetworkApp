import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import styles from './SubmissionReviewPage.module.css';

const formatDateTime = value => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getTaskTypeLabel = type => {
  const labels = {
    read: 'Read Task',
    write: 'Write Task',
    quiz: 'Quiz Task',
    practice: 'Practice Task',
    project: 'Project Task',
  };
  return labels[type] || 'Task';
};

const SubmissionReviewPage = () => {
  const { submissionId } = useParams();
  const history = useHistory();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  const fetchSubmission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${process.env.REACT_APP_APIENDPOINT}/educator/review/${submissionId}`,
      );
      const data = res.data;
      setTask(data);
      setMarks(data.marks ?? '');
      setMaxMarks(data.maxMarks ?? 100);
      setFeedback(data.feedback ?? '');
    } catch (err) {
      setError('Failed to load this submission. Please try again.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  const handleSave = async action => {
    setSaveError(null);
    setSaveMessage(null);

    if (marks !== '' && maxMarks === '') {
      setSaveError('Enter "Out of" marks before saving a grade.');
      return;
    }

    try {
      setSaving(true);

      const payload = { feedback, action };
      if (marks !== '') payload.marks = Number(marks);
      if (maxMarks !== '') payload.maxMarks = Number(maxMarks);

      const res = await axios.post(
        `${process.env.REACT_APP_APIENDPOINT}/educator/review/${submissionId}`,
        payload,
      );
      setTask(res.data);
      setSaveMessage(action === 'publish' ? 'Grade published to student.' : 'Draft saved.');
    } catch (err) {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || 'Submission not found.'}</p>
          <button type="button" className={styles.retryButton} onClick={fetchSubmission}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const studentName = task.studentId
    ? `${task.studentId.firstName || ''} ${task.studentId.lastName || ''}`.trim()
    : 'Unknown Student';
  const studentEmail = task.studentId?.email;
  const lessonPlanTitle = task.lessonPlanId?.title;
  const lessonPlanTheme = task.lessonPlanId?.theme;
  const uploadUrls = task.uploadUrls || [];
  const atoms = task.atomIds || [];

  const gradedByName = task.educatorId
    ? `${task.educatorId.firstName || ''} ${task.educatorId.lastName || ''}`.trim() ||
      task.educatorId.email
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => history.push('/educationportal/educator/task-submissions')}
        >
          <FiArrowLeft size={16} />
          Back to Submissions
        </button>

        <div className={styles.reviewCard}>
          <div className={styles.reviewHeader}>
            <div>
              <h1 className={styles.taskName}>{task.name}</h1>
              <p className={styles.taskMeta}>
                {getTaskTypeLabel(task.type)}
                {lessonPlanTitle ? ` • ${lessonPlanTitle}` : ''}
                {lessonPlanTheme ? ` (${lessonPlanTheme})` : ''}
              </p>
            </div>
            <span className={styles.statusBadge}>{task.submissionStatus || task.status}</span>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Student</span>
              <span className={styles.infoValue}>{studentName}</span>
              {studentEmail && <span className={styles.infoSubValue}>{studentEmail}</span>}
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Assigned</span>
              <span className={styles.infoValue}>{formatDateTime(task.assignedAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Due</span>
              <span className={styles.infoValue}>{formatDateTime(task.dueAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Submitted</span>
              <span className={styles.infoValue}>{formatDateTime(task.completedAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Current Grade</span>
              <span className={styles.infoValue}>{task.grade || 'pending'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Graded By</span>
              <span className={styles.infoValue}>{gradedByName || '—'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Saved</span>
              <span className={styles.infoValue}>{formatDateTime(task.gradeUpdatedAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Published</span>
              <span className={styles.infoValue}>{formatDateTime(task.gradePostedAt)}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Submission Content</h2>
            {uploadUrls.length === 0 ? (
              <p className={styles.emptyText}>No files or links were submitted.</p>
            ) : (
              <ul className={styles.linkList}>
                {uploadUrls.map(url => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkItem}
                    >
                      <FiExternalLink size={14} />
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Knowledge Atoms</h2>
            {atoms.length === 0 ? (
              <p className={styles.emptyText}>No knowledge atoms linked to this task.</p>
            ) : (
              <div className={styles.atomList}>
                {atoms.map(atom => (
                  <div key={atom._id} className={styles.atomCard}>
                    <div className={styles.atomHeader}>
                      <span className={styles.atomName}>{atom.name}</span>
                      {atom.difficulty && (
                        <span className={styles.atomDifficulty}>{atom.difficulty}</span>
                      )}
                    </div>
                    {atom.description && (
                      <p className={styles.atomDescription}>{atom.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Grade Submission</h2>

            <div className={styles.marksRow}>
              <label className={styles.fieldLabel} htmlFor="review-marks">
                Marks
                <input
                  id="review-marks"
                  type="number"
                  min="0"
                  className={styles.numberInput}
                  value={marks}
                  onChange={e => setMarks(e.target.value)}
                  placeholder="0"
                />
              </label>
              <label className={styles.fieldLabel} htmlFor="review-max-marks">
                Out of
                <input
                  id="review-max-marks"
                  type="number"
                  min="0"
                  className={styles.numberInput}
                  value={maxMarks}
                  onChange={e => setMaxMarks(e.target.value)}
                  placeholder="100"
                />
              </label>
            </div>

            <label className={styles.fieldLabel} htmlFor="review-feedback">
              Feedback
              <textarea
                id="review-feedback"
                className={styles.feedbackInput}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Add feedback for the student..."
                rows={5}
              />
            </label>

            {saveError && <p className={styles.saveError}>{saveError}</p>}
            {saveMessage && <p className={styles.saveMessage}>{saveMessage}</p>}

            <div className={styles.actionsRow}>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={saving}
                onClick={() => handleSave('update')}
              >
                Save Draft
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={saving}
                onClick={() => handleSave('publish')}
              >
                Publish Grade
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReviewPage;
