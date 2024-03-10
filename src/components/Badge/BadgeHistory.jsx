import BadgeImage from './BadgeImage';
import { WEEK_DIFF } from '../../constants/badge';

function BadgeHistory({ badges, personalBestMaxHrs }) {
  const filterBadges = allBadges => {
    const filteredList = allBadges.filter(
      value => Date.now() - new Date(value.lastModified).getTime() > WEEK_DIFF,
    );

    filteredList.sort((a, b) => {
      if (a.badge.ranking === 0) return 1;
      if (b.badge.ranking === 0) return -1;
      if (a.badge.ranking > b.badge.ranking) return 1;
      if (a.badge.ranking < b.badge.ranking) return -1;
      if (a.badge.badgeName > b.badge.badgeName) return 1;
      if (a.badge.badgeName < b.badge.badgeName) return -1;

      // If all conditions fail, return 0 to indicate that elements are equal
      return 0;
    });
    return filteredList;
  };

  const filteredBadges = filterBadges(badges);

  return (
    <div className="badge_history_container">
      {filteredBadges.map((value, index) => (
        <BadgeImage
          personalBestMaxHrs={personalBestMaxHrs}
          time="old"
          count={value.count}
          badgeData={value.badge}
          index={index}
          key={index}
        />
      ))}
    </div>
  );
}

export default BadgeHistory;
