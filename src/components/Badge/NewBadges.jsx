import React from 'react';
import {
  Card, CardTitle, CardBody
} from 'reactstrap';
import BadgeImage from './BadgeImage';
import {
  WEEK_DIFF
} from '../../constants/badge';

const NewBadges = (props) =>
(
  <Card style={{ backgroundColor: '#f6f6f3' }}>
    <CardBody >
      <CardTitle
        style={{
          fontWeight: 'bold',
          fontSize: 18,
          color: '#285739',
          marginBottom: 15
        }}
      >
        New Badges Earned
      </CardTitle>
      <div className="new_badges">
        {props.badges.filter(value => Date.now() - new Date(value.lastModified).getTime() <= WEEK_DIFF).map((value, index) =>
          <BadgeImage time="new" count={value.count} badgeData={value.badge} index={index} key={index} />
        )}
      </div>
    </CardBody>
  </Card >
);

export default NewBadges;