import React from 'react';
import {
  Button, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';

const DeleteBadgePopup = (props) => {
  const closePopup = () => {
    props.setDeletePopup(false);
  }

  const onDelete = () => {
    closePopup();
    props.deleteBadge(props.badgeId);
  }

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Confirm Delete Badge</ModalHeader>
      <ModalBody>
        <div>
          <p>Are you sure you want to delete this badge? The delete action cannot be undone!</p>
          <p style={{ color: '#285739', fontWeight: 'bold' }}>Badge Name: {props.badgeName}</p>
          <p>The badge above will be removed from the badge collection of those who have earned this badge, once you delete the badge.</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onDelete}>Delete</Button>{' '}
        <Button color="primary" onClick={closePopup}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};



export default DeleteBadgePopup;