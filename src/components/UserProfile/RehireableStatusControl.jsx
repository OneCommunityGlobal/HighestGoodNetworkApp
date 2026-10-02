import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

function RehireableStatusControl({ isRehireable, notRehireableReason, darkMode, onConfirm }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingRehireableStatus, setPendingRehireableStatus] = useState(null);
  const [reason, setReason] = useState('');
  const hasReason = !isRehireable && Boolean(notRehireableReason);

  const handleChange = () => {
    const nextStatus = !isRehireable;
    setPendingRehireableStatus(nextStatus);
    setReason('');
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    onConfirm(pendingRehireableStatus, reason.trim());
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChange();
    }
  };

  return (
    <>
      <span className="mr-2">
        <i
          className={isRehireable ? 'fa fa-check-square-o' : 'fa fa-square-o'}
          role="button"
          tabIndex={0}
          aria-label={isRehireable ? 'Rehireable' : 'Not rehireable'}
          style={{
            fontSize: 24,
            cursor: 'pointer',
            marginTop: '6px',
            ...(hasReason ? { color: '#f08c00' } : {}),
          }}
          title={hasReason ? notRehireableReason : 'Click to change rehirable status'}
          onClick={handleChange}
          onKeyDown={handleKeyDown}
        />
      </span>
      <Modal
        isOpen={showConfirmDialog}
        toggle={() => setShowConfirmDialog(false)}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader
          toggle={() => setShowConfirmDialog(false)}
          className={darkMode ? 'bg-space-cadet' : ''}
        >
          Confirm Status Change
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {pendingRehireableStatus ? (
            'Are you sure you want to change the user status to Rehireable?'
          ) : (
            <>
              <p>
                You are about to change this user&apos;s status to &apos;not rehireable&apos;. Please
                enter the reason below.
              </p>
              <Label htmlFor="not-rehireable-reason">Reason (optional)</Label>
              <Input
                id="not-rehireable-reason"
                type="textarea"
                aria-label="Reason for not rehireable status"
                value={reason}
                onChange={event => setReason(event.target.value)}
              />
            </>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="primary" onClick={handleConfirm}>
            Confirm
          </Button>{' '}
          <Button color="secondary" onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

RehireableStatusControl.propTypes = {
  isRehireable: PropTypes.bool,
  notRehireableReason: PropTypes.string,
  darkMode: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
};

RehireableStatusControl.defaultProps = {
  isRehireable: true,
  notRehireableReason: '',
  darkMode: false,
};

export default RehireableStatusControl;