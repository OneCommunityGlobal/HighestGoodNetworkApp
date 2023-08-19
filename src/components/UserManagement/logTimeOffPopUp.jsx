import React, { useState } from 'react';
import moment from 'moment';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormText,
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Card,
  CardBody,
  CardTitle,
  Form,
} from 'reactstrap';
import { boxStyle } from 'styles';

const LogTimeOffPopUp = React.memo(props => {
  const today = moment().format('YYYY-MM-DD');
  const [dateOfLeave, setDateOfLeave] = useState(today);
  const [numberOfWeeks, setNumberOfWeeks] = useState(1);
  const [reasonForLeave, setReasonForLeave] = useState('');
  const [dateOfLeaveError, setDateOfLeaveError] = useState(false);
  const [numberOfWeeksError, setNumberOfWeeksError] = useState(false);
  const [reasonForLeaveError, setReasonForLeaveError] = useState(false);
  const [nestedModal, SetNestedModal] = useState(false);

  const closePopup = e => {
    props.onClose();
  };

  const closeNested = () => {
    SetNestedModal(false);
  };

  const openNested = () => {
    SetNestedModal(true);
  };
  const handleDateOfLeave = e => {
    e.preventDefault();
    const DateOfLeave = e.target.value;
    const isBeforeToday = moment(DateOfLeave).isBefore(moment(), 'day');
    if (isBeforeToday) {
      setDateOfLeaveError(prev => true);
    } else {
      setDateOfLeaveError(prev => false);
    }
    setDateOfLeave(prev => DateOfLeave);
  };

  const handleNumberOfWeeks = e => {
    e.preventDefault();
    const NumberOfWeeks = e.target.value;
    if (NumberOfWeeks <= 0) {
      setNumberOfWeeksError(prev => true);
    } else {
      setNumberOfWeeksError(prev => false);
    }
    setNumberOfWeeks(prev => NumberOfWeeks);
  };

  const handleReasonForLeave = e => {
    e.preventDefault();
    const reasonForLeave = e.target.value;
    const words = reasonForLeave.split(' ');
    if (words.length < 10) {
      setReasonForLeaveError(prev => true);
    } else {
      setReasonForLeaveError(prev => false);
    }
    setReasonForLeave(prev => reasonForLeave);
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Add New Time Off Request</ModalHeader>
      <ModalBody>
        <Container>
          <Form>
            <Row>
              <Col>
                <FormGroup>
                  <Label for="dateOfLeave">Date of leave</Label>
                  <Input
                    type="date"
                    name="dateOfLeave"
                    id="dateOfLeave"
                    value={dateOfLeave}
                    onChange={e => handleDateOfLeave(e)}
                  />
                  {dateOfLeaveError && (
                    <FormText color="danger">{'Please choose a future date.'}</FormText>
                  )}
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label for="numberOfWeeks">Duration in weeks</Label>
                  <Input
                    type="number"
                    name="numberOfWeeks"
                    id="numberOfWeeks"
                    value={numberOfWeeks}
                    onChange={e => handleNumberOfWeeks(e)}
                  />
                  {numberOfWeeksError && (
                    <FormText color="danger">
                      {'Number of weeks should be greater than 0.'}
                    </FormText>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormGroup>
                  <Label for="reasonForLeave">Reason for leave</Label>
                  <Input
                    type="textarea"
                    rows="2"
                    placeholder="Add the reason for requesting time off here"
                    id="reasonForLeave"
                    value={reasonForLeave}
                    onChange={e => handleReasonForLeave(e)}
                  />
                  {reasonForLeaveError && (
                    <FormText color="danger">
                      {'the reason for leave should be at least 10 words.'}
                    </FormText>
                  )}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button color="primary" style={boxStyle}>
                  Save
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </ModalBody>
      {props.userTimeOffRequests.length > 0 && (
        <>
          <ModalHeader>Time Off Requests</ModalHeader>
          <ModalBody className="Logged-time-off-cards-container">
            <Container>
              {props.userTimeOffRequests.map(request => (
                <Card className="mb-2" key={request._id}>
                  <CardBody>
                    <Row>
                      <Col>
                        <h6>Date of Leave:</h6>
                        <p>{moment(request.startingDate).format('MM/DD/YYYY')}</p>
                      </Col>
                      <Col>
                        <h6>Duration (weeks):</h6>
                        <p>{request.duration}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <h6>Reason for Leave:</h6>
                        <p>{request.reason}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Button color="primary" onClick={openNested}>
                          Edit
                        </Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              ))}
            </Container>
            <Modal isOpen={nestedModal} toggle={closeNested}>
              <ModalHeader toggle={closeNested}>Edit Time Off Request</ModalHeader>
              <ModalBody>
                <Container>
                  <Form>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="dateOfLeave">Date of leave</Label>
                          <Input type="date" />
                          {dateOfLeaveError && (
                            <FormText color="danger">{'Please choose a future date.'}</FormText>
                          )}
                        </FormGroup>
                      </Col>
                      <Col>
                        <FormGroup>
                          <Label for="numberOfWeeks">Duration in weeks</Label>
                          <Input type="number" />
                          {numberOfWeeksError && (
                            <FormText color="danger">
                              {'Number of weeks should be greater than 0.'}
                            </FormText>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormGroup>
                          <Label for="reasonForLeave">Reason for leave</Label>
                          <Input type="textarea" rows="2" />
                          {reasonForLeaveError && (
                            <FormText color="danger">
                              {'the reason for leave should be at least 10 words.'}
                            </FormText>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Button color="primary" style={boxStyle}>
                          Save
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Container>
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={closeNested} style={boxStyle}>
                  Close
                </Button>
              </ModalFooter>
            </Modal>
          </ModalBody>
        </>
      )}
      <ModalFooter>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default LogTimeOffPopUp;
