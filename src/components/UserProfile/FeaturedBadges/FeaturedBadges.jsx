import React, { useEffect, useState } from 'react';
import BadgeImage from '../BadgeImage';

const FeaturedBadges = props => {
  const [filteredBadges, setFilteredBadges] = useState([]);

  const filterBadges = allBadges => {
    if (!Array.isArray(allBadges)) return [];

    let filteredList = allBadges.filter(badge => badge && badge.badge);

    filteredList.sort((a, b) => {
      const featuredA = a.featured ?? false;
      const featuredB = b.featured ?? false;
      const rankingA = a.badge?.ranking ?? 0;
      const rankingB = b.badge?.ranking ?? 0;
      const nameA = a.badge?.badgeName ?? '';
      const nameB = b.badge?.badgeName ?? '';

      if (featuredA > featuredB) return -1;
      if (featuredA < featuredB) return 1;
      if (rankingA > rankingB) return 1;
      if (rankingA < rankingB) return -1;
      return nameA.localeCompare(nameB);
    });

    return filteredList.slice(0, 5);
  };

  useEffect(() => {
    setFilteredBadges(filterBadges(props.badges));
  }, [props.badges]);

  return (
    <div data-testid="badge_featured_container" className="badge_featured_container">
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