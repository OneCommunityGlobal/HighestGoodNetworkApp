import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import {
  FiFileText,
  FiSave,
  FiRefreshCw,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiMessageSquare,
  FiSend,
} from 'react-icons/fi';
import styles from './DocumentReviewPage.module.css';
import SinglePagePdfViewer from './SinglePagePdfViewer';

const API_END = process.env.REACT_APP_APIENDPOINT;

const DocumentReviewPage = () => {
  const { submissionId } = useParams();
  const history = useHistory();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grade, setGrade] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showGradedModal, setShowGradedModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [changesRequested, setChangesRequested] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [privateNotes, setPrivateNotes] = useState('');
  const [pageComments, setPageComments] = useState({});
  const [currentPageComment, setCurrentPageComment] = useState('');

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  useEffect(() => {
    if (submission) {
      setGrade(submission.grading?.marksGiven ? submission.grading.marksGiven.toString() : '');
      setPrivateNotes(submission.feedback?.privateNotes || '');

      const existingComments = {};
      if (submission.feedback?.pageComments && Array.isArray(submission.feedback.pageComments)) {
        submission.feedback.pageComments.forEach(comment => {
          if (!comment.isPrivate) {
            existingComments[comment.pageNumber] = comment.comment;
          }
        });
      }
      setPageComments(existingComments);

      const fileUrl = submission.submission?.uploadedFiles?.[0] || '';
      if (fileUrl) {
        setDocumentUrl(fileUrl);
        if (fileUrl.match(/\.pdf$/i)) setDocumentType('pdf');
        else if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) setDocumentType('image');
        else setDocumentType('link');
      }
    }
  }, [submission]);

  useEffect(() => {
    setCurrentPageComment(pageComments[currentPage + 1] || '');
  }, [currentPage, pageComments]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }
      const response = await axios.get(
        `${API_END}/educationportal/educator/review/${submissionId}`,
        { headers: { Authorization: token } },
      );
      if (response.data) setSubmission(response.data);
      else setError('No submission data received');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch submission');
      setLoading(false);
    }
  };

  const handlePageCommentChange = comment => {
    setCurrentPageComment(comment);
    setPageComments(prev => ({
      ...prev,
      [currentPage + 1]: comment,
    }));
  };

  const handleSaveProgress = async () => {
    if (!submission) return;
    try {
      setIsSaving(true);
      setSaveMessage('');
      const token = localStorage.getItem('token');

      if (!token) {
        setSaveMessage('Authentication token missing. Please login again.');
        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 5000);
        return;
      }

      const allComments = Object.entries(pageComments)
        .filter(([_, comment]) => comment && comment.trim())
        .map(([pageNum, comment]) => ({
          pageNumber: parseInt(pageNum, 10),
          comment: comment.trim(),
          isPrivate: false,
        }));

      const payload = {
        privateNotes: privateNotes.trim(),
        pageComments: allComments,
      };

      if (grade && grade.trim()) {
        const gradeNum = parseInt(grade, 10);
        if (!isNaN(gradeNum)) {
          payload.marksGiven = gradeNum;
        }
      }

      await axios.post(
        `${API_END}/educationportal/educator/review/${submissionId}/progress`,
        payload,
        { headers: { Authorization: token } },
      );
      setIsSaving(false);
      setSaveMessage('Progress saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      await fetchSubmission();
    } catch (err) {
      setIsSaving(false);
      setSaveMessage(err.response?.data?.message || 'Failed to save progress');
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  const handleMarkAsGraded = async () => {
    if (!grade || !grade.trim()) {
      setSaveMessage('Please enter a grade before marking as graded');
      setShowGradedModal(false);
      setTimeout(() => setSaveMessage(''), 5000);
      return;
    }
    const gradeNum = parseInt(grade, 10);
    const totalMarks = getTotalMarks();
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > totalMarks) {
      setSaveMessage(`Grade must be between 0 and ${totalMarks}`);
      setShowGradedModal(false);
      setTimeout(() => setSaveMessage(''), 5000);
      return;
    }
    try {
      setIsSubmitting(true);
      setSaveMessage('');
      const token = localStorage.getItem('token');

      if (!token) {
        setSaveMessage('Authentication token missing. Please login again.');
        setShowGradedModal(false);
        setIsSubmitting(false);
        setTimeout(() => setSaveMessage(''), 5000);
        return;
      }

      const allComments = Object.entries(pageComments)
        .filter(([_, comment]) => comment && comment.trim())
        .map(([pageNum, comment]) => `Page ${pageNum}: ${comment.trim()}`)
        .join('\n\n');

      const payload = {
        action: 'mark_as_graded',
        collaborativeFeedback: allComments || 'No feedback provided',
        marksGiven: gradeNum,
      };

      if (privateNotes && privateNotes.trim()) {
        payload.privateNotes = privateNotes.trim();
      }

      const response = await axios.post(
        `${API_END}/educationportal/educator/review/${submissionId}/submit`,
        payload,
        { headers: { Authorization: token } },
      );

      setShowGradedModal(false);
      setSaveMessage('Submission marked as graded successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      await fetchSubmission();
      setIsSubmitting(false);
    } catch (err) {
      if (err.response?.status === 401) {
        const errorMsg = err.response?.data?.message || 'Authentication failed';
        setSaveMessage(`Auth failed: ${errorMsg}. Please check your login.`);
      } else {
        setSaveMessage(err.response?.data?.message || 'Failed to mark as graded');
      }

      setTimeout(() => setSaveMessage(''), 5000);
      setShowGradedModal(false);
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!changesRequested.trim()) {
      setSaveMessage('Please enter the changes required');
      setShowChangesModal(false);
      setTimeout(() => setSaveMessage(''), 5000);
      return;
    }
    try {
      setIsSubmitting(true);
      setSaveMessage('');
      const token = localStorage.getItem('token');

      if (!token) {
        setSaveMessage('Authentication token missing. Please login again.');
        setShowChangesModal(false);
        setIsSubmitting(false);
        setTimeout(() => setSaveMessage(''), 5000);
        return;
      }

      const payload = {
        action: 'request_changes',
        collaborativeFeedback: changesRequested.trim(),
      };

      await axios.post(
        `${API_END}/educationportal/educator/review/${submissionId}/submit`,
        payload,
        { headers: { Authorization: token } },
      );
      setShowChangesModal(false);
      setSaveMessage('Changes requested successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      setChangesRequested('');
      await fetchSubmission();
      setIsSubmitting(false);
    } catch (err) {
      if (err.response?.status === 401) {
        const errorMsg = err.response?.data?.message || 'Authentication failed';
        setSaveMessage(`Auth failed: ${errorMsg}`);
      } else {
        setSaveMessage(err.response?.data?.message || 'Failed to request changes');
      }

      setTimeout(() => setSaveMessage(''), 5000);
      setShowChangesModal(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmitGrade = () => {
    history.goBack();
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = pageIndex => {
    setCurrentPage(pageIndex);
  };

  const renderPageNumbers = () => {
    const pageButtons = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        const hasComment = pageComments[i + 1] && pageComments[i + 1].trim();
        pageButtons.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={currentPage === i ? styles.pageButtonActive : styles.pageButton}
            title={hasComment ? `Page ${i + 1} - Has feedback` : `Page ${i + 1}`}
          >
            {i + 1}
            {hasComment && <span className={styles.commentDot}></span>}
          </button>,
        );
      }
    } else {
      const showEllipsisStart = currentPage > 3;
      const showEllipsisEnd = currentPage < totalPages - 4;

      const hasComment0 = pageComments[1] && pageComments[1].trim();
      pageButtons.push(
        <button
          key={0}
          onClick={() => goToPage(0)}
          className={currentPage === 0 ? styles.pageButtonActive : styles.pageButton}
          title={hasComment0 ? 'Page 1 - Has feedback' : 'Page 1'}
        >
          1{hasComment0 && <span className={styles.commentDot}></span>}
        </button>,
      );

      if (showEllipsisStart) {
        pageButtons.push(
          <span key="ellipsis-start" className={styles.ellipsis}>
            ...
          </span>,
        );
      }

      const startPage = showEllipsisStart ? Math.max(1, currentPage - 1) : 1;
      const endPage = showEllipsisEnd ? Math.min(totalPages - 2, currentPage + 1) : totalPages - 2;

      for (let i = startPage; i <= endPage; i++) {
        const hasComment = pageComments[i + 1] && pageComments[i + 1].trim();
        pageButtons.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={currentPage === i ? styles.pageButtonActive : styles.pageButton}
            title={hasComment ? `Page ${i + 1} - Has feedback` : `Page ${i + 1}`}
          >
            {i + 1}
            {hasComment && <span className={styles.commentDot}></span>}
          </button>,
        );
      }

      if (showEllipsisEnd) {
        pageButtons.push(
          <span key="ellipsis-end" className={styles.ellipsis}>
            ...
          </span>,
        );
      }

      const hasCommentLast = pageComments[totalPages] && pageComments[totalPages].trim();
      pageButtons.push(
        <button
          key={totalPages - 1}
          onClick={() => goToPage(totalPages - 1)}
          className={currentPage === totalPages - 1 ? styles.pageButtonActive : styles.pageButton}
          title={hasCommentLast ? `Page ${totalPages} - Has feedback` : `Page ${totalPages}`}
        >
          {totalPages}
          {hasCommentLast && <span className={styles.commentDot}></span>}
        </button>,
      );
    }

    return pageButtons;
  };

  const getPageCommentsCount = () => {
    return Object.values(pageComments).filter(comment => comment && comment.trim()).length;
  };

  const renderDocument = () => {
    if (!documentUrl) {
      return (
        <div className={styles.noDocument}>
          <FiFileText size={48} />
          <p>No document uploaded</p>
        </div>
      );
    }

    if (documentType === 'pdf' && documentUrl) {
      return (
        <SinglePagePdfViewer
          fileUrl={documentUrl}
          currentPage={currentPage}
          onDocumentLoad={setTotalPages}
          onPageChange={setCurrentPage}
        />
      );
    }

    if (documentType === 'image') {
      return <img src={documentUrl} alt="Student Submission" className={styles.imageView} />;
    }

    if (documentType === 'link') {
      return (
        <div className={styles.linkView}>
          <FiFileText size={48} />
          <p>Submitted Link:</p>
          <a href={documentUrl} target="_blank" rel="noopener noreferrer">
            {documentUrl}
          </a>
        </div>
      );
    }

    return (
      <div className={styles.noDocument}>
        <FiFileText size={48} />
        <p>Document format not supported</p>
        <a href={documentUrl} target="_blank" rel="noopener noreferrer">
          Download File
        </a>
      </div>
    );
  };

  const getTotalMarks = () => submission?.grading?.totalMarks || 100;
  const getWeightage = () => {
    const valA = submission?.assignment?.weightage;
    if (valA !== undefined && valA !== null) return valA;
    const valB = submission?.grading?.weightage;
    if (valB !== undefined && valB !== null) return valB;
    return 'N/A';
  };

  const getCourseName = () => submission?.assignment?.course || 'Course';
  const getStudentName = () => submission?.student?.name || 'Student';
  const getStudentGrade = () => submission?.grading?.grade || 'N/A';
  const getSectionCode = () => 'CS1001';
  const getAssignmentName = () => submission?.assignment?.name || 'Assignment';
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };
  const getSubmittedDate = () => {
    const dateStr =
      submission?.submission?.submittedAt ||
      submission?.submittedAt ||
      submission?.review?.startedAt;
    return formatDate(dateStr);
  };
  const isReviewed = submission?.status === 'graded' || submission?.reviewStatus === 'graded';
  const canEdit = !isReviewed;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading submission...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => history.goBack()} className={styles.backButton}>
          Go Back to Dashboard
        </button>
      </div>
    );
  }
  if (!submission) {
    return (
      <div className={styles.errorContainer}>
        <h3>Submission not found</h3>
        <p>The requested submission could not be found.</p>
        <button onClick={() => history.goBack()} className={styles.backButton}>
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.topHeader}>
        <div className={styles.studentSection}>
          <div className={styles.avatarCircle}>
            {getStudentName()
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className={styles.studentText}>
            <h2 className={styles.studentName}>{getStudentName()}</h2>
            <p className={styles.studentMeta}>
              Grade {getStudentGrade()} • Section/Class Code: {getSectionCode()}
            </p>
            <p className={styles.assignmentTitle}>Assignment Name: {getAssignmentName()}</p>
          </div>
        </div>
        {isReviewed ? (
          <button className={styles.submitGradeButton} onClick={handleSubmitGrade}>
            <FiSend size={20} />
            <span>Submit Grade</span>
          </button>
        ) : (
          <button className={styles.backButton} onClick={() => history.goBack()}>
            Back to Dashboard
          </button>
        )}
      </div>
      <div className={styles.contentGrid}>
        <div className={styles.leftColumn}>
          {documentType === 'pdf' && totalPages > 0 && (
            <div className={styles.documentNav}>
              <button
                className={styles.navButton}
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
              >
                <FiChevronLeft size={16} />
                Previous Page
              </button>
              <div className={styles.pageTitle}>
                <FiFileText size={18} />
                Page {currentPage + 1} of {totalPages}
              </div>
              <button
                className={styles.navButton}
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
              >
                Next Page
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
          <div className={styles.documentArea}>
            <div className={styles.documentPaper}>{renderDocument()}</div>
          </div>
          {documentType === 'pdf' && totalPages > 0 && (
            <div className={styles.paginationBar}>
              <div className={styles.pageButtons}>{renderPageNumbers()}</div>
              <p className={styles.paginationHint}>
                Click page numbers to jump • {getPageCommentsCount()} page
                {getPageCommentsCount() !== 1 ? 's' : ''} with feedback
              </p>
            </div>
          )}
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.scrollArea}>
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Assignment Details</h4>
              <p className={styles.sectionLabel}>Course/Assignment Selection</p>
              <p className={styles.sectionValue}>{getCourseName()}</p>
              <div className={styles.infoGrid} style={{ marginTop: '16px' }}>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}>Weightage:</p>
                  <p className={styles.infoValue}>
                    {getWeightage() !== 'N/A' ? `${getWeightage()}%` : 'N/A'}
                  </p>
                </div>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}>Submitted:</p>
                  <p className={styles.infoValue}>{getSubmittedDate()}</p>
                </div>
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}>Status:</p>
                  <span
                    className={`${styles.statusBadge} ${
                      submission.status === 'graded'
                        ? styles.reviewed
                        : submission.status === 'changes_requested'
                        ? styles.changesRequested
                        : styles.onTime
                    }`}
                  >
                    {submission.status === 'graded'
                      ? 'Graded'
                      : submission.status === 'changes_requested'
                      ? 'Changes Requested'
                      : 'On time'}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Marking</h4>
              <div className={styles.gradeInputs}>
                <div className={styles.inputGroup}>
                  <label htmlFor="totalMarks">Total Marks</label>
                  <input
                    id="totalMarks"
                    type="number"
                    value={getTotalMarks()}
                    disabled
                    className={styles.inputDisabled}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="gradeGiven">Marks Given</label>
                  <input
                    id="gradeGiven"
                    type="number"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    disabled={!canEdit}
                    className={styles.inputField}
                    placeholder="Enter marks..."
                    min="0"
                    max={getTotalMarks()}
                  />
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.feedbackHeader}>
                <h4 className={styles.sectionTitle}>Feedback for Page {currentPage + 1}</h4>
                {pageComments[currentPage + 1] && pageComments[currentPage + 1].trim() && (
                  <div className={styles.feedbackIndicator}>
                    <FiMessageSquare size={16} />
                    <span>Has Feedback</span>
                  </div>
                )}
              </div>
              <div className={styles.feedbackGroup}>
                <label htmlFor="pageComment">Page-Specific Feedback</label>
                <p className={styles.hint}>
                  Add feedback specific to page {currentPage + 1}. This will be saved with your
                  progress.
                </p>
                <textarea
                  id="pageComment"
                  value={currentPageComment}
                  onChange={e => handlePageCommentChange(e.target.value)}
                  placeholder={`Enter your feedback for page ${currentPage + 1}...`}
                  rows={6}
                  disabled={!canEdit}
                  className={styles.textarea}
                />
              </div>
            </div>
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Private Notes (Optional)</h4>
              <p className={styles.hint}>These notes are only visible to you</p>
              <textarea
                value={privateNotes}
                onChange={e => setPrivateNotes(e.target.value)}
                placeholder="Add any notes for your own reference here..."
                rows={4}
                disabled={!canEdit}
                className={styles.textarea}
              />
            </div>
            {saveMessage && (
              <div
                className={
                  saveMessage.includes('success') ? styles.successMessage : styles.errorMessage
                }
              >
                {saveMessage}
              </div>
            )}
            {isReviewed && (
              <div className={styles.reviewedBanner}>
                <FiCheckCircle size={20} />
                <span>This submission has been reviewed and is locked</span>
              </div>
            )}
          </div>
          <div className={styles.actionButtons}>
            <button
              className={styles.saveButton}
              onClick={handleSaveProgress}
              disabled={isSaving || !canEdit}
            >
              <FiSave size={20} />
              <span>{isSaving ? 'Saving...' : 'Save Progress'}</span>
            </button>
            <div className={styles.buttonRow}>
              <button
                className={styles.changesButton}
                onClick={() => setShowChangesModal(true)}
                disabled={!canEdit}
              >
                <FiRefreshCw size={20} />
                <span>Request Changes</span>
              </button>
              <button
                className={styles.gradedButton}
                onClick={() => setShowGradedModal(true)}
                disabled={!grade || !canEdit}
              >
                <FiCheckCircle size={20} />
                <span>Mark as Graded</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {showGradedModal && (
        <div
          className={styles.modalOverlay}
          onClick={e => e.target === e.currentTarget && !isSubmitting && setShowGradedModal(false)}
          onKeyDown={e => e.key === 'Escape' && !isSubmitting && setShowGradedModal(false)}
          role="presentation"
        >
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h3>Mark as Graded</h3>
            <p>
              Are you sure you want to mark this submission as graded? This will lock the submission
              and notify the student.
            </p>
            <div className={styles.modalInfo}>
              <p>
                <strong>Student:</strong> {getStudentName()}
              </p>
              <p>
                <strong>Assignment:</strong> {getAssignmentName()}
              </p>
              <p>
                <strong>Grade:</strong> {grade} / {getTotalMarks()}
              </p>
              <p>
                <strong>Page Feedbacks:</strong> {getPageCommentsCount()} page(s)
              </p>
            </div>
            <div className={styles.modalButtons}>
              <button onClick={() => setShowGradedModal(false)} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                onClick={handleMarkAsGraded}
                disabled={isSubmitting}
                className={styles.confirmBtn}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Grade'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showChangesModal && (
        <div
          className={styles.modalOverlay}
          onClick={e => e.target === e.currentTarget && !isSubmitting && setShowChangesModal(false)}
          onKeyDown={e => e.key === 'Escape' && !isSubmitting && setShowChangesModal(false)}
          role="presentation"
        >
          <div className={styles.modal} role="dialog" aria-modal="true">
            <h3>Request Changes</h3>
            <p>Please describe the changes required for this submission:</p>
            <textarea
              value={changesRequested}
              onChange={e => setChangesRequested(e.target.value)}
              placeholder="Describe the changes needed..."
              rows={5}
              className={styles.modalTextarea}
              disabled={isSubmitting}
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setShowChangesModal(false)} disabled={isSubmitting}>
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={isSubmitting || !changesRequested.trim()}
                className={styles.confirmBtn}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentReviewPage;
