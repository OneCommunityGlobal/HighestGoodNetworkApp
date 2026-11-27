import styles from './StudentBadgeGallery.module.css';

const BadgeCard = ({ badge }) => {
  const { name, description, icon, earned } = badge;

  return (
    <div className={`${styles.card} ${!earned ? styles.unearned : ''}`}>
      <img src={icon} alt={name} className={styles.icon} />
      <h3 className={styles.badgeName}>{name}</h3>
      <p className={styles.badgeDesc}>{description}</p>
    </div>
  );
};

export default BadgeCard;
