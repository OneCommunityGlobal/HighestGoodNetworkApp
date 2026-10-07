import styles from './style/UserCard.module.css';
import avatar from './style/avatar.png';
import emailIcon from './style/email_icon.png';
import slackIcon from './style/slack_icon.png';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatSkillName } from './FilerData.js';

function UserCard({ user }) {
  const { userId, name, email, slack, score, topSkills, displaySkills, skills } = user;
  const darkMode = useSelector(state => state.theme.darkMode);

  const normalizedSkills = Array.isArray(displaySkills)
    ? displaySkills
    : Array.isArray(topSkills)
    ? topSkills.map(formatSkillName)
    : Array.isArray(skills)
    ? skills
        .map(skill => {
          if (typeof skill === 'string') return skill;
          return skill.name || skill.skill || skill.label || skill.type || '';
        })
        .filter(Boolean)
        .map(formatSkillName)
    : [];

  return (
    <div className={`${styles.userCard} ${darkMode ? styles.darkMode : ''}`}>
      <img src={avatar} alt="Avatar" className={`${styles.avatar}`} />
      <div className={`${styles.info}`}>
        {userId ? (
          <Link
            to={`/hgnhelp/profile/${userId}`}
            className={`${styles.userName} ${styles.profileLink}`}
          >
            {name}
          </Link>
        ) : (
          <div className={`${styles.userName}`}>{name}</div>
        )}
        {email && (
          <div className={`${styles.contactLine}`}>
            <img src={emailIcon} alt="Email" className={`${styles.contactIcon}`} />
            <span>{email}</span>
          </div>
        )}
        {slack && (
          <div className={`${styles.contactLine}`}>
            <img src={slackIcon} alt="Slack" className={`${styles.contactIcon}`} />
            <span>{slack}</span>
          </div>
        )}
      </div>

      <div className={`${styles.scoreSkillsWrapper}`}>
        {typeof score === 'number' && (
          <div className={`${styles.scoreLine}`}>
            <span className={`${styles.scoreLabel}`}>Score:</span>
            <span
              className={`${styles.scoreValue} ${score >= 5 ? styles.scoreHigh : styles.scoreLow}`}
            >
              {score}
            </span>
            <span className={`${styles.scoreMax}`}> / 10</span>
          </div>
        )}

        <div className={`${styles.skillsSection}`}>
          <div className={`${styles.skillsLabel}`}>Top Skills:</div>
          <div className={`${styles.skillsText}`}>
            {normalizedSkills.length > 0 ? normalizedSkills.join(', ') : 'No skills listed'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
