import React from 'react';
import { Mail } from 'lucide-react';
import { SlackIcon } from './SlackIcon';
import styles from './TeamCard.module.css';

export const TeamMemberRow = ({ member }) => {
  const getScoreStyle = score => {
    const scoreNum = parseInt(score);
    const scoreColor = scoreNum >= 5 ? styles.scoreGreen : styles.scoreRed;
    return `${styles.scoreBase} ${scoreColor}`;
  };

  return (
    <div className={styles.teamMemberRow}>
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
