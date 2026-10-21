import { useState } from 'react';
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Button from 'react-bootstrap/Button';
import { ENDPOINTS } from '~/utils/URL';
import styles from './BulkLessonTags.module.css';

const baseUrl = `${ENDPOINTS.BM_LESSONS}/bulk-tags`;
const errorMessage = error =>
  error.response?.data?.error || 'Unable to complete this action. Try again.';
const isChanged = change => JSON.stringify(change.before) !== JSON.stringify(change.after);

export default function BulkLessonTags({
  filteredLessons,
  selectedIds,
  setSelectedIds,
  availableTags,
  darkMode,
  onRefresh,
}) {
  const [tags, setTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState(null);
  const [undoBatch, setUndoBatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selectable = filteredLessons;
  const selectedLessons = selectable.filter(lesson => selectedIds.includes(lesson._id));
  const allSelected =
    selectable.length > 0 && selectable.every(lesson => selectedIds.includes(lesson._id));
  const validTags = availableTags.filter(tag => tag.trim() && tag.length <= 10);
  const changedCount = preview?.changes.filter(isChanged).length || 0;

  const run = async action => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const refresh = async () => {
    try {
      await onRefresh();
    } catch (err) {
      setError('The change was saved, but refreshing failed. Reload the lesson list.');
    }
  };
  const showPreview = operation =>
    run(async () => {
      const request = { lessonIds: selectedIds, tags, operation };
      const response = await axios.post(`${baseUrl}/preview`, request);
      // Freeze the request alongside the server preview until confirmation.
      setPreview({ ...request, changes: response.data.changes });
    });
  const apply = () =>
    run(async () => {
      const { lessonIds, tags: previewTags, operation: previewOperation, changes } = preview;
      await axios.post(baseUrl, {
        lessonIds,
        tags: previewTags,
        operation: previewOperation,
        expected: changes.map(change => ({ lessonId: change.lessonId, tags: change.before })),
      });
      setPreview(null);
      setSelectedIds([]);
      setTags([]);
      setMessage(`Updated tags on ${changedCount} lesson(s).`);
      await refresh();
    });
  const showHistory = () =>
    run(async () => {
      const response = await axios.get(`${baseUrl}/history`);
      setHistory(response.data);
    });
  const undo = () =>
    run(async () => {
      await axios.post(`${baseUrl}/${undoBatch._id}/undo`);
      setUndoBatch(null);
      setSelectedIds([]);
      setMessage('Bulk tag change undone.');
      await refresh();
      try {
        const response = await axios.get(`${baseUrl}/history`);
        setHistory(response.data);
      } catch (err) {
        setHistory(null);
        setError('Undo was saved, but history could not be refreshed. Reopen history to retry.');
      }
    });
  const contentClass = `${styles.modalContent} ${darkMode ? styles.dark : ''}`;
  const feedback = error ? (
    <p role="alert" className={styles.error}>
      {error}
    </p>
  ) : null;
  const renderChanges = changes => (
    <ul className={styles.changes}>
      {changes.map(change => (
        <li key={change.lessonId}>
          <strong>{change.title}</strong>
          <div>Before: {change.before.join(', ') || 'No tags'}</div>
          <div>After: {change.after.join(', ') || 'No tags'}</div>
          {!isChanged(change) && <span>No change needed</span>}
        </li>
      ))}
    </ul>
  );

  return (
    <section
      className={`${styles.panel} ${darkMode ? styles.dark : ''}`}
      aria-label="Bulk tag management"
    >
      <h2 className={styles.heading}>Bulk tag management</h2>
      <div className={styles.controls}>
        <label>
          <input
            type="checkbox"
            checked={allSelected}
            disabled={busy || !selectable.length || selectable.length > 100}
            onChange={() => {
              setSelectedIds(allSelected ? [] : selectable.map(lesson => lesson._id));
              setPreview(null);
            }}
          />{' '}
          Select all filtered lessons
        </label>
        <span aria-live="polite">{selectedIds.length} selected (maximum 100)</span>
        <button
          type="button"
          disabled={busy || !selectedIds.length}
          onClick={() => setSelectedIds([])}
        >
          Clear selection
        </button>
      </div>
      {selectable.length > 100 && (
        <p>Use filters or individual checkboxes to select up to 100 lessons per batch.</p>
      )}
      <div className={styles.selectionField}>
        <h3 className={styles.fieldLabel}>Selected lessons ({selectedIds.length})</h3>
        {selectedLessons.length ? (
          <ul className={styles.chipList} aria-label="Selected lessons">
            {selectedLessons.map(lesson => (
              <li key={lesson._id} className={styles.selectionChip}>
                <span>{lesson.title}</span>
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Deselect lesson ${lesson.title}`}
                  disabled={busy}
                  onClick={() =>
                    setSelectedIds(previous => previous.filter(id => id !== lesson._id))
                  }
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptySelection}>
            Choose lessons using the checkboxes in the list below.
          </p>
        )}
      </div>
      <div className={styles.controls}>
        <details className={styles.tagPicker}>
          <summary>Choose tags ({tags.length}/20 selected)</summary>
          <input
            type="search"
            aria-label="Search bulk tags"
            placeholder="Search existing tags"
            value={tagSearch}
            onChange={event => setTagSearch(event.target.value)}
            disabled={busy}
          />
          <fieldset className={styles.tagOptions} disabled={busy}>
            <legend className={styles.heading}>Existing tags</legend>
            {validTags
              .filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()))
              .map(tag => (
                <label key={tag}>
                  <input
                    type="checkbox"
                    aria-label={`Tag ${tag}`}
                    checked={tags.includes(tag)}
                    disabled={!tags.includes(tag) && tags.length >= 20}
                    onChange={() => {
                      setTags(previous =>
                        previous.includes(tag)
                          ? previous.filter(value => value !== tag)
                          : [...previous, tag],
                      );
                      setPreview(null);
                    }}
                  />{' '}
                  {tag}
                </label>
              ))}
            {!validTags.length && <p>No existing tags available.</p>}
          </fieldset>
        </details>
      </div>
      {tags.length > 0 && (
        <div className={styles.selectionField}>
          <h3 className={styles.fieldLabel}>Selected tags ({tags.length})</h3>
          <ul className={styles.chipList} aria-label="Selected tags">
            {tags.map(tag => (
              <li key={tag} className={styles.selectionChip}>
                <span>#{tag}</span>
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Deselect tag ${tag}`}
                  disabled={busy}
                  onClick={() => setTags(previous => previous.filter(value => value !== tag))}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p>Choose lessons and tags, then use an action below to preview the changes before saving.</p>
      <div className={styles.controls}>
        <Button
          type="button"
          variant="success"
          className={styles.addAction}
          disabled={busy || !selectedIds.length || !tags.length || tags.length > 20}
          onClick={() => showPreview('add')}
        >
          Add selected tags
        </Button>
        <Button
          type="button"
          variant="danger"
          className={styles.removeAction}
          disabled={busy || !selectedIds.length || !tags.length || tags.length > 20}
          onClick={() => showPreview('remove')}
        >
          Remove selected tags
        </Button>
        <button type="button" disabled={busy} onClick={showHistory}>
          Tag change history
        </button>
      </div>
      <p>Each action applies the selected tags to all {selectedIds.length} selected lesson(s).</p>
      <p>
        Removing tags here affects selected lessons only. Global tag deletion is a separate action.
      </p>
      {!preview && !history && feedback}
      {message && <p role="status">{message}</p>}
      {busy && <p role="status">Working…</p>}

      <Modal
        isOpen={Boolean(preview)}
        toggle={() => {
          if (!busy) setPreview(null);
        }}
        contentClassName={contentClass}
        labelledBy="bulk-tag-preview-title"
      >
        <ModalHeader id="bulk-tag-preview-title" toggle={busy ? undefined : () => setPreview(null)}>
          Confirm bulk tag changes
        </ModalHeader>
        <ModalBody>
          {preview && (
            <>
              <h3 className={styles.fieldLabel}>
                {preview.operation === 'add' ? 'Tags to add' : 'Tags to remove'}
              </h3>
              <ul className={styles.chipList} aria-label="Tags in this preview">
                {preview.tags.map(tag => (
                  <li key={tag} className={styles.selectionChip}>
                    #{tag}
                  </li>
                ))}
              </ul>
              <p>
                {preview.changes.length} selected; {changedCount} will change.
              </p>
              <h3 className={styles.fieldLabel}>Selected lessons and tag changes</h3>
              {renderChanges(preview.changes)}
            </>
          )}
          {feedback}
        </ModalBody>
        <ModalFooter>
          <button type="button" disabled={busy} onClick={() => setPreview(null)}>
            Cancel
          </button>
          <Button
            type="button"
            variant={preview?.operation === 'remove' ? 'danger' : 'success'}
            className={preview?.operation === 'remove' ? styles.removeAction : styles.addAction}
            disabled={busy || !changedCount}
            onClick={apply}
          >
            {preview?.operation === 'remove' ? 'Confirm removing tags' : 'Confirm adding tags'}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={Boolean(history)}
        toggle={() => {
          if (!busy) {
            setHistory(null);
            setUndoBatch(null);
          }
        }}
        contentClassName={contentClass}
        labelledBy="bulk-tag-history-title"
      >
        <ModalHeader
          id="bulk-tag-history-title"
          toggle={
            busy
              ? undefined
              : () => {
                  setHistory(null);
                  setUndoBatch(null);
                }
          }
        >
          Tag change history
        </ModalHeader>
        <ModalBody>
          <p>
            Most recent 25 batches. You can undo your own changes; administrators can manage all
            batches.
          </p>
          {history?.length === 0 && <p>No bulk tag changes yet.</p>}
          {history?.map(batch => (
            <article key={batch._id} className={styles.historyEntry}>
              <strong>
                {batch.operation === 'add' ? 'Added' : 'Removed'} {batch.tags.join(', ')}
              </strong>
              <div>
                {new Date(batch.createdAt).toLocaleString()} · User: {batch.actor}
              </div>
              <details>
                <summary>{batch.changes.length} affected lesson(s)</summary>
                {renderChanges(batch.changes)}
              </details>
              {batch.undoneAt ? (
                <p>
                  Undone {new Date(batch.undoneAt).toLocaleString()} by {batch.undoneBy}
                </p>
              ) : (
                <button type="button" disabled={busy} onClick={() => setUndoBatch(batch)}>
                  Undo this batch
                </button>
              )}
            </article>
          ))}
          {undoBatch && (
            <div className={styles.historyEntry}>
              <p>
                Undo changes to these {undoBatch.changes.length} lessons? This restores their
                previous tags. If any tags have changed since, the entire undo will be cancelled.
              </p>
              {renderChanges(undoBatch.changes)}
              <button type="button" disabled={busy} onClick={undo}>
                Confirm undo
              </button>{' '}
              <button type="button" disabled={busy} onClick={() => setUndoBatch(null)}>
                Cancel undo
              </button>
            </div>
          )}
          {feedback}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setHistory(null);
              setUndoBatch(null);
            }}
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
    </section>
  );
}
