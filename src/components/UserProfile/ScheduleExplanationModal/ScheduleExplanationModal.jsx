import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { boxStyle } from 'styles';
import moment from 'moment-timezone';

function SchedulerExplanationModal({
  infringementsNum,
  handleClose,
  infringements,
  timeOffRequests,
}) {
  return (
    <div className="modal show" style={{ display: 'block', position: 'initial' }}>
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Please Refer To The Explanation </Modal.Title>
        </Modal.Header>
        <Modal.Body scrollable="true">
          {/* <p> You have <span style={{color:"red",fontWeight:500}}>{infringementsNum}</span> blue squares already and <span style={{fontWeight:500, color:"green"}}>5</span> is the maximum allowed per year. Please contact your Administrator if you need to request time off</p> */}
          <p>
            Including your time already requested off, you have used the equivalent of{' '}
            <span style={{ color: 'red', fontWeight: 500 }}>{infringementsNum}</span> blue squares
            and <span style={{ color: 'red', fontWeight: 500 }}>{timeOffRequests.length}</span>{' '}
            schedule time offs. <span style={{ fontWeight: 500, color: 'green' }}>5</span> is the
            maximum allowed per year. Please remove a time-off request below or contact your
            Administrator if you need to request time off in addition to what is listed here:
          </p>

          {infringements.length > 0 && (
            <>
              <h5>INFRINGEMENTS</h5>
              <ol className="p-3 ml-2">
                {infringements.map((el, index) => {
                  return (
                    <li key={el._id} className="p-2">
                      {el.description}
                    </li>
                  );
                })}
              </ol>
            </>
          )}
          {timeOffRequests.length > 0 && (
            <>
              <h5>SCHEDULED TIME OFF</h5>
              <ol className="p-3 ml-2">
                {timeOffRequests.map((el, index) => {
                  return (
                    <li key={el._id} className="p-2">
                      <b>{`Date: `}</b>
                      {moment(el.startingDate).format('MM-DD-YYYY')}
                      <br />
                      <b>{`Duration: `}</b>
                      {` ${el.duration} ${Number(el.duration) > 1 ? 'weeks' : 'week'}`}
                      <br />
                      <b>{`Reason: `}</b>{el.reason}
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          <p>
            <em>Note</em>: Blue squares expire after 1 calendar year from their issuance date.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} style={boxStyle}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Dialog>
    </div>
  );
}

export default SchedulerExplanationModal;
