import React, { useState } from 'react';
import { Card, CardBody, Row, Col, Button } from 'reactstrap';
import moment from 'moment-timezone';

function ScheduleReasonModalCard({ request , handleDeleteRequest }) {
  const [showFullText, setShowFullText] = useState(false);
  const toggleShowText = () => {
    setShowFullText(!showFullText);
  };
  return (
    <Card className="mb-2">
      <CardBody>
        <Row>
          <Col md='7'>
            <p>
              <strong>Date Of Leave: </strong>
              {moment(request.startingDate).format('MMM Do YY')}
            </p>
          </Col >
          <Col md='5'>
          <p>
              <strong>Duration: </strong>
              {request.duration}{Number(request.duration) > 1 ? ` weeks`: ` week`}
            </p>
          
          </Col>
        </Row>
        <Row>
          <Col>
            <p className={`${!showFullText ? 'text-truncate' : ''}`} onClick={toggleShowText}>
              <strong>Reason: </strong>
              {request.reason}
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button className="btn btn-danger" onClick={() => handleDeleteRequest(request._id)}>
              Delete
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
}

export default ScheduleReasonModalCard;
