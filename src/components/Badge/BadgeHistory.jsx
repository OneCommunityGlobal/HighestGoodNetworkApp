import BadgeImage from './BadgeImage';
import { WEEK_DIFF } from '../../constants/badge';

function BadgeHistory({ badges, personalBestMaxHrs }) {
  const filterBadges = allBadges => {
    if (!Array.isArray(allBadges)) return [];

    const filteredList = allBadges.filter(value => 
      value && value.lastModified && 
      (Date.now() - new Date(value.lastModified).getTime() > WEEK_DIFF)
    );

    filteredList.sort((a, b) => {
      const rankingA = a?.badge?.ranking ?? Infinity;
      const rankingB = b?.badge?.ranking ?? Infinity;
      const nameA = a?.badge?.badgeName ?? '';
      const nameB = b?.badge?.badgeName ?? '';

      if (rankingA === 0) return 1;
      if (rankingB === 0) return -1;
      if (rankingA > rankingB) return 1;
      if (rankingA < rankingB) return -1;
      return nameA.localeCompare(nameB);
    });

    return filteredList;
  };

  const filteredBadges = filterBadges(badges);

  return (
    <div className="badge_history_container">
      {filteredBadges.map((value, index) => (
        value && value.badge ? (
          <BadgeImage
            personalBestMaxHrs={personalBestMaxHrs}
            time="old"
            count={value.count}
            badgeData={value.badge}
            index={index}
            key={value.badge._id || index}
          />
        ) : null
      ))}
    </div>
  );
}

export default BadgeHistory;