import React from 'react';
import BadgeImage from './BadgeImage';
import {
  WEEK_DIFF
} from '../../constants/badge';

const BadgeHistory = (props) =>
(
  <div className="badge_image_sm">
    {props.badges.filter(value => Date.now() - new Date(value.lastModified).getTime() > WEEK_DIFF).map((value, index) =>
      <BadgeImage badgeData={value.badge} index={index} key={index} />
    )}
  </div>
);

export default BadgeHistory;
