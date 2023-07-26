import { Modal, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useEffect } from 'react';
import { getReasonByDate } from 'actions/reasonsActions';

const ScheduleReasonModal = ({
  handleToggle,
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
}) => {
  useEffect(() => {
    setDate(
      moment()
        .tz('America/Los_Angeles')
        .endOf('week')
        .toISOString()
        .split('T')[0],
    );
  }, []);

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
        fetchDispatch({ type: 'FETCHING_FINISHED', payload: {isSet: response.data.isSet} });
      }
    };
    initialFetching();
  }, [date]);

  return (
    <>
      <Modal show={show} onHide={handleToggle}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Schedule a reason for the weekly blue square</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>
                Schedule a reason to be used on this weekend's blue square for {user.firstName}
              </Form.Label>
              <Form.Label>
                <p>
                  <em>(If a reason has already been submitted, you can edit it)</em>
                </p>
              </Form.Label>
              <Form.Label>Pick a date to schedule your reason!</Form.Label>
              <Form.Control
                name="datePicker"
                type="date"
                className="w-100"
                value={date}
                onChange={e => {
                  setDate(e.target.value);
                }}
              />
              <Form.Label className="mt-4">Write the blue square's reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="BlueSquareReason"
                className="w-100"
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
            <Button variant="secondary" onClick={handleToggle}>
              Close
            </Button>
            <Button variant="primary" type="submit" disabled={fetchState.isFetching}>
              {fetchState.isFetching ? <Spinner animation="border" size="sm" /> : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ScheduleReasonModal;
