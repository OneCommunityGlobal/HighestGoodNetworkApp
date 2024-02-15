import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Container, Row, Col, Modal as NestedModal, ModalBody, ModalFooter } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import Form from 'react-bootstrap/Form';
import moment from 'moment-timezone';
import Spinner from 'react-bootstrap/Spinner';
import {  useState } from 'react';
// import { getReasonByDate } from 'actions/reasonsActions';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { boxStyle } from 'styles';
import './ScheduleReasonModal.css';

const ScheduleReasonModal = ({ handleClose, userId }) => {
  const dispatch = useDispatch()
  const allRequests = useSelector(state => state.timeOffRequests.requests);
  const nextSundayStr =  moment().isoWeekday(7).startOf('day')
  const nextSunday = new Date(nextSundayStr.year(), nextSundayStr.month(), nextSundayStr.date())

  const initialRequestData = {
    dateOfLeave: nextSunday,
    reasonForLeave: '',
  };

  const initialRequestDataErrors = {
    dateOfLeaveError: '',
    reasonForLeaveError: '',
  };
 
  const [requestData, setRequestData] = useState(initialRequestData);
  const [requestDataErrors, setRequestDataErrors] = useState(initialRequestDataErrors);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [offTimeWeeks, setOffTimeWeeks] = useState([]);

  const handleAddRequestDataChange = e => {
    e.preventDefault();
    const id = e.target.name;
    const value = e.target.value;
    setRequestData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  // checks if date value is not empty
  const validateDateOfLeave = data => {
    if (!data.dateOfLeave) {
      setRequestDataErrors(prev => ({
        ...prev,
        dateOfLeaveError: 'Date of leave can not be empty',
      }));
      return false;
    }
    return true;
  };

  // checks if date of leave is not before the start of current week
  const validateDateIsNotBeforeStartOfCurrentWeek = data => {
    const isBeforeToday = moment(getDateWithoutTimeZone(data.dateOfLeave)).isBefore(moment().startOf('week'), 'day');
    if (isBeforeToday) {
      setRequestDataErrors(prev => ({
        ...prev,
        dateOfLeaveError: 'Date of leave can not be before the start of current week',
      }));
      return false;
    }
    return true;
  };

  // checks if the newly added request doesn't overlap with existing ones
  const checkIfRequestOverlapsWithOtherRequests = data => {
    const dataStartingDate = moment(getDateWithoutTimeZone(data.dateOfLeave)).tz('America/Los_Angeles')
    const dataEndingDate = moment(data.dateOfLeave).tz('America/Los_Angeles').add( 1 , 'week')
    if (allRequests[userId]?.length > 0) {
      const isAnyOverlapingRequests = allRequests[userId].some(request => {
        const requestStartingDate = moment(request.startingDate).tz('America/Los_Angeles');
        const requestEndingDate = moment(request.endingDate).tz('America/Los_Angeles')
        const startingDateIsBetween = dataStartingDate.isBetween(requestStartingDate, requestEndingDate)
        const endingDateIsBetween = dataEndingDate.isBetween(requestStartingDate, requestEndingDate)

        if (startingDateIsBetween || endingDateIsBetween) {
          return true
        }
        return false
      });
      
     
      if (isAnyOverlapingRequests) {
        setRequestDataErrors(prev => ({
          ...prev,
          dateOfLeaveError: 'this request overlap with other existing requests',
        }));
        return false;
      }
    }
    return true;
  };
  
  // checks if reason for leave is not empty and if it has over 10 words
  const validateReasonForLeave = data => {
      if (!data.reasonForLeave) {
        setRequestDataErrors(prev => ({
          ...prev,
          reasonForLeaveError: 'Reason for leave can not be empty',
        }));
        return false;
      }
      const words = data.reasonForLeave?.split(' ');
      if (words.length < 10) {
        setRequestDataErrors(prev => ({
          ...prev,
          reasonForLeaveError: 'Reason for leave can not be less than 10 words',
        }));
        return false;
      }
    return true;
  };

  const toggleConfirmationModal = () => {
    setConfirmationModal(prev => !prev);
  };

  const getWeekIntervals = endDate => {
    const weekEnd = moment(endDate).subtract(1, 'day');
    const weekStart = moment(weekEnd).startOf('week');

    const formattedInterval = [formatDate(weekStart), formatDate(weekEnd)];

    return formattedInterval;
  };

  const formatDate = date => {
    return date.format('MM/DD/YYYY');
  };

  const filterSunday = date => {
    const day = date.getDay();
    return day === 0;
  };

  const handleSaveReason = e => {
    e.preventDefault();
    setRequestDataErrors(initialRequestDataErrors);

    if (!validateDateOfLeave(requestData)) return;
    if (!validateDateIsNotBeforeStartOfCurrentWeek(requestData)) return;
    if (!checkIfRequestOverlapsWithOtherRequests(requestData)) return;
    if (!validateReasonForLeave(requestData)) return;


    // const weeks = getWeekIntervals(date);
    // setOffTimeWeeks(weeks);
    // toggleConfirmationModal();
  };

  const handelConfirmReason = () => {
    handleSubmit();
    toggleConfirmationModal();
  };

  const getDateWithoutTimeZone = date=>{
    const newDateObject = new Date(date); 
    const day = newDateObject.getDate(); 
    const month = newDateObject.getMonth() + 1; 
    const year = newDateObject.getFullYear();
    return moment(`${month}-${day}-${year}`, 'MM-DD-YYYY').format('YYYY-MM-DD')
  }

  return (
    <>
      <Modal.Header closeButton={true}>
        <Modal.Title className="centered-container">
          <div className="centered-text">Choose to Use a Blue Square</div>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSaveReason}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label className='mb-3'>
              {/* Schedule a reason to be used on this weekend's blue square for {user.firstName} */}
              Need to take a week off for an emergency or vacation? That's no problem. The system
              will still issue you a blue square but scheduling here will note this reason on it so
              it's clear you chose to use one (vs receiving one for missing something) and let us
              know in advance. Blue squares are meant for situations like this and we allow 5 a
              year.
            </Form.Label>
            <Form.Label>Select the Sunday of the week when you plan to leave:</Form.Label>
            <DatePicker
              selected={requestData.dateOfLeave}
              onChange={date => {
                setRequestData(prev => ({
                  ...prev,
                  ['dateOfLeave']: date,
                }));
              }}
              filterDate={filterSunday}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select a Sunday"
              id="dateOfLeave"
              className="form-control"
              wrapperClassName="w-100"
            />
            <Form.Text className="text-danger pl-1">{requestDataErrors.dateOfLeaveError}</Form.Text>
            <Form.Label className="mt-1">
              What is your reason for requesting this time off?
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="reasonForLeave"
              className="w-100"
              placeholder="Please be detailed in describing your reason and, if it is different than your scheduled Sunday, include the expected date you’ll return to work."
              value={requestData.reasonForLeave}
              onChange={e => handleAddRequestDataChange(e)}
            />
            <Form.Text className="text-danger pl-1">
              {requestDataErrors.reasonForLeaveError}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} style={boxStyle}>
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            title="To Save - add a new reason or edit an existing reason. 
          Clicking 'Save' will generate an email to you and One Community as a record of this request."
            style={boxStyle}
          >
             Save
          </Button>
          {/* <NestedModal isOpen={confirmationModal} toggle={toggleConfirmationModal}>
            <ModalBody>
              <Container>
                <Row>
                  <Col className="mb-1">
                    The blue square reason will be scheduled for the following week:
                  </Col>
                </Row>
                {offTimeWeeks.length > 0 && (
                  <Row>
                    <Col className="mb-1">
                      <li>
                        <b>{`From `}</b>
                        {offTimeWeeks[0]}
                        <b>{` To `}</b>
                        {offTimeWeeks[1]}
                      </li>
                    </Col>
                  </Row>
                )}
                <Row>
                  <Col>Please confirm your selection</Col>
                </Row>
              </Container>
            </ModalBody>
            <ModalFooter>
              <Button variant="primary" onClick={handelConfirmReason}>
                Confirm
              </Button>
              <Button variant="secondary" onClick={toggleConfirmationModal}>
                Cancel
              </Button>
            </ModalFooter>
          </NestedModal> */}
        </Modal.Footer>
        <Modal.Footer>
          <Container style={{ overflow: 'scroll', overflowX: 'hidden', maxHeight: '160px' }}>
            {allRequests[userId]?.length > 0 ? (allRequests[userId].map( request =>
              (<ScheduleReasonModalCard key={request._id} request={request} handleDeleteRequest={handleDeleteRequest}/>)
            )): null}
          </Container>
        </Modal.Footer>
      </Form>
    </>
  );
};

export default React.memo(ScheduleReasonModal);
