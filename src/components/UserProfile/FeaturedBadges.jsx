import React, { useEffect, useState } from 'react';
import BadgeImage from './BadgeImage';

const FeaturedBadges = props => {
  let [filteredBadges, setFilteredBadges] = useState([]);
  const filterBadges = allBadges => {
    let filteredList = allBadges || [];

    filteredList = filteredList.sort((a, b) => {
      if (a.featured > b.featured) return -1;
      if (a.featured < b.featured) return 1;
      if (a.badge.ranking > b.badge.ranking) return 1;
      if (a.badge.ranking < b.badge.ranking) return -1;
      if (a.badge.badgeName > b.badge.badgeName) return 1;
      if (a.badge.badgeName < b.badge.badgeName) return -1;
      return 0;
    });

    return filteredList.slice(0, 5);
  };
  useEffect(() => {
    setFilteredBadges(filterBadges(props.badges));
  }, [props.badges]);

  return (
    <div className="badge_featured_container">
      {filteredBadges.map((value, index) => (
        <BadgeImage personalBestMaxHrs={props.personalBestMaxHrs} count={value.count} badgeData={value.badge} index={index} key={index} />
      ))}
    </div>
  );
};

export default FeaturedBadges;
