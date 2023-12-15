import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { boxStyle } from 'styles';

function SchedulerExplanationModal({infringementsNum,handleClose}) {
  return (
    <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Please Refer To The Explanation </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>You currently possess <span style={{color:"red",fontWeight:500}}>{infringementsNum}</span> blue squares, with an annual limit of <span style={{fontWeight:500, color:"green"}}>5</span>. If you require time off, kindly reach out to your Administrator. </p>
          <p><em>Note</em>: Blue squares expire after 1 calendar year from their issuance date.</p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} style={boxStyle}>Close</Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

export default SchedulerExplanationModal;