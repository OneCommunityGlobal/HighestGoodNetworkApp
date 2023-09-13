import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle } from 'styles';

function DeleteBadgePopup(props) {
  const { open, setDeletePopup, deleteBadge, badgeId, badgeName } = props;

  const closePopup = () => {
    setDeletePopup(false);
  };

  const onDelete = () => {
    closePopup();
    deleteBadge(badgeId);
  };

  return (
    <Modal isOpen={open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Confirm Delete Badge</ModalHeader>
      <ModalBody>
        <div>
          <p>
            Hold up there Sparky, are you sure you want to delete this badge? Some things in life
            can be undone, deleting this badge isn&apos;t one of them.
          </p>
          <p style={{ color: '#285739', fontWeight: 'bold' }}>Badge Name: {badgeName}</p>
          <p>
            Consider your next move carefully. If you click &quot;delete&quot;, the badge above will
            be wiped from existence and removed from all who have earned it.
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={onDelete} style={boxStyle}>
          Delete
        </Button>{' '}
        <Button color="primary" onClick={closePopup} style={boxStyle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DeleteBadgePopup;
