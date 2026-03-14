import { Mail } from 'lucide-react';
import PropTypes from 'prop-types';
import { SlackIcon } from './SlackIcon';
import styles from './TeamCard.module.css';

export const TeamMemberRow = ({ member, isSelected, onToggleSelect }) => {
  const getScoreStyle = score => {
    const scoreNum = parseInt(score, 10);
    const scoreColor = scoreNum >= 5 ? styles.scoreGreen : styles.scoreRed;
    return `${styles.scoreBase} ${scoreColor}`;
  };

  return (
    <div className={`${styles.teamMemberRow} ${isSelected ? styles.teamMemberRowSelected : ''}`}>
      <input
        type="checkbox"
        className={styles.memberCheckbox}
        checked={isSelected}
        onChange={() => onToggleSelect(member.id)}
        aria-label={`Select ${member.name}`}
      />
      <div className={styles.teamMemberInfo}>
        <span className={styles.teamMemberName}>{member.name}</span>
        <div className={styles.teamMemberIcons}>
          <Mail size={16} className={styles.icon} />
          <SlackIcon size={16} />
        </div>
      </div>
      <span className={getScoreStyle(member.score.split('/')[0])}>{member.score}</span>
    </div>
  );
};

TeamMemberRow.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    score: PropTypes.string.isRequired,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggleSelect: PropTypes.func.isRequired,
};
