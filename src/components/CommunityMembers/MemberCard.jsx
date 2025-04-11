import React from 'react';
import PropTypes from 'prop-types';
import './MemberCard.css';

/**
 * MemberCard component displays an individual user profile with their score and skills
 */
const MemberCard = ({
  name,
  email,
  slackId,
  score,
  skills,
  profileImage,
  isInUserTeam,
  github,
  location,
}) => {
  // Determine score color based on value (red if less than 3, green if 3 or more)
  const scoreColor = score < 3 ? '#FF4D4D' : '#4CAF50';

  const handleEmailClick = e => {
    e.preventDefault();
    window.location.href = `mailto:${email}`;
  };

  const handleSlackClick = e => {
    e.preventDefault();
    // This would ideally open Slack with the user's profile - for now just show an alert
    alert(`Redirect to Slack for user: ${slackId}`);
  };

  const handleGithubClick = e => {
    e.preventDefault();
    window.open(github, '_blank');
  };

  return (
    <div className={`member-card ${isInUserTeam ? 'member-card--team' : ''}`}>
      <div className="member-card__image-container">
        <img
          src={profileImage || '/default-avatar.png'}
          alt={`${name}'s profile`}
          className="member-card__image"
        />
      </div>

      <h3 className="member-card__name">{name}</h3>

      {location && (
        <div className="member-card__location">
          <i className="fa fa-map-marker"></i> {location}
        </div>
      )}

      <div className="member-card__contact">
        <div className="member-card__email" onClick={handleEmailClick} title="Click to send email">
          <i className="fa fa-envelope"></i> {email}
        </div>
        <div
          className="member-card__slack"
          onClick={handleSlackClick}
          title="Click to open in Slack"
        >
          <i className="fa fa-slack"></i> {slackId}
        </div>
        {github && (
          <div
            className="member-card__github"
            onClick={handleGithubClick}
            title="View GitHub profile"
          >
            <i className="fa fa-github"></i> GitHub
          </div>
        )}
      </div>

      <div className="member-card__score-container">
        <div className="member-card__score-label">Score:</div>
        <div className="member-card__score" style={{ color: scoreColor }}>
          {score} / 5
        </div>
      </div>

      <div className="member-card__skills-container">
        <div className="member-card__skills-label">Top Skills:</div>
        <div className="member-card__skills">{skills.join(', ')}</div>
      </div>
    </div>
  );
};

MemberCard.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  slackId: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  profileImage: PropTypes.string,
  isInUserTeam: PropTypes.bool,
  github: PropTypes.string,
  location: PropTypes.string,
};

MemberCard.defaultProps = {
  profileImage: null,
  isInUserTeam: false,
  github: null,
  location: null,
};

export default MemberCard;
