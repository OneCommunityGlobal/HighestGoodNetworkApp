import React from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import '../Header/index.css';
import { InactiveReason } from '../../utils/enums';

const ActiveInactiveConfirmationPopup = React.memo((props) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const {
    open,
    onClose,
    fullName,
    isActive,
    endDate,
    inactiveReason,
    onDeactivateImmediate,
    onScheduleFinalDay,
    onCancelScheduledDeactivation,
    onReactivateUser,
  } = props;

  const isScheduled =
    isActive &&
    !!endDate &&
    moment(endDate).isAfter(moment());

  const isPaused =
    !isActive &&
    inactiveReason === InactiveReason.Paused;

  const isSeparated =
    !isActive &&
    inactiveReason === InactiveReason.Separated;

  const isInactive = !isActive;

  return (
    <Modal
      isOpen={open}
      toggle={onClose}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader
        className={darkMode ? 'bg-space-cadet' : ''}
        toggle={onClose}
      >
        Manage user status
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>
          What would you like to do for <strong>{fullName}</strong>?
        </p>

        {isScheduled && (
          <p className="text-warning">
            This user has a final day scheduled and will be deactivated automatically.
          </p>
        )}

        {isPaused && (
          <p className="text-info">
            This user is currently paused.
          </p>
        )}

        {isSeparated && (
          <p className="text-muted">
            This user is inactive.
          </p>
        )}
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        {/* Cancel scheduled final day */}
        {isScheduled && (
          <Button
            color="success"
            onClick={() => {
              onCancelScheduledDeactivation();
              onClose();
            }}
          >
            Cancel Final Day
          </Button>
        )}

        {/* Immediate separation */}
        {isActive && (
          <Button
            color="danger"
            onClick={() => {
              onDeactivateImmediate();
              onClose();
            }}
          >
            Deactivate Immediately
          </Button>
        )}

        {/* Schedule separation */}
        {isActive && !isScheduled && (
          <Button
            color="warning"
            onClick={() => {
              onScheduleFinalDay();
              onClose();
            }}
          >
            Set Final Day
          </Button>
        )}

        {/* Reactivate (paused only) */}
        {isInactive && (
          <Button
            color="success"
            onClick={() => {
              onReactivateUser();
              onClose();
            }}
          >
            Reactivate User
          </Button>
        )}


        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

ActiveInactiveConfirmationPopup.displayName =
  'ActiveInactiveConfirmationPopup';

export default ActiveInactiveConfirmationPopup;