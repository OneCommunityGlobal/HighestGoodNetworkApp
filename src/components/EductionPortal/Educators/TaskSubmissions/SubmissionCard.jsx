import React from 'react';
import styles from './SubmissionCard.module.css';
import { FiInfo } from 'react-icons/fi';

const getInitials = (name = '') => {
  const [firstName, lastName] = name.split(' ');
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`;
  }
  return firstName ? firstName[0] : '?';
};

const SubmissionCard = ({ submission }) => {
  const { studentName, studentAvatarUrl, status, submittedAt, dueAt } = submission;

  const isLate = submittedAt && dueAt && new Date(submittedAt) > new Date(dueAt);

  const submissionTimestamp = isLate
    ? `Submitted ${new Date(submittedAt).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
      })} ${new Date(submittedAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}`
    : '';

  const cardStyles = [
    styles.card,
    isLate ? styles.lateBorder : '',
    status === 'Graded' ? styles.gradedBorder : '',
  ].join(' ');

  return (
    <div className={cardStyles}>
      <div className={styles.studentInfoWrapper}>
        <div className={styles.studentInfo}>
          {studentAvatarUrl ? (
            <img src={studentAvatarUrl} alt={studentName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{getInitials(studentName)}</div>
          )}
          <span className={styles.studentName}>{studentName}</span>
        </div>
        {isLate && <p className={styles.submissionTimestamp}>{submissionTimestamp}</p>}
      </div>

      <div className={styles.statusInfo}>
        {status === 'Graded' && (
          <div className={`${styles.badge} ${styles.graded}`}>
            <svg
              width="12"
              height="9"
              viewBox="0 0 12 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M4.24264 8.48528L0 4.24264L1.41421 2.82843L4.24264 5.65685L10.5858 0L12 1.41421L4.24264 8.48528Z" />
            </svg>
            Graded
          </div>
        )}
        {isLate && (
          <div className={`${styles.badge} ${styles.late}`}>
            Late submission
            <FiInfo className={styles.infoIcon} />
          </div>
        )}
        {status === 'Pending Review' && !isLate && (
          <FiInfo className={styles.infoIconPending} title="Submission is pending review" />
        )}
      </div>
    </div>
  );
};

export default SubmissionCard;
