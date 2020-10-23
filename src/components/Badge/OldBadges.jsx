import React from 'react';
import {
  Card, CardTitle, CardBody, Button
} from 'reactstrap';
import BadgeHistory from './BadgeHistory';

const OldBadges = () => (
  <Card style={{ backgroundColor: '#f6f6f3', marginTop: 20, marginBottom: 20 }}>
    <CardBody>
      <CardTitle
        style={{
          fontWeight: 'bold',
          fontSize: 18,
          color: '#285739',
          marginBottom: 15
        }}
      >
        Badges Earned Before Last Week
        <Button className="btn--dark-sea-green float-right" >Full View</Button>
      </CardTitle>
      <div className="old_badges">
        <BadgeHistory />
      </div>
    </CardBody>
  </Card >
);

export default OldBadges;