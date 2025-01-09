import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';
import { boxStyle, boxStyleDark } from 'styles';

function EditConfirmModal(props) {
  const { isOpen, closeModal, modalTitle, modalMessage, disabled, darkMode } = props;
  const toggle = () => {
    closeModal();
  };
  return (
    <Modal isOpen={isOpen} toggle={closeModal} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader
        toggle={disabled ? () => false : closeModal}
        className={darkMode ? 'bg-space-cadet' : ''}
      >
        {modalTitle}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{modalMessage}</ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button
          color="primary"
          onClick={toggle}
          style={darkMode ? boxStyleDark : boxStyle}
          disabled={disabled}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

EditConfirmModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  modalTitle: PropTypes.string.isRequired,
  modalMessage: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types, react/no-unused-prop-types
  userProfile: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default EditConfirmModal;
