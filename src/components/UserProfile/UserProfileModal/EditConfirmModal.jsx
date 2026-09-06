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
  } = props;
  const toggle = () => {
    closeModal();
  };
  return (
    <React.Fragment>
      <Modal
        isOpen={isOpen}
        toggle={closeModal}
        // Prevent nested profile modals from moving the parent scroll position.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={false}
        returnFocusAfterClose={false}
        onOpened={preserveScroll}
        onClosed={preserveScroll}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader toggle={disabled ? () => false : closeModal} className={darkMode ? 'bg-space-cadet' : ''}>{modalTitle}</ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{modalMessage}</ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="primary" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle} disabled={disabled}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

EditConfirmModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  modalTitle: PropTypes.string.isRequired,
  modalMessage: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  preserveScroll: PropTypes.func,
};

export default EditConfirmModal;
