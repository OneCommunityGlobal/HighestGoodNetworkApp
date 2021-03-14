import React from 'react';
import BadgeImage from './BadgeImage';
import {
  WEEK_DIFF
} from '../../constants/badge';

const BadgeHistory = (props) =>
(
  <div className="badge_history_container">
    {props.badges.filter(value => Date.now() - new Date(value.lastModified).getTime() > WEEK_DIFF).map((value, index) =>
      <BadgeImage count={value.count} badgeData={value.badge} index={index} key={index} />
    )}
  </div>
);

export default BadgeHistory;
