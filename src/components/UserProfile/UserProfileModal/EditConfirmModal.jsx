import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PropTypes from 'prop-types';
import { boxStyle, boxStyleDark } from '~/styles';

const EditConfirmModal = props => {
  const {
    isOpen,
    closeModal,
    modalTitle,
    modalMessage,
    disabled,
    darkMode,
    preserveScroll,
    finishScrollRestoration,
  } = props;
  const handleToggle = () => {
    if (!disabled) closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleToggle}
      keyboard={!disabled}
      backdrop={disabled ? 'static' : true}
      // Prevent nested profile modals from moving the parent scroll position.
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={false}
      returnFocusAfterClose={false}
      onOpened={preserveScroll}
      onClosed={finishScrollRestoration}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader toggle={handleToggle} className={darkMode ? 'bg-space-cadet' : ''}>
        {modalTitle}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{modalMessage}</ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button
          color="primary"
          onClick={handleToggle}
          style={darkMode ? boxStyleDark : boxStyle}
          disabled={disabled}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

EditConfirmModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  modalTitle: PropTypes.string.isRequired,
  modalMessage: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  preserveScroll: PropTypes.func,
  finishScrollRestoration: PropTypes.func,
};

export default EditConfirmModal;
