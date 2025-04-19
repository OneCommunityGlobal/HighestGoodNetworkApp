import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
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
  github,
  location,
  isNotApplicable,
  darkMode: darkModeProp,
  userId,
  isContactPublic = true,
}) => {
  // Use the passed darkMode prop if provided, otherwise use Redux state
  const darkModeFromRedux = useSelector(state => state.theme.darkMode);
  const darkMode = darkModeProp !== undefined ? darkModeProp : darkModeFromRedux;

  // Determine score color based on value (red if less than 3, yellow if 3, green if more than 3)
  const getScoreColor = score => {
    if (score < 3) return darkMode ? '#FF6B6B' : '#FF4D4D'; // Lighter red for dark mode
    if (score === 3 || (score > 2.9 && score < 3.1)) return darkMode ? '#FFC107' : '#FFC107'; // Yellow/amber for both modes
    return darkMode ? '#4CAF50' : '#4CAF50'; // Same green for both modes (already visible in dark mode)
  };

  const scoreColor = isNotApplicable ? (darkMode ? '#c0c0c0' : '#666666') : getScoreColor(score);

  // Format score to show decimal if needed or "N/A" if not applicable
  const formattedScore = isNotApplicable
    ? 'N/A'
    : Number.isInteger(score)
    ? score
    : score.toFixed(1);

  const handleEmailClick = e => {
    if (!isContactPublic) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  const handleSlackClick = e => {
    if (!isContactPublic) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    // This would ideally open Slack with the user's profile - for now just show an alert
    alert(`Redirect to Slack for user: ${slackId}`);
  };

  const handleGithubClick = e => {
    e.preventDefault();
    e.stopPropagation();
    window.open(github, '_blank');
  };

  return (
    <div className={`member-card ${darkMode ? 'dark-mode' : ''}`}>
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
        <div
          className={`member-card__email ${!isContactPublic ? 'private-contact' : ''}`}
          onClick={handleEmailClick}
        >
          <i className="fa fa-envelope"></i> {isContactPublic ? email : 'Private'}
          {!isContactPublic && <span className="custom-tooltip">No ID found</span>}
        </div>
        <div
          className={`member-card__slack ${!isContactPublic ? 'private-contact' : ''}`}
          onClick={handleSlackClick}
        >
          <i className="fa fa-slack"></i> {isContactPublic ? slackId : 'Private'}
          {!isContactPublic && <span className="custom-tooltip">No ID found</span>}
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
        <div className="member-card__score-label">Skill Rating:</div>
        <div className="member-card__score" style={{ color: scoreColor }}>
          {formattedScore}
          {!isNotApplicable ? ' / 5' : ''}
        </div>
      </div>

      <div className="member-card__skills-container">
        <div className="member-card__skills-label">Top Skills:</div>
        <div className="member-card__skills">
          {skills.length > 0 ? skills.join(', ') : 'No skills rated above 3'}
        </div>
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
  github: PropTypes.string,
  location: PropTypes.string,
  isNotApplicable: PropTypes.bool,
  darkMode: PropTypes.bool,
  userId: PropTypes.string,
  isContactPublic: PropTypes.bool,
};

MemberCard.defaultProps = {
  profileImage: null,
  github: null,
  location: null,
  isNotApplicable: false,
  darkMode: undefined,
  userId: null,
  isContactPublic: true,
};

export default MemberCard;
