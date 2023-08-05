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

  const closePopup = e => {
    props.onClose();
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
      <ModalHeader toggle={closePopup}>Log Requested Time Off</ModalHeader>
      <ModalBody>
        <Container>
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
                  <FormText color="danger">{'Number of weeks should be greater than 0.'}</FormText>
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
                  rows="4"
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
        </Container>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" style={boxStyle}>
          Save
        </Button>
        <Button color="secondary" onClick={closePopup} style={boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default LogTimeOffPopUp;
