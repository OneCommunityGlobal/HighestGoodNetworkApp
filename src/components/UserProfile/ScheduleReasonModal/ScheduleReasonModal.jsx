import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Container, Row, Col, Modal as NestedModal, ModalBody, ModalFooter } from 'reactstrap';
import Form from 'react-bootstrap/Form';
import moment from 'moment-timezone';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useEffect, useState } from 'react';
import { getReasonByDate } from 'actions/reasonsActions';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { boxStyle } from 'styles';
import './ScheduleReasonModal.css';

const ScheduleReasonModal = ({
  handleClose,
  show,
  user,
  reason,
  setReason,
  handleSubmit,
  fetchState,
  date,
  setDate,
  fetchMessage,
  fetchDispatch,
  userId,
  IsReasonUpdated,
  setIsReasonUpdated,
  numberOfReasons,
  infringementsNum
}) => {
  useEffect(() => {
    const initialFetching = async () => {
      fetchDispatch({ type: 'FETCHING_STARTED' });
      const response = await getReasonByDate(userId, date);
      // console.log(response);
      if (response.status !== 200) {
        fetchDispatch({
          type: 'ERROR',
          payload: { message: response.message, errorCode: response.errorCode },
        });
      } else {
        // console.log('reason: ', reason);
        // console.log('date: ', date);
        if (reason !== response.data.reason ) {
          setReason(response.data.reason);
        }
        fetchDispatch({ type: 'FETCHING_FINISHED', payload: { isSet: response.data.isSet } });
      }
    };
    initialFetching();
  }, [date]);

// ===============================================================
  // This useEffect will make sure to close the modal that allows for users to schedule reasons - Sucheta
  useEffect(()=>{
    if(user.role === "Owner" || user.role === "Administrator"){
      return
    }else{
      if (infringementsNum >= 5 || numberOfReasons >= 5 || (infringementsNum + numberOfReasons >= 5)){
        handleClose();
      }
    }
  },[numberOfReasons,infringementsNum])
// ===============================================================

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [offTimeWeeks, setOffTimeWeeks] = useState([]);
  const [dateInputError, setDateInputError] = useState('');

  const validateDateIsNotBeforeToday = returnDate => {
    const isBeforeToday = moment(returnDate).isBefore(moment(), 'day');
    if (isBeforeToday) {
      setDateInputError('The selected return date must be after today');
      return false;
    }
    setDateInputError('');
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

  const filterSunday = (date) => {
    const day = date.getDay();
    return day === 0;
  };

  const handleSaveReason = e => {
    e.preventDefault();
    if (!validateDateIsNotBeforeToday(date)) return;
    const weeks = getWeekIntervals(date);
    setOffTimeWeeks(weeks);
    toggleConfirmationModal();
  };

  const handelConfirmReason = () => {
    handleSubmit();
    toggleConfirmationModal();
  };

  return (
    <>
      <Modal.Header closeButton={true}>
        <Modal.Title className="centered-container">
          <div className="centered-text">Choose to Use a Blue Square</div>
          <div className="centered-text">(function under development)</div>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSaveReason}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>
              {/* Schedule a reason to be used on this weekend's blue square for {user.firstName} */}
              Need to take a week off for an emergency or vacation? That's no problem. The system
              will still issue you a blue square but scheduling here will note this reason on it so
              it's clear you chose to use one (vs receiving one for missing something) and let us
              know in advance. Blue squares are meant for situations like this and we allow 5 a
              year.
            </Form.Label>
            <Form.Label>
              <p>
                To schedule your time off, you need to CHOOSE THE SUNDAY OF THE WEEK YOU’LL RETURN.
                This is the date needed so your reason ends up on the blue square that will be
                auto-issued AT THE END OF THE WEEK YOU'LL BE GONE.
              </p>
            </Form.Label>
            <Form.Label>Choose the Sunday of the week you'll return:</Form.Label>
            <DatePicker
              selected={moment(date).toDate()}
              onChange={dateSelected => {
                const dateSelectedTz = moment(dateSelected)
                  .tz('America/Los_Angeles')
                  .endOf('week')
                  .toISOString()
                  .split('T')[0];
                setDate(dateSelectedTz);
              }}
              filterDate={filterSunday}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select a Sunday"
              id="dateOfLeave"
              className="form-control"
              wrapperClassName="w-100"
            />
            <Form.Text className="text-danger pl-1">{dateInputError}</Form.Text>
            <Form.Label className="mt-4">
              What is your reason for requesting this time off?
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="BlueSquareReason"
              className="w-100"
              placeholder="Please be detailed in describing your reason and, if it is different than your scheduled Sunday, include the expected date you’ll return to work."
              value={reason}
              onChange={e => {
                setReason(e.target.value);
              }}
              disabled={fetchState.isFetching}
            />
          </Form.Group>
          {!fetchState.isFetching && fetchState.error ? (
            <Alert variant={'danger'}>{fetchMessage}</Alert>
          ) : !fetchState.isFetching && fetchState.success ? (
            <Alert variant={'success'}>Reason Scheduling Saved!</Alert>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" title="Function coming" onClick={handleClose} style={boxStyle}>
            FAQ
          </Button>
          <Button variant="secondary" onClick={handleClose} style={boxStyle}>
            Close
          </Button>
          {/* Save button */}
          <Button
            variant="primary"
            type="submit"
            disabled={fetchState.isFetching || !reason}
            title="To Save - add a new reason or edit an existing reason. 
          Clicking 'Save' will generate an email to you and One Community as a record of this request."
            style={boxStyle}
          >
            {fetchState.isFetching ? <Spinner animation="border" size="sm" /> : 'Save'}
          </Button>
          <NestedModal isOpen={confirmationModal} toggle={toggleConfirmationModal}>
            <ModalBody>
              <Container>
                <Row>
                  <Col className='mb-1'>The blue square reason will be scheduled for the following week:</Col>
                </Row>
                {offTimeWeeks.length > 0 && (
                  <Row>
                    <Col  className='mb-1'>
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
          </NestedModal>
        </Modal.Footer>
      </Form>
    </>
  );
};

export default React.memo(ScheduleReasonModal);
