import { Mail } from 'lucide-react';
import PropTypes from 'prop-types';
import { SlackIcon } from './SlackIcon';
import styles from './TeamCard.module.css';

export const TeamMemberRow = ({ member }) => {
  const getScoreStyle = score => {
    const scoreNum = parseInt(score);
    const scoreColor = scoreNum >= 5 ? styles.scoreGreen : styles.scoreRed;
    return `${styles.scoreBase} ${scoreColor}`;
  };

  const hasEmail = member.email && member.email.trim() !== '';
  const hasSlack = member.slackId && member.slackId.trim() !== '';

  return (
    <div className={styles.teamMemberRow}>
      <div className={styles.teamMemberInfo}>
        <span className={styles.teamMemberName}>{member.name}</span>
        <div className={styles.teamMemberIcons}>
          {hasEmail ? (
            <a
              href={`mailto:${member.email}`}
              title={`Email ${member.name}`}
              aria-label={`Email ${member.name}`}
              className={styles.iconLink}
            >
              <Mail size={16} className={styles.icon} />
            </a>
          ) : (
            <span
              title="No email available"
              aria-label="No email available"
              className={styles.iconDisabled}
            >
              <Mail size={16} className={styles.icon} />
            </span>
          )}

          {hasSlack ? (
            <a
              href={`https://slack.com/app_redirect?channel=${member.slackId}`}
              target="_blank"
              rel="noopener noreferrer"
              title={`Message ${member.name} on Slack`}
              aria-label={`Message ${member.name} on Slack`}
              className={styles.iconLink}
            >
              <SlackIcon size={16} />
            </a>
          ) : (
            <span
              title="No Slack ID available"
              aria-label="No Slack ID available"
              className={styles.iconDisabled}
            >
              <SlackIcon size={16} />
            </span>
          )}
        </div>
      </div>
      <span className={getScoreStyle(member.score.split('/')[0])}>{member.score}</span>
    </div>
  );
};

TeamMemberRow.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    score: PropTypes.string.isRequired,
    email: PropTypes.string,
    slackId: PropTypes.string,
  }).isRequired,
};
