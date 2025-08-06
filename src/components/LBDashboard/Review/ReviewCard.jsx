import React from 'react';
import styles from './reviewForm.module.css';

function ReviewCard({ userName, userImage, reviewDescription, stars, date }) {
  const renderStars = () => {
    const totalStars = 5;
    return (
      <div>
        {Array.from({ length: totalStars }, (_, i) => (
          <span key={i} className={`${styles.star} ${i < stars ? styles.active : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles['review-card']}>
      {/* Left div: user image */}
      <div className={styles['left-div']}>
        <img src={userImage} alt="User" />
      </div>

      {/* Right div: user info */}
      <div className={styles['right-div']}>
        <div className={styles['user-name']}>
          <span className={styles['name-review']}>
            {userName} {renderStars()}
          </span>
        </div>
        <div className={styles['review-description']}>
          <span className={styles['multiline-ellipsis']}>{reviewDescription}</span>
        </div>
        <div className={styles['review-time']}>{date}</div>
      </div>
    </div>
  );
}

export default ReviewCard;
