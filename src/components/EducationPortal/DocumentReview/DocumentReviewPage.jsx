import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './DocumentReviewPage.module.css';

const DocumentReviewPage = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:4500/api/educationportal/educator/review/${submissionId}`,
        {
          headers: {
            Authorization: `${token}`,
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
    const fileUrl = submission.submission.uploadedFiles[0];

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

  return (
    <div className={styles.documentReviewContainer}>
      <div className={styles.reviewHeader}>
        <h2>Review Submission</h2>
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
            <p>Feedback section coming in Session 2...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentReviewPage;
