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
        if (reason !== response.data.reason && response.data.reason !== '') {
          setReason(response.data.reason);
        }
        fetchDispatch({ type: 'FETCHING_FINISHED', payload: { isSet: response.data.isSet } });
      }
    };
    initialFetching();
  }, [date]);

  const [confirmationModal, setConfirmationModal] = useState(false);
  const nextSundayDate = new Date(moment(date));
  const [returnDate, setReturnDate] = useState(nextSundayDate);
  const [offTimeWeeks, setOffTimeWeeks] = useState([]);
  const [dateInputError, setDateInputError] = useState('')

  const validateDateIsNotBeforeToday = returnDate => {
    const isBeforeToday = moment(returnDate).isBefore(moment(), 'day');
    if (isBeforeToday) {
      setDateInputError('The selected return date must be after today')
      return false;
    }
    setDateInputError('')
    return true;
  };

  const toggleConfirmationModal = () => {
    setConfirmationModal(prev => !prev);
  };

  const getWeekIntervals = endDate => {
    const result = [];
    const endDateTime = moment(endDate);

    let currentDate = moment();

    while (currentDate < endDateTime) {
      const weekStart = moment(currentDate).startOf('week');
      const weekEnd = moment(currentDate).endOf('week');
      const formattedInterval =  [formatDate(weekStart), formatDate(weekEnd)];
      result.push(formattedInterval);
      currentDate.add(7, 'days');
    }

    return result;
  };

  const formatDate = date => {
    return date.format('MM/DD/YYYY');
  };

  const filterSunday = date => {
    const losAngelesDate = moment(date).tz('America/Los_Angeles');
    return losAngelesDate.day() === 6; // Sunday
  };

  const handleSaveReason = e => {
    e.preventDefault();
    if (!validateDateIsNotBeforeToday(returnDate)) return;
    const weeks = getWeekIntervals(returnDate);
    setOffTimeWeeks(weeks);
    toggleConfirmationModal();
  };

  const handelConfirmReason = ()=>{
    const dateTZ  = moment(returnDate)
    .tz('America/Los_Angeles')
    .endOf('week')
    .toISOString()
    .split('T')[0];
    console.log(dateTZ)
    setDate(dateTZ)
    handleSubmit()
    toggleConfirmationModal()
  }

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
              selected={returnDate}
              onChange={date => {
                setReturnDate(date);
              }}
              filterDate={filterSunday}
              dateFormat="MM/dd/yyyy"
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
                setIsReasonUpdated(true);
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
          <Button
            variant="primary"
            type="submit"
            disabled={fetchState.isFetching || !IsReasonUpdated}
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
                  <Col>
                    The blue square reason will be scheduled for the following{' '}
                    {offTimeWeeks.length > 1 ? `weeks` : `week`}:
                  </Col>
                </Row>
                {offTimeWeeks.length > 0 && (
                  <Row>
                    <Col>
                      {offTimeWeeks.map((ele,index) => (
                        <li key={index}><b>{`From `}</b>{ele[0]}<b>{` To `}</b>{ele[1]}</li>
                      ))}
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
