import { useId, useState } from 'react';
import axios from 'axios';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Button from 'react-bootstrap/Button';
import { ENDPOINTS } from '~/utils/URL';
import styles from './BulkLessonTags.module.css';
import tagStyles from './LessonListForm.module.css';
import { formatLessonTag } from './lessonTagDisplay';
import { canEditLesson } from './lessonEditPermissions';

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
  currentUser,
}) {
  const [tags, setTags] = useState([]);
  const [lessonSearch, setLessonSearch] = useState('');
  const [showLessonOptions, setShowLessonOptions] = useState(false);
  const lessonSearchId = useId();
  const [tagSearch, setTagSearch] = useState('');
  const [showTagOptions, setShowTagOptions] = useState(false);
  const tagSearchId = useId();
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState(null);
  const [undoBatch, setUndoBatch] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selectable = filteredLessons.filter(lesson => canEditLesson(lesson, currentUser));
  const selectedLessons = selectable.filter(lesson => selectedIds.includes(lesson._id));
  const matchingLessons = filteredLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearch.trim().toLowerCase()),
  );
  const titleCounts = filteredLessons.reduce((counts, lesson) => {
    counts[lesson.title] = (counts[lesson.title] || 0) + 1;
    return counts;
  }, Object.create(null));
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
          <div>Before: {change.before.map(formatLessonTag).join(', ') || 'No tags'}</div>
          <div>After: {change.after.map(formatLessonTag).join(', ') || 'No tags'}</div>
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
      <div className={styles.sectionHeader}>
        <h2 className={styles.heading}>Bulk tag management</h2>
        <button type="button" className={styles.historyLink} disabled={busy} onClick={showHistory}>
          View history
        </button>
      </div>
      <div className={styles.selectionGrid}>
        <div className={styles.lessonColumn}>
          <div className={styles.controls}>
            <div
              className={styles.tagPicker}
              onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setShowLessonOptions(false);
              }}
            >
              <label htmlFor={lessonSearchId} className={styles.fieldLabel}>
                Search lessons
              </label>
              <input
                id={lessonSearchId}
                type="search"
                placeholder="Search by lesson title"
                value={lessonSearch}
                disabled={busy}
                onFocus={() => setShowLessonOptions(true)}
                onChange={event => {
                  setLessonSearch(event.target.value);
                  setShowLessonOptions(true);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') event.preventDefault();
                  if (event.key === 'Escape') setShowLessonOptions(false);
                }}
              />
              {showLessonOptions && (
                <fieldset className={styles.tagOptions} disabled={busy}>
                  <legend className={styles.heading}>Matching lessons</legend>
                  {matchingLessons.map(lesson => (
                    <label key={lesson._id} className={styles.lessonOption}>
                      <input
                        type="checkbox"
                        aria-label={`Select lesson ${lesson.title} from search`}
                        checked={selectedIds.includes(lesson._id)}
                        title={
                          canEditLesson(lesson, currentUser)
                            ? undefined
                            : 'Only the author, an Admin, or an Owner can edit this lesson.'
                        }
                        disabled={
                          !canEditLesson(lesson, currentUser) ||
                          (!selectedIds.includes(lesson._id) && selectedIds.length >= 100)
                        }
                        onChange={() => {
                          if (busy || !canEditLesson(lesson, currentUser)) return;
                          setSelectedIds(previous => {
                            if (previous.includes(lesson._id))
                              return previous.filter(id => id !== lesson._id);
                            return previous.length < 100 ? [...previous, lesson._id] : previous;
                          });
                          setPreview(null);
                        }}
                      />
                      <span className={styles.lessonChipText}>
                        <span>{lesson.title}</span>
                        {titleCounts[lesson.title] > 1 && (
                          <small>
                            {lesson.tags?.length
                              ? lesson.tags.map(formatLessonTag).join(', ')
                              : 'No tags'}
                          </small>
                        )}
                      </span>
                    </label>
                  ))}
                  {!matchingLessons.length && (
                    <p>No matching lessons in the current filtered list.</p>
                  )}
                </fieldset>
              )}
            </div>
          </div>
          {selectedLessons.length > 0 && (
            <div className={styles.selectionField}>
              <h3 className={styles.fieldLabel}>Selected lessons ({selectedIds.length})</h3>
              <ul className={styles.chipList} aria-label="Selected lessons">
                {selectedLessons.map(lesson => (
                  <li
                    key={lesson._id}
                    className={`${tagStyles.tag} ${darkMode ? tagStyles.tagDark : ''} ${
                      styles.selectionChip
                    }`}
                  >
                    <span className={styles.lessonChipText}>
                      <span>{lesson.title}</span>
                      {titleCounts[lesson.title] > 1 && (
                        <small>
                          {lesson.tags?.length
                            ? lesson.tags.map(formatLessonTag).join(', ')
                            : 'No tags'}
                        </small>
                      )}
                    </span>
                    <button
                      type="button"
                      className={`${tagStyles.buttonClose} ${
                        darkMode ? tagStyles.buttonCloseDark : ''
                      } ${styles.chipRemove}`}
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
            </div>
          )}
        </div>
        <div className={styles.tagColumn}>
          <div className={styles.controls}>
            <div
              className={styles.tagPicker}
              onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setShowTagOptions(false);
              }}
            >
              <label htmlFor={tagSearchId} className={styles.fieldLabel}>
                Search existing tags
              </label>
              <input
                id={tagSearchId}
                type="search"
                placeholder="Search existing tags"
                value={tagSearch}
                onFocus={() => setShowTagOptions(true)}
                onChange={event => {
                  setTagSearch(event.target.value);
                  setShowTagOptions(true);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') event.preventDefault();
                }}
                disabled={busy}
              />
              {showTagOptions && (
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
                        {formatLessonTag(tag)}
                      </label>
                    ))}
                  {!validTags.length && <p>No existing tags available.</p>}
                  {validTags.length > 0 &&
                    !validTags.some(tag => tag.toLowerCase().includes(tagSearch.toLowerCase())) && (
                      <p>No matching tags.</p>
                    )}
                </fieldset>
              )}
            </div>
          </div>
          {tags.length > 0 && (
            <div className={styles.selectionField}>
              <h3 className={styles.fieldLabel}>Selected tags ({tags.length})</h3>
              <ul className={styles.chipList} aria-label="Selected tags">
                {tags.map(tag => (
                  <li
                    key={tag}
                    className={`${tagStyles.tag} ${darkMode ? tagStyles.tagDark : ''} ${
                      styles.selectionChip
                    }`}
                  >
                    <span title={tag}>{formatLessonTag(tag)}</span>
                    <button
                      type="button"
                      className={`${tagStyles.buttonClose} ${
                        darkMode ? tagStyles.buttonCloseDark : ''
                      } ${styles.chipRemove}`}
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
        </div>
      </div>
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
          Select all editable lessons
        </label>
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
      </div>
      <p className={styles.actionHint}>
        Changes affect only selected lessons. Preview before saving.
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
                  <li
                    key={tag}
                    className={`${tagStyles.tag} ${darkMode ? tagStyles.tagDark : ''} ${
                      styles.selectionChip
                    }`}
                  >
                    {formatLessonTag(tag)}
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
                {batch.operation === 'add' ? 'Added' : 'Removed'}{' '}
                {batch.tags.map(formatLessonTag).join(', ')}
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
