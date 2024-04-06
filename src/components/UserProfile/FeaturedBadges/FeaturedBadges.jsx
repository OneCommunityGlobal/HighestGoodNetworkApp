import React, { useEffect, useState } from 'react';
import BadgeImage from '../BadgeImage';

const FeaturedBadges = props => {
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [ loading, setLoading ] = useState(true);
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

  const preCacheImages = async (badgeInfoList) => {
    const promises = await badgeInfoList.map((badgeInfo) => {
     return new Promise(function (resolve, reject) {
        const img = new Image();
        img.src = badgeInfo.badge.imageUrl;
        img.onload = resolve;
        img.onerror = reject;
      });
    });
    await Promise.all(promises);
    setLoading(false);
  };

  useEffect(() => {
    if ( props.badges && props.badges.length > 0 ) {
      const filteredBadges = filterBadges(props.badges);
      
      preCacheImages(filteredBadges);
      setFilteredBadges(filteredBadges);
    }
  }, [props.badges]);

  return (
    <div data-testid="badge_featured_container" className="badge_featured_container">
      {filteredBadges.map((value, index) => (
        <BadgeImage personal BestMaxHrs={props.personalBestMaxHrs} count={value.count} badgeData={value.badge} index={index} key={index} />
      ))}
    </div>
  );
};

export default FeaturedBadges;
