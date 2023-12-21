import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { boxStyle } from 'styles';

function SchedulerExplanationModal({infringementsNum,handleClose, infringements}) {
  
  return (
    <div
      className="modal show"
      style={{ display: 'block', position: 'initial' }}
    >
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Please Refer To The Explanation </Modal.Title>
        </Modal.Header>

        <Modal.Body scrollable>
         {/* <p> You have <span style={{color:"red",fontWeight:500}}>{infringementsNum}</span> blue squares already and <span style={{fontWeight:500, color:"green"}}>5</span> is the maximum allowed per year. Please contact your Administrator if you need to request time off</p> */}
          <p>Including your time already requested off, you have used the equivalent of <span style={{color:"red",fontWeight:500}}>{infringementsNum}</span> blue squares. <span style={{fontWeight:500, color:"green"}}>5</span> is the maximum allowed per year. Please remove a time-off request below or contact your Administrator if you need to request time off in addition to what is listed here:
</p>
          <ol className='p-3 ml-2'>{infringements.map((el,index)=>{
            return <li key={el._id} className='p-2'>{el.description}</li>
          })}</ol>
          

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