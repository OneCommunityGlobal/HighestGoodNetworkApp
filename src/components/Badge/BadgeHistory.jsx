import React from 'react';
import BadgeImage from './BadgeImage';

const BadgeHistory = (props) =>
  (
    <div className="badge_image_sm">
      {props.badges.map((value, index) =>
        <BadgeImage badgeData={value.badge} index={index} />
      )}
    </div>
  );

export default BadgeHistory;
