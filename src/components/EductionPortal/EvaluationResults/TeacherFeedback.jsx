import React from 'react';
import { Card, CardBody, CardHeader, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faStar, faComments } from '@fortawesome/free-solid-svg-icons';
import styles from './TeacherFeedback.module.css';

const TeacherFeedback = ({ feedback, isLoading }) => {
  if (isLoading) {
    return (
      <Card className={styles.feedbackCard}>
        <CardBody>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading teacher feedback...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!feedback) {
    return (
      <Card className={styles.feedbackCard}>
        <CardBody>
          <div className={styles.noFeedbackContainer}>
            <FontAwesomeIcon icon={faComments} className={styles.noFeedbackIcon} />
            <p className={styles.noFeedbackText}>No teacher feedback available yet.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getRatingStars = rating => {
    const stars = [];
    const fullStars = Math.floor(rating / 20); // Convert 100-point scale to 5-star
    const hasHalfStar = rating % 20 >= 10;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className={styles.starFilled} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className={styles.starHalf} />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} className={styles.starEmpty} />);
      }
    }
    return stars;
  };

  return (
    <Card className={styles.feedbackCard}>
      <CardHeader className={styles.feedbackHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <FontAwesomeIcon icon={faUser} className={styles.teacherIcon} />
            <div className={styles.teacherInfo}>
              <h4 className={styles.teacherName}>{feedback.teacherName}</h4>
              <p className={styles.teacherTitle}>{feedback.teacherTitle}</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.ratingContainer}>
              <div className={styles.stars}>
                {getRatingStars(feedback.overallRating === 'Excellent' ? 95 : 85)}
              </div>
              <Badge
                color={feedback.overallRating === 'Excellent' ? 'success' : 'primary'}
                className={styles.ratingBadge}
              >
                {feedback.overallRating}
              </Badge>
            </div>
            <div className={styles.dateContainer}>
              <FontAwesomeIcon icon={faCalendar} className={styles.dateIcon} />
              <span className={styles.lastUpdated}>
                {new Date(feedback.lastUpdated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className={styles.feedbackBody}>
        {/* Overall Feedback */}
        <div className={styles.feedbackSection}>
          <h5 className={styles.sectionTitle}>Overall Assessment</h5>
          <div className={styles.overallFeedback}>
            <p className={styles.feedbackText}>{feedback.overall}</p>
          </div>
        </div>

        {/* Strengths */}
        <div className={styles.feedbackSection}>
          <h5 className={styles.sectionTitle}>
            <span className={styles.strengthsTitle}>Strengths</span>
            <Badge color="success" className={styles.countBadge}>
              {feedback.strengths?.length || 0}
            </Badge>
          </h5>
          <div className={styles.strengthsList}>
            {feedback.strengths?.map((strength, index) => (
              <div key={index} className={styles.strengthItem}>
                <div className={styles.strengthBullet} />
                <span className={styles.strengthText}>{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className={styles.feedbackSection}>
          <h5 className={styles.sectionTitle}>
            <span className={styles.recommendationsTitle}>Areas for Improvement</span>
            <Badge color="warning" className={styles.countBadge}>
              {feedback.recommendations?.length || 0}
            </Badge>
          </h5>
          <div className={styles.recommendationsList}>
            {feedback.recommendations?.map((recommendation, index) => (
              <div key={index} className={styles.recommendationItem}>
                <div className={styles.recommendationBullet} />
                <span className={styles.recommendationText}>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className={styles.feedbackSection}>
          <h5 className={styles.sectionTitle}>
            <span className={styles.nextStepsTitle}>Suggested Next Steps</span>
            <Badge color="info" className={styles.countBadge}>
              {feedback.nextSteps?.length || 0}
            </Badge>
          </h5>
          <div className={styles.nextStepsList}>
            {feedback.nextSteps?.map((step, index) => (
              <div key={index} className={styles.nextStepItem}>
                <div className={styles.nextStepNumber}>{index + 1}</div>
                <span className={styles.nextStepText}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TeacherFeedback;
