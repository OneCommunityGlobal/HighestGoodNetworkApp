import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  allocationMinutes,
  formatSplitMinutes,
  readSplitDraft,
  splitDraftKey,
  splitValidation,
} from './splitTimeEntryUtils';
import styles from './SplitTimeEntryForm.module.css';

const emptyRow = () => ({
  id: crypto.randomUUID(),
  taskId: '',
  hours: '0',
  minutes: '0',
  notes: '',
});

async function requestReceipt(payload) {
  try {
    return await axios.post(ENDPOINTS.TIME_ENTRY_SPLIT(), payload);
  } catch (error_) {
    if (error_.response?.status !== 409) throw error_;
    // Another tab may already have saved this server-issued timer session.
    return axios.get(ENDPOINTS.TIME_ENTRY_SPLIT_RECEIPT(payload.batchId));
  }
}

function submitLabel(busy, saved, locked, count) {
  if (busy) return 'Saving…';
  if (saved) return 'Finish timer';
  if (locked) return 'Retry split save';
  return `Submit ${count} time entries`;
}

export default function SplitTimeEntryForm({
  personId,
  batchId,
  dateOfWork,
  totalMinutes,
  tasks,
  loading,
  connected,
  darkMode,
  onComplete,
  onLockChange,
}) {
  const [draft, setDraft] = useState(() => {
    const saved = readSplitDraft(personId);
    if (saved && (saved.attempted || saved.payload.batchId === batchId)) return saved;
    return {
      payload: { personId, batchId, dateOfWork, totalMinutes },
      rows: [emptyRow(), emptyRow()],
      attempted: false,
      saved: false,
    };
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const locked = draft.attempted;
  const activeTasks = tasks.filter(task => task.isActive !== false && task.deleted !== true);
  const allocated = draft.rows.reduce((sum, row) => sum + (allocationMinutes(row) || 0), 0);
  const remaining = draft.payload.totalMinutes - allocated;
  const validation = splitValidation(
    draft.rows,
    draft.payload.totalMinutes,
    activeTasks.map(task => task._id),
  );

  const persist = next => {
    localStorage.setItem(splitDraftKey(personId), JSON.stringify(next));
    setDraft(next);
  };
  const updateDraft = next => {
    try {
      persist(next);
      setError('');
    } catch {
      setDraft(next);
      setError(
        'Your browser could not keep a recovery copy. Allow site storage before saving a split.',
      );
    }
  };
  const change = (id, field, value) => {
    const next = {
      ...draft,
      rows: draft.rows.map(row => (row.id === id ? { ...row, [field]: value } : row)),
    };
    updateDraft(next);
  };
  const applyReceipt = (receipt, current) => ({
    ...current,
    saved: true,
    receipt,
    payload: {
      ...current.payload,
      dateOfWork: receipt.dateOfWork,
      totalMinutes: receipt.totalMinutes,
    },
    rows: receipt.allocations.map((row, index) => ({
      id: String(index),
      taskId: String(row.taskId),
      hours: String(Math.floor(row.minutes / 60)),
      minutes: String(row.minutes % 60),
      notes: row.notes,
    })),
  });

  const submit = async () => {
    if (inFlight.current || !connected || (!locked && (loading || validation))) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    let current = draft;
    try {
      if (!current.attempted) {
        current = {
          ...current,
          attempted: true,
          payload: {
            ...current.payload,
            allocations: current.rows.map(row => ({
              taskId: row.taskId,
              minutes: allocationMinutes(row),
              notes: row.notes,
            })),
          },
        };
        // Keep the exact submitted body before sending; retries cannot change it.
        persist(current);
        onLockChange(true);
      }
      if (!current.saved) {
        const response = await requestReceipt(current.payload);
        current = applyReceipt(response.data, current);
        persist(current);
      }
      const complete = await onComplete(current.receipt, current.payload);
      if (!complete)
        throw new Error(
          'Time is saved, but the timer stop is not confirmed. Choose Finish timer to retry without adding time.',
        );
      try {
        localStorage.removeItem(splitDraftKey(personId));
      } catch {
        /* The server receipt still prevents duplicates. */
      }
      onLockChange(false);
    } catch (error_) {
      if (!current.saved && [400, 403, 404].includes(error_.response?.status)) {
        current = { ...current, attempted: false };
        try {
          persist(current);
        } catch {
          setDraft(current);
        }
        onLockChange(false);
      }
      setError(
        error_.response?.data?.error ||
          error_.message ||
          'Could not confirm the save. Your allocations are kept; retry this split.',
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <section
      className={`${styles.split} ${darkMode ? styles.dark : ''}`}
      aria-label="Split timer session"
    >
      <p>
        Divide this session between your assigned tasks. Each task needs its own work description
        and reference link.
      </p>
      <p>
        Session date: <strong>{draft.payload.dateOfWork}</strong>
      </p>
      <dl className={styles.totals} aria-live="polite">
        <div>
          <dt>Session total</dt>
          <dd>{formatSplitMinutes(draft.payload.totalMinutes)}</dd>
        </div>
        <div>
          <dt>Allocated</dt>
          <dd>{formatSplitMinutes(allocated)}</dd>
        </div>
        <div>
          <dt>{remaining < 0 ? 'Over allocated' : 'Remaining'}</dt>
          <dd>{formatSplitMinutes(remaining)}</dd>
        </div>
      </dl>
      {locked && (
        <output className={styles.status}>
          {draft.saved
            ? 'These entries are already saved. Finish the timer to complete.'
            : 'Confirming this split. Your original allocations are kept for a safe retry.'}
        </output>
      )}
      <fieldset disabled={busy || locked || loading} className={styles.rows}>
        <legend className={styles.legend}>Task allocations</legend>
        {draft.rows.map((row, index) => (
          <div key={row.id} className={styles.row}>
            <label htmlFor={`split-task-${row.id}`}>Task {index + 1}</label>
            <select
              id={`split-task-${row.id}`}
              value={row.taskId}
              onChange={event => change(row.id, 'taskId', event.target.value)}
            >
              <option value="">Select an assigned task</option>
              {locked && row.taskId && !activeTasks.some(task => task._id === row.taskId) && (
                <option value={row.taskId}>Previously selected task</option>
              )}
              {activeTasks.map(task => (
                <option
                  key={task._id}
                  value={task._id}
                  disabled={draft.rows.some(
                    other => other.id !== row.id && other.taskId === task._id,
                  )}
                >
                  {task.taskName}
                </option>
              ))}
            </select>
            <div className={styles.time}>
              <label htmlFor={`split-hours-${row.id}`}>
                Hours{' '}
                <input
                  id={`split-hours-${row.id}`}
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  value={row.hours}
                  onChange={event => change(row.id, 'hours', event.target.value)}
                />
              </label>
              <label htmlFor={`split-minutes-${row.id}`}>
                Minutes{' '}
                <input
                  id={`split-minutes-${row.id}`}
                  type="number"
                  min="0"
                  max="59"
                  step="1"
                  value={row.minutes}
                  onChange={event => change(row.id, 'minutes', event.target.value)}
                />
              </label>
            </div>
            <label htmlFor={`split-notes-${row.id}`}>Work description and reference link</label>
            <textarea
              id={`split-notes-${row.id}`}
              rows="3"
              maxLength="10000"
              value={row.notes}
              onChange={event => change(row.id, 'notes', event.target.value)}
              placeholder="At least 10 words and an https reference link"
            />
            <button
              type="button"
              disabled={draft.rows.length <= 2}
              onClick={() =>
                updateDraft({ ...draft, rows: draft.rows.filter(other => other.id !== row.id) })
              }
            >
              Remove task {index + 1}
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={draft.rows.length >= 20 || draft.rows.length >= activeTasks.length}
          onClick={() => updateDraft({ ...draft, rows: [...draft.rows, emptyRow()] })}
        >
          Add another task
        </button>
      </fieldset>
      {loading && <output className={styles.status}>Loading assigned tasks…</output>}
      {!locked && validation && <p>{validation}</p>}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {!connected && <p role="alert">Reconnect the timer before saving or finishing this split.</p>}
      <button
        type="button"
        className={styles.submit}
        disabled={busy || !connected || (!locked && (loading || Boolean(validation)))}
        onClick={submit}
      >
        {submitLabel(busy, draft.saved, locked, draft.rows.length)}
      </button>
    </section>
  );
}

SplitTimeEntryForm.propTypes = {
  personId: PropTypes.string.isRequired,
  batchId: PropTypes.string.isRequired,
  dateOfWork: PropTypes.string.isRequired,
  totalMinutes: PropTypes.number.isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({ _id: PropTypes.string.isRequired, taskName: PropTypes.string.isRequired }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
  darkMode: PropTypes.bool,
  onComplete: PropTypes.func.isRequired,
  onLockChange: PropTypes.func.isRequired,
};
