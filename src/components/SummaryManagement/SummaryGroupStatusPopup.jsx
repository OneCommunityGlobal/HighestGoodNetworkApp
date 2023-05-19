import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';

const SummaryGroupStatusPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Status Popup</ModalHeader>
      <ModalBody>
        <p>
          Are you sure you want to change the status of the “{props.selectedSummaryGroupName}”
          Summary Group ?
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={() => {
            props.onConfirmClick(
              props.selectedSummaryGroupName,
              props.selectedSummaryGroupId,
              !props.selectedStatus,
            );
          }}
        >
          Confirm
        </Button>
        <Button color="primary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default SummaryGroupStatusPopup;
