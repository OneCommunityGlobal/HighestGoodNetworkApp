import React from 'react';

import { Card, Row, CardTitle, CardText, Col, Badge } from 'reactstrap';

const WorkHistory = () => (
  <Row
    style={{
      marginRight: 0,
    }}
  >
    <Col lg>
      <Card body>
        <CardTitle style={{ fontWeight: 'bold' }}>Hours Contributed :</CardTitle>
        <CardText
          style={{
            fontSize: 20,
            justifyContent: 'space-between',
            display: 'flex',
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <Badge color="primary">This Week</Badge>
          <span>10 hours</span>
        </CardText>
        <CardText
          style={{
            fontSize: 20,
            justifyContent: 'space-between',
            display: 'flex',
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <Badge color="primary">This Month</Badge> <span>40 hours</span>
        </CardText>
      </Card>
    </Col>

    <Col lg>
      <Card body>
        <CardTitle style={{ fontWeight: 'bold' }}>Volunteering History :</CardTitle>
        <CardText
          style={{
            fontSize: 20,
            justifyContent: 'space-between',
            display: 'flex',
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <Badge color="primary">Start Date: </Badge>
          <span>06/10/2019</span>
        </CardText>
        <CardText
          style={{
            fontSize: 20,
            justifyContent: 'space-between',
            display: 'flex',
            paddingLeft: 20,
            paddingRight: 20,
          }}
        >
          <Badge color="primary">End Date:</Badge>
          <span>07/11/2019</span>
        </CardText>
      </Card>
    </Col>
  </Row>
);

export default WorkHistory;
