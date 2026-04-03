import React, { useState, useMemo } from 'react';
import { FiInfo, FiCheck } from 'react-icons/fi';
import styles from './SubmissionCard.module.css';

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0] ? parts[0].substring(0, 2).toUpperCase() : '?';
};

const getAvatarColor = name => {
  const colors = [
    { bg: '#8B5CF6', shadow: 'rgba(139, 92, 246, 0.3)' },
    { bg: '#3B82F6', shadow: 'rgba(59, 130, 246, 0.3)' },
    { bg: '#EC4899', shadow: 'rgba(236, 72, 153, 0.3)' },
    { bg: '#10B981', shadow: 'rgba(16, 185, 129, 0.3)' },
    { bg: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.3)' },
    { bg: '#EF4444', shadow: 'rgba(239, 68, 68, 0.3)' },
  ];
  const index = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[index];
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

const SubmissionCard = ({ submission }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { studentName, taskType, status, submittedAt, dueAt, grade } = submission;

  const statusDetails = useMemo(() => {
    const isLate = submittedAt && dueAt && new Date(submittedAt) > new Date(dueAt);

    if (status === 'Graded') {
      return {
        showBadge: true,
        badgeText: 'Graded',
        badgeClass: styles.gradedBadge,
        cardClass: styles.gradedCard,
        icon: <FiCheck size={14} strokeWidth={3} />,
      };
    }

    if (isLate) {
      return {
        showLateSection: true,
        cardClass: styles.lateCard,
        showInfoIcon: true,
        tooltipContent: (
          <>
            <span className={styles.tooltipTitle}>Late Submission</span>
            <span className={styles.tooltipText}>
              Submitted{' '}
              {new Date(submittedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(submittedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </>
        ),
      };
    }

    if (status === 'Pending Review') {
      return {
        showInfoIcon: true,
        tooltipContent: <span className={styles.tooltipText}>Pending Review</span>,
      };
    }

    return {};
  }, [status, submittedAt, dueAt]);

  const avatarColor = getAvatarColor(studentName);

  return (
    <div className={`${styles.card} ${statusDetails.cardClass || ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.studentInfo}>
          <div
            className={styles.avatar}
            style={{
              backgroundColor: avatarColor.bg,
              boxShadow: `0 4px 12px ${avatarColor.shadow}`,
            }}
          >
            {getInitials(studentName)}
          </div>
          <div className={styles.studentDetails}>
            <span className={styles.studentName} title={studentName}>
              {studentName}
            </span>
            <span className={styles.taskType}>{getTaskTypeLabel(taskType)}</span>
          </div>
        </div>

        <div className={styles.statusArea}>
          {statusDetails.showBadge && (
            <div className={statusDetails.badgeClass}>
              {statusDetails.icon}
              {statusDetails.badgeText}
            </div>
          )}

          {statusDetails.showInfoIcon && (
            <div
              className={styles.infoIconWrapper}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className={styles.infoIcon}>
                <FiInfo size={20} />
              </div>

              {showTooltip && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipContent}>{statusDetails.tooltipContent}</div>
                  <div className={styles.tooltipArrow} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.spacer} />

      {status === 'Graded' && grade && grade !== 'pending' && (
        <div className={styles.gradeSection}>
          <span className={styles.gradeLabel}>Grade</span>
          <span className={styles.gradeValue}>{grade}</span>
        </div>
      )}

      {statusDetails.showLateSection && (
        <div className={styles.lateSection}>
          <span className={styles.lateLabel}>LATE SUBMISSION</span>
          <span className={styles.lateDate}>
            Submitted{' '}
            {new Date(submittedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            •{' '}
            {new Date(submittedAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default SubmissionCard;
