// import  from 'react';
import BadgeImage from './BadgeImage';
import { WEEK_DIFF } from '../../constants/badge';

function BadgeHistory(props) {
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
      return null;
    });
    return filteredList;
  };

  const filteredBadges = filterBadges(props.badges);

  return (
    <div className="badge_history_container">
      {filteredBadges.map((value, index) => (
        <BadgeImage
          time="old"
          count={value.count}
          badgeData={value.badge}
          index={index}
          key={value._id}
        />
      ))}
    </div>
  );
}

export default BadgeHistory;
