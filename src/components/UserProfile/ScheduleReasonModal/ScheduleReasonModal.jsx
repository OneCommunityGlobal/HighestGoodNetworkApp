import { Modal, Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import moment from 'moment';

const ScheduleReasonModal = ({ handleToggle, show, user, reason, setReason, handleSubmit }) => {
  console.log(user);
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
              <Form.Control
                as="textarea"
                rows={3}
                name="BlueSquareReason"
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                }}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleToggle}>
              Close
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ScheduleReasonModal;
