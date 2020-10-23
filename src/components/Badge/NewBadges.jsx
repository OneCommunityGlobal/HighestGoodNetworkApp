import React from 'react';
import {
  Card, CardTitle, CardBody
} from 'reactstrap';

const NewBadges = () => (
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
        <img src="badges/sample7.jpeg" alt="badge sample 7" />
        <img src="badges/sample8.jpeg" alt="badge sample 8" />
        <img src="badges/sample9.jpeg" alt="badge sample 9" />
        <img src="badges/sample10.jpeg" alt="badge sample 10" />
        <img src="badges/sample11.jpeg" alt="badge sample 11" />
        <img src="badges/sample12.jpeg" alt="badge sample 12" />
        <img src="badges/sample13.jpeg" alt="badge sample 13" />
        <img src="badges/sample14.png" alt="badge sample 14" />
        <img src="badges/sample15.jpeg" alt="badge sample 15" />
        <img src="badges/sample5.jpeg" alt="badge sample 5" />
      </div>
    </CardBody>
  </Card >
);

export default NewBadges;