import styles from './style/UserCard.module.css';
import avatar from './style/avatar.png';
import emailIcon from './style/email_icon.png';
import slackIcon from './style/slack_icon.png';

function UserCard({ user }) {
  const { name, email, slack, score, topSkills = [] } = user;

  const getScoreColor = userScore => {
    if (userScore >= 5) return '#00754A';
    return '#D93D3D';
  };

  return (
    <div className={`${styles.userCard}`}>
      <img src={avatar} alt="Avatar" className={`${styles.avatar}`} />
      <div className={`${styles.info}`}>
        <div className={`${styles.userName}`}>{name}</div>
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
        <div className={`${styles.scoreLine}`}>
          <span className={`${styles.scoreLabel}`}>Score:</span>
          <span className={`${styles.scoreValue}`} style={{ color: getScoreColor(score) }}>
            {score}
          </span>
          <span className={`${styles.scoreMax}`}> / 10</span>
        </div>

        <div className={`${styles.skillsSection}`}>
          <div className={`${styles.skillsLabel}`}>Top Skills:</div>
          <div className={`${styles.skillsText}`}>{topSkills.join(', ')}</div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
