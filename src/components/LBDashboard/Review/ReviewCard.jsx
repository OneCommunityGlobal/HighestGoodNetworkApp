import React from "react";
import "./reviewForm.css";

function ReviewCard({ userName, userImage, reviewDescription, stars, date }) {
  
  const renderStars = () => {
    const totalStars = 5;
    return (
      <div>
        {Array.from({ length: totalStars }, (_, i) => (
          <span
            key={i}
            className={`star ${i < stars ? "active" : ""}`}
            style={{ fontSize: "0.8rem", marginRight: "2px" }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="review-card">
      {/* Left div: user image */}
      <div className="left-div">
        <img src={userImage} alt="User" />
      </div>

      {/* Right div: user info */}
      <div className="right-div">
        <div className="user-name">
          <span className="name-review">
            {userName} {renderStars()}
            </span>
        </div>
        <div className="review-description">
          <span className="multiline-ellipsis">
            {reviewDescription}
          </span>
        </div>
        <div className="review-time">{date}</div>
      </div>
    </div>
  );
}

export default ReviewCard;