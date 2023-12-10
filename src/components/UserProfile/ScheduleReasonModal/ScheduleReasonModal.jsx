import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useEffect } from 'react';
import { getReasonByDate } from 'actions/reasonsActions';
import { boxStyle } from 'styles'
import   './ScheduleReasonModal.css';
import FAQ_Modal  from '../BlueSquares/BlueSquaresFAQ_Modal/BlueSquaresFAQ_Modal';
//import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';





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
      console.log(response);
      if (response.status !== 200) {
        fetchDispatch({
          type: 'ERROR',
          payload: { message: response.message, errorCode: response.errorCode },
        });
      } else {
        setReason(response.data.reason);
        fetchDispatch({ type: 'FETCHING_FINISHED', payload: { isSet: response.data.isSet } });
      }
    };
    initialFetching();
  }, [date]);

  return (
    <>
      <Modal.Header closeButton={true}>
        <Modal.Title className="centered-container">Choose to Use a Blue Square</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>
              {/* Schedule a reason to be used on this weekend's blue square for {user.firstName} */}
              Need to take a week off for an emergency or vacation? That's no problem. The system will still issue you a blue square but scheduling here will note this reason on it so it's clear you chose to use one (vs receiving one for missing something) and let us know in advance. Blue squares are meant for situations like this and we allow 5 a year.
            </Form.Label>
            <Form.Label>
              <p>
                To schedule your time off, you need to CHOOSE THE SUNDAY OF THE WEEK YOU’LL RETURN. This is the date needed so your reason ends up on the blue square that will be auto-issued AT THE END OF THE WEEK YOU'LL BE GONE.
              </p>
            </Form.Label>
            <Form.Label>Choose the Sunday of the week you'll return: 
              </Form.Label>
            <Form.Control
              name="datePicker"
              type="date"
              className="w-100"
              value={date}
              onChange={e => {
                setDate(e.target.value);
              }}
            />
            <Form.Label className="mt-4">What is your reason for requesting this time off?</Form.Label>
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
        <Button variant="success" title="FAQ" onClick={handleClose} style={boxStyle}>
           FAQ
          </Button>
          <div align = "right">
            {/* <FAQ_Modal
                  areaName="blueSquares_info"
                  areaTitle="Blue Squares"
                  fontSize={24}
                  isPermissionPage
                /> */}
          </div>
         <Button variant="secondary" onClick={handleClose} style={boxStyle}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={fetchState.isFetching || !IsReasonUpdated} title="To Save - add a new reason or edit an existing reason. 
          Clicking 'Save' will generate an email to you and One Community as a record of this request." style={boxStyle}>
            {fetchState.isFetching ? <Spinner animation="border" size="sm" /> : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </>
  );
};

export default React.memo(ScheduleReasonModal);
