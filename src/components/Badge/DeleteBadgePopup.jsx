import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const DeleteBadgePopup = props => {
  const closePopup = () => {
    props.setDeletePopup(false);
  };

  const onDelete = () => {
    closePopup();
    props.deleteBadge(props.badgeId);
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Confirm Delete Badge</ModalHeader>
      <ModalBody>
        <div>
          <p>
            Hold up there Sparky, are you sure you want to delete this badge? Some things in life
            can be undone, deleting this badge isn't one of them.
          </p>
          <p style={{ color: '#285739', fontWeight: 'bold' }}>Badge Name: {props.badgeName}</p>
          <p>
            Consider your next move carefully. If you click "delete", the badge above will be wiped
            from existence and removed from all who have earned it.
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onDelete}>
          Delete
        </Button>{' '}
        <Button color="primary" onClick={closePopup}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteBadgePopup;
