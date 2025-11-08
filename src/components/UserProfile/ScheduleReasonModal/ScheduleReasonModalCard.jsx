import { useState } from 'react';
import { Card, CardBody, Row, Col, Button } from 'reactstrap';
import moment from 'moment-timezone';

function ScheduleReasonModalCard({ request , handleDeleteRequest, handleEditRequest }) {
  const [showFullText, setShowFullText] = useState(false);
  const toggleShowText = () => {
    setShowFullText(!showFullText);
  };
    const REASON_TYPE_LABELS = {
    vacationTime: "Vacation Time",
    missingHours: "Missing Hours",
    missingSummary: "Missing Summary",
    missingBothHoursAndSummary: "Missing Both Hours and Summary",
    other: "Other"
  };
  console.log("ScheduleReasonModalCard request:", request);

  return (
    <Card className="mb-2">
      <CardBody>
        <Row>
          <Col md='7'>
            <p>
              <strong>Date Of Leave: </strong>
              {moment(request.startingDate).format('MMM Do YYYY')}
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
            <p>
              <strong>Reason Type: </strong>
              {REASON_TYPE_LABELS[request.reasonType] || request.reasonType}
            </p>
          </Col>
        </Row>

        <Row>
          <Col>
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
            <p className={`${!showFullText ? 'text-truncate' : ''}`} onClick={toggleShowText}>
              <strong>Reason: </strong>
              {request.reason}
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button color="primary" className="mr-1" onClick={() => handleEditRequest(request)}>
              Edit
            </Button>
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