import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Label } from 'reactstrap';
import styles from './StatusNoteSection.module.css';

export const STATUS_NOTE_MAX_LENGTH = 2000;

const formatHistoryDate = value => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString();
};

const getActorName = entry => {
  const actor = entry?.changedBy || {};
  return [actor.firstName, actor.lastName].filter(Boolean).join(' ') || 'Unknown user';
};

const ACTION_LABELS = {
  added: 'Note added by',
  edited: 'Note edited by',
  deleted: 'Note deleted by',
};

/**
 * Optional note shown in the status popup. Works like the Rehireable reason:
 * the current note, who last saved it, and the full change history.
 */
function StatusNoteSection({
  statusNote = '',
  statusNoteHistory = [],
  mode,
  draft,
  error = '',
  saving = false,
  darkMode = false,
  onDraftChange,
  onStartEdit,
  onCancel,
  onSave,
  onStartDelete,
  onConfirmDelete,
}) {
  const noteInputRef = useRef(null);

  // Put the cursor in the box as soon as the admin chooses to add or edit a note
  useEffect(() => {
    if (mode === 'edit') noteInputRef.current?.focus();
  }, [mode]);

  const hasNote = statusNote.trim().length > 0;
  const lastSaved = [...statusNoteHistory].reverse().find(entry => entry.action !== 'deleted');

  return (
    <section className={styles.statusNoteSection} aria-label="Note for this person">
      {mode === 'view' && hasNote && (
        <>
          <p className={styles.statusNoteText}>
            <strong>Note:</strong> {statusNote}
          </p>
          {lastSaved && (
            <p className={styles.statusNoteMeta}>
              {lastSaved.action === 'edited' ? 'Edited' : 'Added'} by {getActorName(lastSaved)} on{' '}
              {formatHistoryDate(lastSaved.changedAt)}
            </p>
          )}
          <div className={styles.statusNoteButtons}>
            <Button color="primary" size="sm" onClick={onStartEdit}>
              Edit note
            </Button>
            <Button color="danger" size="sm" outline={!darkMode} onClick={onStartDelete}>
              Delete note
            </Button>
          </div>
        </>
      )}

      {mode === 'view' && !hasNote && (
        <div className={styles.statusNoteButtons}>
          <Button color="primary" size="sm" outline={!darkMode} onClick={onStartEdit}>
            Add note for this person
          </Button>
        </div>
      )}

      {mode === 'edit' && (
        <>
          <Label htmlFor="status-note-input">
            {hasNote ? 'Edit the note (optional)' : 'Add a note for this person (optional)'}
          </Label>
          <Input
            id="status-note-input"
            type="textarea"
            rows={3}
            innerRef={noteInputRef}
            maxLength={STATUS_NOTE_MAX_LENGTH}
            className={darkMode ? styles.statusNoteInputDark : ''}
            value={draft}
            onChange={event => onDraftChange(event.target.value)}
          />
          <div className={styles.statusNoteCount}>
            {draft.length}/{STATUS_NOTE_MAX_LENGTH}
          </div>
          {error && (
            <div role="alert" className="text-danger">
              {error}
            </div>
          )}
          <div className={styles.statusNoteButtons}>
            <Button
              color="primary"
              size="sm"
              onClick={onSave}
              disabled={saving || draft.trim() === statusNote.trim() || (!hasNote && !draft.trim())}
            >
              Save note
            </Button>
            <Button color="secondary" size="sm" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </>
      )}

      {mode === 'confirmDelete' && (
        <>
          <p>Delete this note? It will stay in the note history.</p>
          {error && (
            <div role="alert" className="text-danger">
              {error}
            </div>
          )}
          <div className={styles.statusNoteButtons}>
            <Button color="danger" size="sm" onClick={onConfirmDelete} disabled={saving}>
              Yes, delete
            </Button>
            <Button color="secondary" size="sm" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </>
      )}

      {statusNoteHistory.length > 0 && (
        <details className={styles.statusNoteHistory}>
          <summary>Note history ({statusNoteHistory.length})</summary>
          <ol className={styles.statusNoteHistoryList}>
            {[...statusNoteHistory].reverse().map((entry, index) => (
              <li key={`${entry.changedAt || index}-${index}`}>
                <div>
                  <strong>{ACTION_LABELS[entry.action] || 'Note changed by'}</strong>{' '}
                  {getActorName(entry)}
                </div>
                <div>{formatHistoryDate(entry.changedAt)}</div>
                <div className={styles.statusNoteText}>{entry.note}</div>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

StatusNoteSection.propTypes = {
  statusNote: PropTypes.string,
  statusNoteHistory: PropTypes.arrayOf(
    PropTypes.shape({
      action: PropTypes.string,
      note: PropTypes.string,
      changedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      changedBy: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
      }),
    }),
  ),
  mode: PropTypes.oneOf(['view', 'edit', 'confirmDelete']).isRequired,
  draft: PropTypes.string.isRequired,
  error: PropTypes.string,
  saving: PropTypes.bool,
  darkMode: PropTypes.bool,
  onDraftChange: PropTypes.func.isRequired,
  onStartEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onStartDelete: PropTypes.func.isRequired,
  onConfirmDelete: PropTypes.func.isRequired,
};

export default StatusNoteSection;
