import React from 'react';
import './UserCard.css';
import avatar from './avatar.png';
import emailIcon from './email_icon.png';
import slackIcon from './slack_logo.png';

function UserCard({ user }) {
  const { name, email, slack, score, topSkills } = user;

  const getScoreColor = (score) => {
    return score >= 5 ? '#00754A' : '#D93D3D';
  };

  return (
    <div className="user-card">
      <img src={avatar} alt="Avatar" className="avatar"/>
      <div className="info">
        <div className="user-name">{name}</div>
        <div className="contact-line">
          <img src={emailIcon} alt="Email" className="contact-icon"/>
          <span>{email}</span>
        </div>
        <div className="contact-line">
          <img src={slackIcon} alt="Slack" className="contact-icon"/>
          <span>{slack}</span>
        </div>
      </div>

      <div className="score-skills-wrapper">
        <div className="score-line">
          <span className="score-label">Score:</span>
          <span className="score-value" style={{color: getScoreColor(score)}}>
            {score}
          </span>
          <span className="score-max"> / 10</span>
        </div>

        <div className="skills-section">
          <div className="skills-label">Top Skills:</div>
          <div className="skills-text">{topSkills.join(', ')}</div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
