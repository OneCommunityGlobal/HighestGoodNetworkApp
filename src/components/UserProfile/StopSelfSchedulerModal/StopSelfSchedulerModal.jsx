import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { boxStyle } from 'styles';

function StopSelfSchedulerModal({infringementsNum,handleClose}) {
  return (
    <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Can Not Schedule Time Off</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>You currently possess <span style={{color:"red"}}>{infringementsNum}</span> blue squares, with an annual limit of 5. If you require time off, kindly reach out to your Administrator. </p>
          <p>Note: Blue squares expire after 1 calendar year from their issuance date.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} style={boxStyle}>Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

export default StopSelfSchedulerModal;