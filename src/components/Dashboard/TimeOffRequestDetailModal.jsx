import { Modal, ModalHeader, ModalBody } from 'reactstrap';
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
          <h4 className="time-off-detail-modal-title">
            {data?.onVacation
              ? `${data?.name} Is Not Available this Week`
              : `${data?.name} Is Not Available Next Week`}
          </h4>
          <div className="time-off-detail-modal-section">
            <h5 className="time-off-detail-modal-sub-heading">Starting from:</h5>
            <p className="time-off-detail-modal-sub-section">
              {moment(data?.startingDate).format('YYYY-MM-DD')}
            </p>
          </div>
          <div className="time-off-detail-modal-section">
            <h5 className="time-off-detail-modal-sub-heading">Until:</h5>
            <p className="time-off-detail-modal-sub-section">
              {moment(data?.endingDate).format('YYYY-MM-DD')}
            </p>
          </div>
          <div className="time-off-detail-modal-section">
            <h5 className="time-off-detail-modal-sub-heading">For The Following reason:</h5>
            <p className="time-off-detail-modal-sub-section">{data?.reason}</p>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default TimeOffRequestDetailModal;
