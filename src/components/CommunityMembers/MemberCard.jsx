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

  // Determine score color based on value (red if less than 5, green if 5 or above)
  const getScoreColor = score => {
    if (score < 5) return darkMode ? '#FF6B6B' : '#FF4D4D'; // Red for scores below 5
    return darkMode ? '#4CAF50' : '#4CAF50'; // Green for scores 5 and above
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
    // This would ideally open Slack with the user's profile - for now just log
    // Redirect to Slack for user: ${slackId}
  };

  const handleGithubClick = e => {
    e.preventDefault();
    e.stopPropagation();
    window.open(github, '_blank');
  };

  // Text color for the "/ 10" part - should be black in light mode, light gray in dark mode
  const defaultTextColor = darkMode ? '#e0e0e0' : '#000000';

  return (
    <div className={`member-card ${darkMode ? 'dark-mode' : ''}`}>
      <div className="member-card__image-container">
        <img
          src={profileImage || '/avatar.png'}
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
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleEmailClick(e);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Email ${name}`}
        >
          <i className="fa fa-envelope"></i> {isContactPublic ? email : 'Private'}
          {!isContactPublic && <span className="custom-tooltip">No ID found</span>}
        </div>
        <div
          className={`member-card__slack ${!isContactPublic ? 'private-contact' : ''}`}
          onClick={handleSlackClick}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSlackClick(e);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={`Slack ${name}`}
        >
          <i className="fa fa-slack"></i> {isContactPublic ? slackId : 'Private'}
          {!isContactPublic && <span className="custom-tooltip">No ID found</span>}
        </div>
        {github && (
          <div
            className="member-card__github"
            onClick={handleGithubClick}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGithubClick(e);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`View ${name}'s GitHub profile`}
            title="View GitHub profile"
          >
            <i className="fa fa-github"></i> GitHub
          </div>
        )}
      </div>

      <div className="member-card__score-container">
        <div className="member-card__score-label">Skill Rating:</div>
        <div className="member-card__score">
          <span style={{ color: scoreColor }}>{formattedScore}</span>
          {!isNotApplicable && <span style={{ color: defaultTextColor }}> / 10</span>}
        </div>
      </div>

      <div className="member-card__skills-container">
        <div className="member-card__skills-label">Top Skills:</div>
        <div className="member-card__skills">
          {skills.length > 0 ? skills.join(', ') : 'No skills rated above 7'}
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
