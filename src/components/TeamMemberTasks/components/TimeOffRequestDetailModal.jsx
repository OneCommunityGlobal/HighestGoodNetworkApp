import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import moment from 'moment';
import 'moment-timezone';

const TimeOffRequestDetailModal = ({ request, detailModalClose, detailModalIsOpen }) => {
  return (
    <Modal isOpen={detailModalIsOpen} toggle={() => detailModalClose()}>
      <ModalHeader toggle={() => detailModalClose()}>Time Off Details</ModalHeader>
      <ModalBody className="time-off-detail-modal">
        <h4 className="time-off-detail-modal-title">
          {request.onVacation
            ? `${request?.name} Is Not Available this Week`
            : `${request?.name} Is Not Available Next Week`}
        </h4>
        <div className="time-off-detail-modal-section">
          <h5 className="time-off-detail-modal-sub-heading">Starting from:</h5>
          <p className="time-off-detail-modal-sub-section">
            {moment(request?.startingDate).format('YYYY-MM-DD')}
          </p>
        </div>
        <div className="time-off-detail-modal-section">
          <h5 className="time-off-detail-modal-sub-heading">Until:</h5>
          <p className="time-off-detail-modal-sub-section">
            {moment(request?.endingDate).format('YYYY-MM-DD')}
          </p>
        </div>
        <div className="time-off-detail-modal-section">
          <h5 className="time-off-detail-modal-sub-heading">For The Following reason:</h5>
          <p className="time-off-detail-modal-sub-section">{request?.reason}</p>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default TimeOffRequestDetailModal;
