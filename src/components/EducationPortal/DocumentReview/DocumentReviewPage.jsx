import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './DocumentReviewPage.module.css';

const DocumentReviewPage = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collaborativeFeedback, setCollaborativeFeedback] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [marksGiven, setMarksGiven] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  useEffect(() => {
    if (submission) {
      setCollaborativeFeedback(submission.feedback.collaborative || '');
      setPrivateNotes(submission.feedback.privateNotes || '');
      setMarksGiven(submission.grading.marksGiven || '');
      setIsInitialLoad(false);
    }
  }, [submission]);

  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    if (isInitialLoad) {
      return;
    }

    const timer = setTimeout(() => {
      if (submission && (collaborativeFeedback || privateNotes || marksGiven)) {
        handleAutoSave();
      }
    }, 2000);

    autoSaveTimerRef.current = timer;

    return () => clearTimeout(timer);
  }, [collaborativeFeedback, privateNotes, marksGiven, isInitialLoad]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4500/api/educationportal/educator/review/${submissionId}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setSubmission(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch submission');
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:4500/api/educationportal/educator/review/${submissionId}/progress`,
        {
          collaborativeFeedback,
          privateNotes,
          marksGiven: marksGiven ? parseInt(marksGiven, 10) : undefined,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setSaveMessage('Auto-saved');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (err) {
      logService.logError(err);
    }
  };

  const handleSaveProgress = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:4500/api/educationportal/educator/review/${submissionId}/progress`,
        {
          collaborativeFeedback,
          privateNotes,
          marksGiven: marksGiven ? parseInt(marksGiven, 10) : undefined,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setSaveMessage('Progress saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      setIsSaving(false);
    } catch (err) {
      setSaveMessage('Failed to save progress');
      setTimeout(() => setSaveMessage(''), 3000);
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.reviewLoading}>
        <div className={styles.spinner}></div>
        <p>Loading submission...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.reviewError}>
        <h3>Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className={styles.reviewError}>
        <h3>Submission not found</h3>
      </div>
    );
  }

  const getStatusClass = status => {
    const statusMap = {
      submitted: styles.submitted,
      in_review: styles.inReview,
      graded: styles.graded,
      changes_requested: styles.changesRequested,
    };
    return `${styles.statusBadge} ${statusMap[status] || ''}`;
  };

  const renderFileViewer = () => {
    const fileUrl = submission.submission.uploadedFiles?.[0];

    if (!fileUrl) {
      return <div className={styles.noFile}>No file uploaded</div>;
    }

    if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      return <img src={fileUrl} alt="Submission" className={styles.imageViewer} />;
    }

    if (fileUrl.match(/\.pdf$/i) || fileUrl.includes('pdf')) {
      return <iframe src={fileUrl} title="PDF Viewer" className={styles.pdfViewer} />;
    }

    return (
      <div className={styles.linkViewer}>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          View Submission
        </a>
      </div>
    );
  };

  const calculateGradePercentage = () => {
    if (!marksGiven || !submission.grading.totalMarks) return null;
    return ((parseInt(marksGiven, 10) / submission.grading.totalMarks) * 100).toFixed(1);
  };

  const gradePercentage = calculateGradePercentage();

  return (
    <div className={styles.documentReviewContainer}>
      <div className={styles.reviewHeader}>
        <h2>Review Submission</h2>
        {saveMessage && <div className={styles.saveNotification}>{saveMessage}</div>}
      </div>

      <div className={styles.reviewContent}>
        <div className={styles.leftPane}>
          <div className={styles.studentInfoCard}>
            <h3>Student Information</h3>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{submission.student.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{submission.student.email}</span>
            </div>
          </div>

          <div className={styles.assignmentInfoCard}>
            <h3>Assignment Details</h3>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{submission.assignment.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>{submission.assignment.type}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Course:</span>
              <span className={styles.value}>{submission.assignment.course}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Due Date:</span>
              <span className={styles.value}>
                {new Date(submission.submission.dueAt).toLocaleDateString()}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status:</span>
              <span className={getStatusClass(submission.status)}>{submission.status}</span>
            </div>
          </div>

          <div className={styles.documentViewerCard}>
            <h3>Submitted Work</h3>
            <div className={styles.viewerContainer}>{renderFileViewer()}</div>
          </div>
        </div>

        <div className={styles.rightPane}>
          <div className={styles.feedbackPanel}>
            <h3>Review & Feedback</h3>

            {gradePercentage && (
              <div className={styles.gradeDisplay}>
                <div className={styles.gradeCircle}>
                  <span className={styles.gradePercentage}>{gradePercentage}%</span>
                  <span className={styles.gradeText}>
                    {marksGiven} / {submission.grading.totalMarks}
                  </span>
                </div>
              </div>
            )}

            <div className={styles.feedbackSection}>
              <label htmlFor="collabFeedback" className={styles.feedbackLabel}>
                Collaborative Feedback
                <span className={styles.labelHint}>(Visible to student)</span>
              </label>
              <textarea
                id="collabFeedback"
                className={styles.feedbackTextarea}
                value={collaborativeFeedback}
                onChange={e => setCollaborativeFeedback(e.target.value)}
                placeholder="Enter feedback that will be shared with the student..."
                rows={6}
              />
            </div>

            <div className={styles.feedbackSection}>
              <label htmlFor="privateNotes" className={styles.feedbackLabel}>
                Private Notes
                <span className={styles.labelHint}>(Only visible to educators)</span>
              </label>
              <textarea
                id="privateNotes"
                className={styles.feedbackTextarea}
                value={privateNotes}
                onChange={e => setPrivateNotes(e.target.value)}
                placeholder="Enter private notes for internal use..."
                rows={4}
              />
            </div>

            <div className={styles.feedbackSection}>
              <label htmlFor="marksGiven" className={styles.feedbackLabel}>
                Marks Given
                <span className={styles.labelHint}>(Out of {submission.grading.totalMarks})</span>
              </label>
              <input
                id="marksGiven"
                type="number"
                className={styles.marksInput}
                value={marksGiven}
                onChange={e => setMarksGiven(e.target.value)}
                placeholder="Enter marks..."
                min="0"
                max={submission.grading.totalMarks}
              />
            </div>

            <button className={styles.saveButton} onClick={handleSaveProgress} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentReviewPage;
