import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap';

const DeleteBadgeModal = ({ isOpen, onCancel, onDelete, darkMode, boxStyle, boxStyleDark }) => {
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 992);

  useEffect(() => {
    const handleResize = () => setIsTablet(window.innerWidth <= 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const modalStyle = darkMode ? 'bg-yinmn-blue text-light' : '';
  const buttonStyle = darkMode ? boxStyleDark : boxStyle;

  return (
    <Modal
      isOpen={isOpen}
      centered
      className={`${modalStyle} ${isTablet ? 'p-3 text-center' : ''}`}
    >
      <ModalBody>
        <p style={{ fontSize: isTablet ? 16 : 18, marginBottom: 15 }}>
          Woah, easy tiger! Are you sure you want to delete this badge?
        </p>
      </ModalBody>
      <ModalFooter
        className={modalStyle}
        style={{
          flexDirection: isTablet ? 'column' : 'row',
          justifyContent: isTablet ? 'center' : 'flex-end',
          gap: isTablet ? '10px' : '0',
        }}
      >
        <Button onClick={onCancel} style={buttonStyle}>
          Cancel
        </Button>
        <Button color="danger" onClick={onDelete} style={buttonStyle}>
          Yes, Delete
        </Button>
      </ModalFooter>
    </Modal>
  );
};

DeleteBadgeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  boxStyle: PropTypes.object,
  boxStyleDark: PropTypes.object,
};

DeleteBadgeModal.defaultProps = {
  darkMode: false,
  boxStyle: {},
  boxStyleDark: {},
};

export default DeleteBadgeModal;
