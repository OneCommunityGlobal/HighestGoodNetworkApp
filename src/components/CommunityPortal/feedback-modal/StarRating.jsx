import React, { useState } from 'react';
import './styles/StarRating.css'; // Import the updated CSS

function StarRating({ onRate }) {
  const [rating, setRating] = useState(0);

  const handleStarClick = index => {
    setRating(index + 1); // Set the selected rating
    onRate(index + 1); // Pass the rating value back to the parent
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i += 1) {
      stars.push(
        <span
          key={i}
          className={`star ${i < rating ? 'selected' : ''}`}
          onClick={() => handleStarClick(i)}
        >
          ★
        </span>,
      );
    }
    return stars;
  };

  return <div className="star-container">{renderStars()}</div>;
}

export default StarRating;
