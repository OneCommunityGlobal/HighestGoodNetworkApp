import React from 'react';
import {
  Card, CardTitle, CardBody
} from 'reactstrap';
import BadgeImage from './BadgeImage';

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
        <div className="new_badges badge_image_sm">
          {props.badges.map((value, index) =>
            <BadgeImage badgeData={value.badge} index={index} />
          )}
        </div>
      </CardBody>
    </Card >
  );

export default NewBadges;