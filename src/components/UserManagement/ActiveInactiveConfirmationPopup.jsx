import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import '../Header/index.module.css';
import { InactiveReason } from '../../utils/enums.js';
import StatusNoteSection from './StatusNoteSection';

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
    statusNote = '',
    statusNoteHistory = [],
    onSaveStatusNote,
  } = props;

  const [noteMode, setNoteMode] = useState('view');
  const [noteDraft, setNoteDraft] = useState('');
  const [noteError, setNoteError] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // Start from the saved note each time the popup opens
  useEffect(() => {
    if (open) {
      setNoteMode('view');
      setNoteDraft('');
      setNoteError('');
      setNoteSaving(false);
    }
  }, [open]);

  const isScheduled =
    isActive &&
    !!endDate &&
    moment(endDate).isAfter(moment());

  const isPaused =
    !isActive &&
    inactiveReason === InactiveReason.PAUSED;

  const isSeparated =
    !isActive &&
    inactiveReason === InactiveReason.SEPARATED;

  const isInactive = !isActive;

  const saveNote = async note => {
    setNoteSaving(true);
    setNoteError('');
    try {
      const saved = await onSaveStatusNote(note);
      if (saved === false) {
        setNoteError('The note could not be saved. Please try again.');
        return false;
      }
      setNoteMode('view');
      setNoteDraft('');
      return true;
    } finally {
      setNoteSaving(false);
    }
  };

  const hasUnsavedNote =
    noteMode === 'edit' && noteDraft.trim() !== '' && noteDraft.trim() !== statusNote.trim();

  // A note typed before choosing a status action is saved first, so it isn't lost
  const runStatusAction = async action => {
    if (hasUnsavedNote && onSaveStatusNote) {
      const saved = await saveNote(noteDraft);
      if (!saved) return;
    }
    action();
    onClose();
  };

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

        {onSaveStatusNote && (
          <StatusNoteSection
            statusNote={statusNote || ''}
            statusNoteHistory={Array.isArray(statusNoteHistory) ? statusNoteHistory : []}
            mode={noteMode}
            draft={noteDraft}
            error={noteError}
            saving={noteSaving}
            darkMode={darkMode}
            onDraftChange={setNoteDraft}
            onStartEdit={() => {
              setNoteDraft(statusNote || '');
              setNoteError('');
              setNoteMode('edit');
            }}
            onCancel={() => {
              setNoteDraft('');
              setNoteError('');
              setNoteMode('view');
            }}
            onSave={() => saveNote(noteDraft)}
            onStartDelete={() => {
              setNoteError('');
              setNoteMode('confirmDelete');
            }}
            onConfirmDelete={() => saveNote('')}
          />
        )}
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        {/* Cancel scheduled final day */}
        {isScheduled && (
          <Button
            color="success"
            disabled={noteSaving}
            onClick={() => runStatusAction(onCancelScheduledDeactivation)}
          >
            Cancel Final Day
          </Button>
        )}

        {/* Immediate separation */}
        {isActive && (
          <Button
            color="danger"
            disabled={noteSaving}
            onClick={() => runStatusAction(onDeactivateImmediate)}
          >
            Deactivate Immediately
          </Button>
        )}

        {/* Schedule separation */}
        {isActive && !isScheduled && (
          <Button
            color="warning"
            disabled={noteSaving}
            onClick={() => runStatusAction(onScheduleFinalDay)}
          >
            Set Final Day
          </Button>
        )}

        {/* Reactivate (paused only) */}
        {isInactive && (
          <Button
            color="success"
            disabled={noteSaving}
            onClick={() => runStatusAction(onReactivateUser)}
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
