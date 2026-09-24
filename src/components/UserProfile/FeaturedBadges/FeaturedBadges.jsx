import { useMemo } from 'react';
import styles from '../Badge.module.css';
import BadgeImage from '../BadgeImage';
import { sortBadgeRecords } from '../../Badge/badgeListUtils';

const filterBadges = allBadges =>
  sortBadgeRecords(allBadges)
    .filter(badge => badge.featured)
    .slice(0, 5);

const FeaturedBadges = props => {
  const filteredBadges = useMemo(() => filterBadges(props.badges), [props.badges]);

  return (
    <div data-testid="badge_featured_container" className={styles.badge_featured_container}>
      {filteredBadges.map((value, index) => (
        <BadgeImage
          personalBestMaxHrs={props.personalBestMaxHrs}
          count={value.count}
          badgeData={value.badge}
          index={index}
          key={value.badge?._id || index}
        />
      ))}
    </div>
  );
};

export default FeaturedBadges;
