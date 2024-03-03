import { Button, Container, Row, Col } from 'react-bootstrap';
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
    <>
        <Modal.Header closeButton>
          <Modal.Title>Please Refer To The Explanation </Modal.Title>
        </Modal.Header>
        <Modal.Body scrollable="true">
          <Container>
            <Row className='mb-3'>
              <Col>
                Including your time already requested off, you have used the equivalent of{' '}
                <span style={{ color: 'red', fontWeight: 500 }}>{infringementsNum}</span> blue
                squares and{' '}
                <span style={{ color: 'red', fontWeight: 500 }}>{timeOffRequests.length}</span>{' '}
                schedule time offs. <span style={{ fontWeight: 500, color: 'green' }}>5</span> is
                the maximum allowed per year of employment. Please remove a time-off request below
                or contact your Administrator if you need to request time off in addition to what is
                listed here:
              </Col>
            </Row>
            {infringements.length > 0 && (
              <Row>
                <Col>
                  <Row className='mb-2'>
                    <Col>
                      <h6>INFRINGEMENTS:</h6>
                    </Col>
                  </Row>
                  <Row className='infringements-explanation-modal-row ml-1' >
                    <Col>
                      <ol style={{paddingLeft: '20px'}}>
                        {infringements.map((el, index) => {
                          return (
                            <li key={el._id} className='Schedule-explanation-modal-list-marker'>
                              <ul style={{ listStyleType: 'disc' ,paddingLeft: '30px'}} >
                                <li>
                                  <b>{`Date: `}</b>
                                  {el.date}
                                </li>
                                <li>
                                  <b>{`Reason: `}</b>
                                  {el.description}
                                </li>
                              </ul>
                            </li>
                          );
                        })}
                      </ol>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
            {timeOffRequests.length > 0 && (
              <Row className='mt-3'>
                <Col>
                  <Row className='mb-2 '>
                    <Col>
                      <h6>SCHEDULED TIME OFF:</h6>
                    </Col>
                  </Row>
                  <Row className='scheduled-time-off-explanation-modal-row ml-1'>
                    <Col>
                      <ol style={{paddingLeft: '20px'}}>
                        {timeOffRequests.map((el, index) => {
                          return (
                            <li key={el._id} className='Schedule-explanation-modal-list-marker'>
                              <ul style={{ listStyleType: 'disc' ,paddingLeft: '30px'}}>
                                <li>
                                  <b>{`Date: `}</b>
                                  {moment(el.startingDate).format('MM-DD-YYYY')}
                                </li>
                                <li>
                                  <b>{`Duration: `}</b>
                                  {` ${el.duration} ${Number(el.duration) > 1 ? 'weeks' : 'week'}`}
                                </li>
                                <li>
                                  <b>{`Reason: `}</b>
                                  {el.reason}
                                </li>
                              </ul>
                            </li>
                          );
                        })}
                      </ol>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
            <Row className='mt-3'>
              <Col>
                <em>Note</em>: Blue squares expire after 1 calendar year from their issuance date.
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} style={boxStyle}>
            Close
          </Button>
        </Modal.Footer>
    </>
  );
}

export default SchedulerExplanationModal;
