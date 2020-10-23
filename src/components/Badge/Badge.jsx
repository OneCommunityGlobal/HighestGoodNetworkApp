import React from 'react';
import {
  Card, CardText, CardBody, Button, CardHeader,
} from 'reactstrap';
import './Badge.css';
import NewBadges from './NewBadges';
import OldBadges from './OldBadges';


const Badge = () => (
  <Card style={{ backgroundColor: '#fafafa', borderRadius: 0 }}>
    <CardHeader tag="h3">
      Badges
    </CardHeader>
    <CardBody>
      <NewBadges />
      <OldBadges />
      <CardText
        style={{
          fontWeight: 'bold',
          fontSize: 18,
          color: '#285739',

        }}
      >
        Bravo! You Earned 101 Badges!
      </CardText>
      <Button className="btn--dark-sea-green float-right">
        Badge Report
      </Button>
    </CardBody>
  </Card >
);

export default Badge;
