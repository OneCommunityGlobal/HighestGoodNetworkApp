import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';

const TeamStatusPopup = React.memo(props => {
  const closePopup = () => {
    props.onClose();
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Status Popup</ModalHeader>
      <ModalBody style={{ textAlign: 'center' }}>
        <span>{`Are you sure you want to change the status of this team ${props.selectedTeamName}`}</span>
        <br />
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          onClick={() => {
            props.onConfirmClick(
              props.selectedTeamName,
              props.selectedTeamId,
              !props.selectedStatus,
              props.selectedTeamCode,
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
export default TeamStatusPopup;
