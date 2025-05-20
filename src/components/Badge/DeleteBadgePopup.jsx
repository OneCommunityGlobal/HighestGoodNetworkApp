import { useSelector } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import '../Header/DarkMode.css';

function DeleteBadgePopup({ open, setDeletePopup, deleteBadge, badgeId, badgeName }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const closePopup = () => {
    setDeletePopup(false);
  };

  const onDelete = () => {
    closePopup();
    deleteBadge(badgeId);
  };

  return (
    <Modal isOpen={open} toggle={closePopup} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        Confirm Delete Badge
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div>
          <p>
            Hold up there Sparky, are you sure you want to delete this badge? Some things in life
            can be undone, deleting this badge isn&apos;t one of them.
          </p>
          <p style={{ color: darkMode ? 'green' : '#285739', fontWeight: 'bold' }}>
            Badge Name: {badgeName}
          </p>
          <p>
            Consider your next move carefully. If you click &quot;delete&quot;, the badge above will
            be wiped from existence and removed from all who have earned it.
          </p>
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="danger" onClick={onDelete} style={darkMode ? boxStyleDark : boxStyle}>
          Delete
        </Button>{' '}
        <Button color="primary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default DeleteBadgePopup;
