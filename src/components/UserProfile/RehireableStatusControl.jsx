import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const formatHistoryDate = value => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
};

function RehireableStatusControl({
  isRehireable,
  notRehireableReason,
  notRehireableReasonHistory,
  darkMode,
  onConfirm,
  showLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('submit');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const hasReason =
    !isRehireable &&
    typeof notRehireableReason === 'string' &&
    notRehireableReason.trim().length > 0;

  const openControl = () => {
    setError('');
    setReason('');
    if (isRehireable) {
      setMode('submit');
    } else if (hasReason) {
      setMode('details');
    } else {
      // Older records may have a not-rehireable status without a saved reason.
      setMode('edit');
    }
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (mode === 'submit' || mode === 'edit') {
      const trimmedReason = reason.trim();
      if (!trimmedReason) {
        setError('A reason is required.');
        return;
      }
      const saved = await onConfirm(false, trimmedReason);
      if (saved === false) return;
    } else if (mode === 'confirmRehireable') {
      const saved = await onConfirm(true, '');
      if (saved === false) return;
    }
    setIsOpen(false);
  };

  const startEdit = () => {
    setReason(notRehireableReason || '');
    setError('');
    setMode('edit');
  };

  const startRehireableConfirmation = () => {
    setError('');
    setMode('confirmRehireable');
  };

  const title = {
    submit: 'Confirm Status Change',
    details: 'Not Rehireable Details',
    edit: 'Edit Not Rehireable Reason',
    confirmRehireable: 'Confirm Status Change',
  }[mode];

  return (
    <>
      <span className="mr-2">
        {showLabel && <span className="mr-1">Rehireable</span>}
        <button
          type="button"
          className="rehireable-status-control"
          aria-label={isRehireable ? 'Rehireable' : 'Not rehireable'}
          title={hasReason ? 'View reason and change history' : 'Change rehireable status'}
          onClick={openControl}
          style={{
            fontSize: 24,
            cursor: 'pointer',
            marginTop: '6px',
            padding: 0,
            lineHeight: 1,
            color: 'inherit',
            background: 'transparent',
            border: hasReason ? '2px solid #f08c00' : 'none',
            ...(hasReason
              ? {
                  display: 'inline-block',
                  width: '0.75em',
                  height: '0.75em',
                  boxSizing: 'border-box',
                  verticalAlign: '-0.08em',
                }
              : {}),
          }}
        >
          <i
            className={isRehireable ? 'fa fa-check-square-o' : hasReason ? '' : 'fa fa-square-o'}
            aria-hidden="true"
          />
        </button>
      </span>
      <Modal
        isOpen={isOpen}
        toggle={() => setIsOpen(false)}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader
          toggle={() => setIsOpen(false)}
          className={darkMode ? 'bg-space-cadet' : ''}
        >
          {title}
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          {mode === 'details' && (
            <>
              <p>
                <strong>Reason:</strong> {notRehireableReason}
              </p>
              <h6>Reason history</h6>
              {notRehireableReasonHistory.length > 0 ? (
                <ol className="pl-3">
                  {[...notRehireableReasonHistory].reverse().map((entry, index) => {
                    const actor = entry.changedBy || {};
                    const actorName = [actor.firstName, actor.lastName].filter(Boolean).join(' ');
                    const actionLabel = entry.action === 'edited' ? 'Reason edited by' : 'Reason submitted by';
                    return (
                      <li key={`${entry.changedAt || entry.date || index}-${index}`} className="mb-2">
                        <div>
                          <strong>{actionLabel}</strong> {actorName || 'Unknown user'}
                        </div>
                        {actor.username && <div>Username: {actor.username}</div>}
                        <div>{formatHistoryDate(entry.changedAt || entry.date)}</div>
                        <div>{entry.reason}</div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p>No change history is available for this saved reason.</p>
              )}
            </>
          )}
          {(mode === 'submit' || mode === 'edit') && (
            <>
              <p>
                {mode === 'edit'
                  ? 'Update the reason for this not-rehireable status.'
                  : "You are about to change this user's status to 'not rehireable'. Enter the required reason."}
              </p>
              <Label htmlFor="not-rehireable-reason">Reason (required)</Label>
              <Input
                id="not-rehireable-reason"
                type="textarea"
                aria-label="Reason for not rehireable status"
                aria-required="true"
                value={reason}
                onChange={event => {
                  setReason(event.target.value);
                  if (event.target.value.trim()) setError('');
                }}
              />
              {error && <div role="alert" className="text-danger mt-1">{error}</div>}
            </>
          )}
          {mode === 'confirmRehireable' &&
            'Are you sure you want to change the user status to Rehireable?'}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          {mode === 'details' ? (
            <>
              <Button color="primary" onClick={startEdit}>
                Edit reason
              </Button>{' '}
              <Button color="warning" onClick={startRehireableConfirmation}>
                Mark Rehireable
              </Button>{' '}
              <Button color="secondary" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button
                color="primary"
                onClick={handleConfirm}
                disabled={(mode === 'submit' || mode === 'edit') && !reason.trim()}
              >
                Confirm
              </Button>{' '}
              <Button color="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
}

RehireableStatusControl.propTypes = {
  isRehireable: PropTypes.bool,
  notRehireableReason: PropTypes.string,
  notRehireableReasonHistory: PropTypes.arrayOf(PropTypes.shape({
    action: PropTypes.string,
    reason: PropTypes.string,
    changedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    changedBy: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      username: PropTypes.string,
    }),
  })),
  darkMode: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  showLabel: PropTypes.bool,
};

RehireableStatusControl.defaultProps = {
  isRehireable: true,
  notRehireableReason: '',
  notRehireableReasonHistory: [],
  darkMode: false,
  showLabel: false,
};

export default RehireableStatusControl;
