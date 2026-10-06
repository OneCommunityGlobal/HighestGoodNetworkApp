import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

const ConfirmationModal = ({
  isOpen,
  toggle,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  showDontShowAgain = false,
  onDontShowAgainChange = null,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (showDontShowAgain && dontShowAgain && onDontShowAgainChange) {
      onDontShowAgainChange(true);
    }
    onConfirm();
    toggle();
    setDontShowAgain(false); // Reset for next time
  };

  const handleCancel = () => {
    toggle();
    setDontShowAgain(false); // Reset checkbox
  };

  return (
    <Modal isOpen={isOpen} toggle={handleCancel} centered>
      <ModalHeader toggle={handleCancel}>{title}</ModalHeader>
      <ModalBody>
        <p style={{ margin: 0, marginBottom: showDontShowAgain ? '1rem' : 0 }}>{message}</p>
        {showDontShowAgain && (
          <div style={{ marginTop: '1rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#666' }}>Don&apos;t show this again</span>
            </label>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button color={confirmColor} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;
