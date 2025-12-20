import React, { useState } from 'react';
import styles from './styles/StarRating.module.css';

function StarRating({ onRate }) {
  const [rating, setRating] = useState(0);

  const handleStarClick = index => {
    setRating(index + 1); // Set the selected rating
    onRate(index + 1); // Pass the rating value back to the parent
  };

  const handleStarKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStarClick(index);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i += 1) {
      stars.push(
        <span
          key={i}
          className={`${styles.star} ${i < rating ? styles.selected : ''}`}
          onClick={() => handleStarClick(i)}
          onKeyDown={e => handleStarKeyDown(e, i)}
          role="button"
          tabIndex={0}
          aria-label={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
        >
          ★
        </span>,
      );
    }
    return stars;
  };

  return <div className={styles['star-container']}>{renderStars()}</div>;
}

export default StarRating;
