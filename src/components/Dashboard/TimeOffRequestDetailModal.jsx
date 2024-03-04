import { Modal, ModalHeader, ModalBody, Row, Col } from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';
import { useSelector, useDispatch } from 'react-redux';
import { hideTimeOffRequestModal } from '../../actions/timeOffRequestAction';

const TimeOffRequestDetailModal = () => {
  const { isOpen, data } = useSelector(state => state.timeOffRequests.timeOffModal);
  const dispatch = useDispatch();
  const detailModalClose = () => {
    dispatch(hideTimeOffRequestModal());
  };

  return (
    <div>
      <Modal isOpen={isOpen} toggle={() => detailModalClose()} returnFocusAfterClose={true}>
        <ModalHeader toggle={() => detailModalClose()}>Time Off Details</ModalHeader>
        <ModalBody className="time-off-detail-modal">
          <Row>
            <Col>
              <p className="time-off-detail-modal-title">
                {data?.onVacation
                  ? `${data?.name} Is Not Available this Week`
                  : `${data?.name} Is Not Available Next Week`}
              </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>
                {data?.onVacation
                  ? `${data?.name} Is on vacation:`
                  : `${data?.name} Is going on vacation:`}
              </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <p className="time-off-detail-modal-sub-heading">From:</p>
              <p className="time-off-detail-modal-sub-section">
                {moment(data?.startingDate).format('YYYY-MM-DD')}
              </p>
            </Col>
          </Row>
          {/* <div className="time-off-detail-modal-section">
            
          </div> */}
          <Row>
            <Col>
              <p className="time-off-detail-modal-sub-heading">To:</p>
              <p className="time-off-detail-modal-sub-section">
                {moment(data?.endingDate).format('YYYY-MM-DD')}
              </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <p className="time-off-detail-modal-sub-heading">For The Following reason:</p>
              <p className="time-off-detail-modal-sub-section">{data?.reason}</p>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default TimeOffRequestDetailModal;
