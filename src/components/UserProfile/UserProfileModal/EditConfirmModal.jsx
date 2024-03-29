import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { boxStyle } from 'styles';

const EditConfirmModal = props => {
  const { isOpen, closeModal, modalTitle, modalMessage, userProfile, disabled } = props;
  const history = useHistory();
  const toggle = () => {
    closeModal();
  };
  return (
    <React.Fragment>
      <Modal isOpen={isOpen} toggle={closeModal}>
        <ModalHeader toggle={disabled ? () => false : closeModal}>{modalTitle}</ModalHeader>
        <ModalBody>{modalMessage}</ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggle} style={boxStyle} disabled={disabled}>
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
  userProfile: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default EditConfirmModal;
