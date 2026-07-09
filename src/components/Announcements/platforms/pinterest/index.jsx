import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import pStyles from './Pinterest.module.css';
import {
  PIN_TITLE_MIN,
  PIN_TITLE_MAX,
  PIN_DESC_MAX,
  PIN_NOTE_MAX,
  sanitizeBoardName,
  buildPinPreview,
  formatPinDate,
  formatPinTime,
  formatPinDisplayDateTime,
  clampPinScheduleDateTime,
  extractTagSuggestions,
  pinTopCardActions,
  pinButtonStyle,
  pinFieldRow,
  savePinToBackend,
  fetchSavedPins,
  deletePinFromBackend,
  publishPinNow,
} from './PinterestHelpers';

// ─── PinDateField ─────────────────────────────────────────────────────────────

function PinDateField({
  fieldId,
  inputType,
  labelText,
  fieldValue,
  minValue,
  onFieldChange,
  triedSaving,
  validationMsg,
}) {
  const hasError = triedSaving && !fieldValue;
  return (
    <div className={pStyles['pin-scheduler__field']}>
      <label htmlFor={fieldId}>
        {labelText} <span className={pStyles['pin-field__required']}>*</span>
      </label>
      <input
        id={fieldId}
        type={inputType}
        value={fieldValue}
        min={minValue}
        onChange={onFieldChange}
        className={classNames(pStyles['pin-field__input'], {
          [pStyles['pin-field__input--invalid']]: hasError,
        })}
        aria-invalid={hasError}
      />
      {hasError && <p className={pStyles['pin-field__error']}>{validationMsg}</p>}
    </div>
  );
}

PinDateField.propTypes = {
  fieldId: PropTypes.string.isRequired,
  inputType: PropTypes.string.isRequired,
  labelText: PropTypes.string.isRequired,
  fieldValue: PropTypes.string.isRequired,
  minValue: PropTypes.string.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  triedSaving: PropTypes.bool.isRequired,
  validationMsg: PropTypes.string.isRequired,
};

// ─── PinComposePane ───────────────────────────────────────────────────────────

function PinComposePane({ composeProps }) {
  const {
    isDark,
    pinTitle,
    setPinTitle,
    destinationLink,
    setDestinationLink,
    boardName,
    setBoardName,
    pinTag,
    setPinTag,
    pinDescription,
    setPinDescription,
    altCaption,
    setAltCaption,
    imageUrl,
    setImageUrl,
    tagSuggestions,
    cleanTitle,
    cleanLink,
    cleanBoard,
    cleanDesc,
    cleanTag,
    cleanAlt,
    cleanImage,
    warnTitle,
    warnLink,
    warnBoard,
    warnDesc,
    warnAlt,
    warnImage,
    canCopyDraft,
    canPublish,
    isSyncing,
    pinPreview,
    handleClearCompose,
    handleMoveToQueue,
    handlePublishNow,
    handleSuggestTags,
    handleClearTag,
    copyToClipboard,
    openPinterestCreate,
  } = composeProps;

  return (
    <>
      <section className={pStyles['pin-card']}>
        <h3>Pinterest Pin Composer</h3>
        <p>Build your Pinterest pin content, then schedule it or publish it directly.</p>
        <div style={pinTopCardActions()}>
          <button
            type="button"
            style={pinButtonStyle('outline', isDark)}
            onClick={handleClearCompose}
          >
            Clear fields
          </button>
        </div>
      </section>

      <div className={pStyles['pin-grid']}>
        {/* Board */}
        <div className={classNames(pStyles['pin-card'], { [pStyles.invalid]: warnBoard })}>
          <div className={pStyles['pin-field__header']}>
            <label htmlFor="pin-board">Board *</label>
            <span
              className={classNames(pStyles['pin-field__meta'], { [pStyles.invalid]: warnBoard })}
            >
              {cleanBoard.length}/50
            </span>
          </div>
          <input
            id="pin-board"
            type="text"
            value={boardName}
            onChange={e => setBoardName(sanitizeBoardName(e.target.value))}
            className={classNames(pStyles['pin-field__input'], {
              [pStyles['pin-field__input--invalid']]: warnBoard,
            })}
            placeholder="e.g. Home Decor Ideas"
            maxLength={50}
          />
          {!cleanBoard && (
            <p className={pStyles['pin-field__hint']}>Enter the board name to post this pin to.</p>
          )}
          {warnBoard && (
            <p className={pStyles['pin-field__error']}>
              Board name is required (up to 50 characters).
            </p>
          )}
          <div style={pinFieldRow}>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => copyToClipboard(boardName, 'Board name')}
            >
              Copy board name
            </button>
          </div>
        </div>

        {/* Title */}
        <div className={classNames(pStyles['pin-card'], { [pStyles.invalid]: warnTitle })}>
          <div className={pStyles['pin-field__header']}>
            <label htmlFor="pin-title">Title *</label>
            <span
              className={classNames(pStyles['pin-field__meta'], { [pStyles.invalid]: warnTitle })}
            >
              {cleanTitle.length}/{PIN_TITLE_MAX}
            </span>
          </div>
          <input
            id="pin-title"
            type="text"
            value={pinTitle}
            onChange={e => setPinTitle(e.target.value)}
            className={classNames(pStyles['pin-field__input'], {
              [pStyles['pin-field__input--invalid']]: warnTitle,
            })}
            placeholder="e.g. 10 minimalist bedroom ideas for small spaces"
            maxLength={PIN_TITLE_MAX}
          />
          {!cleanTitle && (
            <p className={pStyles['pin-field__hint']}>
              Keep titles descriptive. Pinterest allows up to {PIN_TITLE_MAX} characters.
            </p>
          )}
          {warnTitle && (
            <p className={pStyles['pin-field__error']}>
              Title must be at least {PIN_TITLE_MIN} characters.
            </p>
          )}
          <div style={pinFieldRow}>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => copyToClipboard(pinTitle, 'Title')}
            >
              Copy title
            </button>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => setPinTitle('')}
            >
              Clear title
            </button>
          </div>
        </div>

        {/* Image URL */}
        <div className={classNames(pStyles['pin-card'], { [pStyles.invalid]: warnImage })}>
          <div className={pStyles['pin-field__header']}>
            <label htmlFor="pin-image">Image URL *</label>
            <span className={pStyles['pin-field__meta']}>required to publish</span>
          </div>
          <input
            id="pin-image"
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className={classNames(pStyles['pin-field__input'], {
              [pStyles['pin-field__input--invalid']]: warnImage,
            })}
            placeholder="https://example.com/image.jpg"
          />
          {!cleanImage && (
            <p className={pStyles['pin-field__hint']}>
              Pinterest requires a publicly accessible image URL to create a pin.
            </p>
          )}
          {warnImage && (
            <p className={pStyles['pin-field__error']}>
              Enter a valid image URL starting with http:// or https://.
            </p>
          )}
          <div style={pinFieldRow}>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => copyToClipboard(imageUrl, 'Image URL')}
            >
              Copy image URL
            </button>
          </div>
        </div>

        {/* Destination link */}
        <div className={classNames(pStyles['pin-card'], { [pStyles.invalid]: warnLink })}>
          <div className={pStyles['pin-field__header']}>
            <label htmlFor="pin-link">Destination URL</label>
            <span className={pStyles['pin-field__meta']}>optional</span>
          </div>
          <input
            id="pin-link"
            type="url"
            value={destinationLink}
            onChange={e => setDestinationLink(e.target.value)}
            className={classNames(pStyles['pin-field__input'], {
              [pStyles['pin-field__input--invalid']]: warnLink,
            })}
            placeholder="https://"
          />
          {!cleanLink && (
            <p className={pStyles['pin-field__hint']}>
              Link pins to the source page. Must start with http:// or https://.
            </p>
          )}
          {warnLink && (
            <p className={pStyles['pin-field__error']}>
              Enter a valid URL starting with http:// or https://.
            </p>
          )}
          <div style={pinFieldRow}>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => copyToClipboard(destinationLink, 'Destination URL')}
            >
              Copy URL
            </button>
          </div>
        </div>

        {/* Tag */}
        <div className={pStyles['pin-card']}>
          <div className={pStyles['pin-field__header']}>
            <label htmlFor="pin-tag">Tag / Keyword</label>
            <span className={pStyles['pin-field__meta']}>optional</span>
          </div>
          <input
            id="pin-tag"
            type="text"
            value={pinTag}
            onChange={e => setPinTag(e.target.value)}
            className={pStyles['pin-field__input']}
            placeholder="e.g. minimalism, interior design"
          />
          {!cleanTag && (
            <p className={pStyles['pin-field__hint']}>
              Tag suggestions are based on your title and description.
            </p>
          )}
          <div style={pinFieldRow}>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={handleSuggestTags}
            >
              Suggest tags
            </button>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => copyToClipboard(pinTag, 'Tag')}
            >
              Copy tag
            </button>
            <button type="button" style={pinButtonStyle('ghost', isDark)} onClick={handleClearTag}>
              Clear tag
            </button>
          </div>
          {tagSuggestions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
              {tagSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setPinTag(suggestion)}
                  style={{
                    borderRadius: '999px',
                    padding: '6px 12px',
                    border: isDark ? '1px solid #444' : '1px solid #ddd',
                    background: isDark ? '#1f2937' : '#fdf0f0',
                    cursor: 'pointer',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div
          className={classNames(pStyles['pin-card'], pStyles['pin-card--wide'], {
            [pStyles.invalid]: warnDesc,
          })}
        >
          <div className={pStyles['pin-field__header']}>
            <label htmlFor="pin-description">Description</label>
            <span
              className={classNames(pStyles['pin-field__meta'], { [pStyles.invalid]: warnDesc })}
            >
              {cleanDesc.length}/{PIN_DESC_MAX}
            </span>
          </div>
          <textarea
            id="pin-description"
            value={pinDescription}
            onChange={e => setPinDescription(e.target.value)}
            className={classNames(pStyles['pin-field__input'], pStyles['pin-field__textarea'], {
              [pStyles['pin-field__input--invalid']]: warnDesc,
            })}
            rows={5}
            placeholder="Describe your pin. Add keywords to help people discover it."
            maxLength={PIN_DESC_MAX}
          />
          {!cleanDesc && (
            <p className={pStyles['pin-field__hint']}>
              Optional description. Include keywords to improve discoverability.
            </p>
          )}
          {warnDesc && (
            <p className={pStyles['pin-field__error']}>
              Description exceeds Pinterest&apos;s {PIN_DESC_MAX.toLocaleString()}-character limit.
            </p>
          )}
          <div style={pinFieldRow}>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => copyToClipboard(pinDescription, 'Description')}
            >
              Copy description
            </button>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => setPinDescription('')}
            >
              Clear description
            </button>
          </div>
        </div>

        {/* Alt text */}
        <div className={classNames(pStyles['pin-card'], { [pStyles.invalid]: warnAlt })}>
          <div className={pStyles['pin-field__header']}>
            <label htmlFor="pin-alt">Alt Text</label>
            <span
              className={classNames(pStyles['pin-field__meta'], { [pStyles.invalid]: warnAlt })}
            >
              {cleanAlt.length}/{PIN_NOTE_MAX}
            </span>
          </div>
          <input
            id="pin-alt"
            type="text"
            value={altCaption}
            onChange={e => setAltCaption(e.target.value)}
            className={classNames(pStyles['pin-field__input'], {
              [pStyles['pin-field__input--invalid']]: warnAlt,
            })}
            placeholder="Describe the image for accessibility"
            maxLength={PIN_NOTE_MAX}
          />
          {!cleanAlt && (
            <p className={pStyles['pin-field__hint']}>
              Alt text improves accessibility and search ranking.
            </p>
          )}
          {warnAlt && (
            <p className={pStyles['pin-field__error']}>
              Alt text exceeds {PIN_NOTE_MAX.toLocaleString()}-character limit.
            </p>
          )}
          <div style={pinFieldRow}>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={() => copyToClipboard(altCaption, 'Alt text')}
            >
              Copy alt text
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <section className={pStyles['pin-card']}>
        <div className={pStyles['pin-preview__header']}>
          <h4>Pin preview</h4>
          <div className={pStyles['pin-preview__actions']}>
            <button
              type="button"
              style={pinButtonStyle('ghost', isDark)}
              onClick={handleMoveToQueue}
            >
              Schedule this pin
            </button>
            <button
              type="button"
              style={pinButtonStyle('outline', isDark)}
              onClick={openPinterestCreate}
            >
              Open Pinterest creator
            </button>
            <button
              type="button"
              style={{
                ...pinButtonStyle('primary', isDark),
                opacity: canPublish && !isSyncing ? 1 : 0.5,
              }}
              disabled={!canPublish || isSyncing}
              onClick={handlePublishNow}
            >
              {isSyncing ? 'Publishing…' : 'Publish now'}
            </button>
            <button
              type="button"
              style={{ ...pinButtonStyle('outline', isDark), opacity: canCopyDraft ? 1 : 0.5 }}
              disabled={!canCopyDraft}
              onClick={() => copyToClipboard(pinPreview, 'Pin draft')}
            >
              Copy full draft
            </button>
          </div>
        </div>
        <pre className={pStyles['pin-preview__body']}>{pinPreview}</pre>
        {!canCopyDraft && (
          <p className={pStyles['pin-preview__hint']}>
            Fill Title and Board to enable copying or publishing.
          </p>
        )}
        {canCopyDraft && !canPublish && (
          <p className={pStyles['pin-preview__hint']}>
            Add a valid Image URL to enable &quot;Publish now&quot;.
          </p>
        )}
      </section>
    </>
  );
}

PinComposePane.propTypes = {
  composeProps: PropTypes.shape({
    isDark: PropTypes.bool.isRequired,
    pinTitle: PropTypes.string.isRequired,
    setPinTitle: PropTypes.func.isRequired,
    destinationLink: PropTypes.string.isRequired,
    setDestinationLink: PropTypes.func.isRequired,
    boardName: PropTypes.string.isRequired,
    setBoardName: PropTypes.func.isRequired,
    pinTag: PropTypes.string.isRequired,
    setPinTag: PropTypes.func.isRequired,
    pinDescription: PropTypes.string.isRequired,
    setPinDescription: PropTypes.func.isRequired,
    altCaption: PropTypes.string.isRequired,
    setAltCaption: PropTypes.func.isRequired,
    imageUrl: PropTypes.string.isRequired,
    setImageUrl: PropTypes.func.isRequired,
    tagSuggestions: PropTypes.arrayOf(PropTypes.string).isRequired,
    cleanTitle: PropTypes.string.isRequired,
    cleanLink: PropTypes.string.isRequired,
    cleanBoard: PropTypes.string.isRequired,
    cleanDesc: PropTypes.string.isRequired,
    cleanTag: PropTypes.string.isRequired,
    cleanAlt: PropTypes.string.isRequired,
    cleanImage: PropTypes.string.isRequired,
    warnTitle: PropTypes.bool.isRequired,
    warnLink: PropTypes.bool.isRequired,
    warnBoard: PropTypes.bool.isRequired,
    warnDesc: PropTypes.bool.isRequired,
    warnAlt: PropTypes.bool.isRequired,
    warnImage: PropTypes.bool.isRequired,
    canCopyDraft: PropTypes.bool.isRequired,
    canPublish: PropTypes.bool.isRequired,
    isSyncing: PropTypes.bool.isRequired,
    pinPreview: PropTypes.string.isRequired,
    handleClearCompose: PropTypes.func.isRequired,
    handleMoveToQueue: PropTypes.func.isRequired,
    handlePublishNow: PropTypes.func.isRequired,
    handleSuggestTags: PropTypes.func.isRequired,
    handleClearTag: PropTypes.func.isRequired,
    copyToClipboard: PropTypes.func.isRequired,
    openPinterestCreate: PropTypes.func.isRequired,
  }).isRequired,
};

// ─── PinQueuePane ─────────────────────────────────────────────────────────────

function PinQueuePane({ queueProps }) {
  const {
    isDark,
    queueDate,
    queueTime,
    todayStr,
    queueTimeFloor,
    queuedDraftText,
    triedSavingQueue,
    isSyncing,
    isLoadingQueue,
    pinQueue,
    editingQueueEntryId,
    activeQueueEntry,
    handleQueueDateChange,
    handleQueueTimeChange,
    handlePersistQueueEntry,
    handleReturnToCompose,
    handleLoadQueueEntry,
    handlePublishQueueEntry,
    handleRemoveQueueEntry,
    copyToClipboard,
    openPinterestCreate,
  } = queueProps;

  return (
    <div className={pStyles['pin-queue__grid']}>
      <section className={classNames(pStyles['pin-card'], pStyles['pin-card--queue-editor'])}>
        <h3>Pin Queue</h3>
        <p>Pick a date and time, then save this pin for the scheduler to publish automatically.</p>
        {activeQueueEntry && (
          <p className={pStyles['pin-queue__edit-note']}>
            Editing &quot;{activeQueueEntry.pinTitle || 'Untitled pin'}&quot;. Saving will add a new
            entry — delete the old one if no longer needed.
          </p>
        )}
        <div className={pStyles['pin-queue__datetime-row']}>
          <PinDateField
            fieldId="pin-queue-date"
            inputType="date"
            labelText="Publish date"
            fieldValue={queueDate}
            minValue={todayStr}
            onFieldChange={handleQueueDateChange}
            triedSaving={triedSavingQueue}
            validationMsg="Select a publish date."
          />
          <PinDateField
            fieldId="pin-queue-time"
            inputType="time"
            labelText="Publish time"
            fieldValue={queueTime}
            minValue={queueTimeFloor}
            onFieldChange={handleQueueTimeChange}
            triedSaving={triedSavingQueue}
            validationMsg="Select a publish time."
          />
        </div>
        <label htmlFor="pin-queue-draft">Queued draft</label>
        <textarea
          id="pin-queue-draft"
          value={queuedDraftText}
          className={classNames(pStyles['pin-field__input'], pStyles['pin-queue__textarea'])}
          placeholder='Click "Schedule this pin" in the Create Pin tab to load content here.'
          rows={8}
          readOnly
        />
        <div className={pStyles['pin-queue__action-row']}>
          <button
            type="button"
            style={pinButtonStyle('primary', isDark)}
            disabled={!queuedDraftText.trim() || isSyncing}
            onClick={handlePersistQueueEntry}
          >
            {isSyncing ? 'Saving…' : 'Save to queue'}
          </button>
          <button
            type="button"
            style={pinButtonStyle('ghost', isDark)}
            disabled={!queuedDraftText.trim()}
            onClick={() => copyToClipboard(queuedDraftText, 'Queued draft')}
          >
            Copy queued draft
          </button>
          <button
            type="button"
            style={pinButtonStyle('outline', isDark)}
            onClick={handleReturnToCompose}
          >
            Back to Create Pin
          </button>
        </div>
      </section>

      <section className={classNames(pStyles['pin-card'], pStyles['pin-card--queue-list'])}>
        <h3>Scheduled pins</h3>
        <p className={pStyles['pin-field__hint']}>
          Pins are published automatically by the scheduler and removed from this list once posted.
        </p>
        {isLoadingQueue ? (
          <p className={pStyles['pin-queue__loading']}>Loading scheduled pins…</p>
        ) : (
          <div className={pStyles['pin-queue__list']}>
            {pinQueue.length === 0 ? (
              <p className={pStyles['pin-queue__empty']}>
                No scheduled pins yet. Add one using the form on the left.
              </p>
            ) : (
              pinQueue.map(entry => {
                const isActiveEntry = entry.id === editingQueueEntryId;
                const draftContent = entry.draftText ?? '';
                const excerpt =
                  draftContent.length > 140
                    ? `${draftContent.slice(0, 140).trim()}…`
                    : draftContent || 'No content captured.';
                return (
                  <article
                    key={entry.id}
                    className={classNames(
                      pStyles['pin-entry__item'],
                      isActiveEntry && pStyles['pin-entry__item--active'],
                    )}
                  >
                    <div className={pStyles['pin-entry__header']}>
                      <h4 className={pStyles['pin-entry__title']}>
                        {entry.pinTitle ?? 'Untitled pin'}
                      </h4>
                      <span className={pStyles['pin-entry__meta']}>
                        {formatPinDisplayDateTime(entry.scheduledDate, entry.scheduledTime)}
                      </span>
                    </div>
                    <p className={pStyles['pin-entry__excerpt']}>{excerpt}</p>
                    <div className={pStyles['pin-entry__actions']}>
                      <button
                        type="button"
                        style={pinButtonStyle('ghost', isDark)}
                        onClick={() => handleLoadQueueEntry(entry.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        style={pinButtonStyle('outline', isDark)}
                        disabled={isSyncing}
                        onClick={() => handlePublishQueueEntry(entry)}
                      >
                        Publish now
                      </button>
                      <button
                        type="button"
                        style={pinButtonStyle('ghost', isDark)}
                        disabled={isSyncing}
                        onClick={() => handleRemoveQueueEntry(entry.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </section>
    </div>
  );
}

PinQueuePane.propTypes = {
  queueProps: PropTypes.shape({
    isDark: PropTypes.bool.isRequired,
    queueDate: PropTypes.string.isRequired,
    queueTime: PropTypes.string.isRequired,
    todayStr: PropTypes.string.isRequired,
    queueTimeFloor: PropTypes.string.isRequired,
    queuedDraftText: PropTypes.string.isRequired,
    triedSavingQueue: PropTypes.bool.isRequired,
    isSyncing: PropTypes.bool.isRequired,
    isLoadingQueue: PropTypes.bool.isRequired,
    pinQueue: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    editingQueueEntryId: PropTypes.string,
    activeQueueEntry: PropTypes.shape({ pinTitle: PropTypes.string }),
    handleQueueDateChange: PropTypes.func.isRequired,
    handleQueueTimeChange: PropTypes.func.isRequired,
    handlePersistQueueEntry: PropTypes.func.isRequired,
    handleReturnToCompose: PropTypes.func.isRequired,
    handleLoadQueueEntry: PropTypes.func.isRequired,
    handlePublishQueueEntry: PropTypes.func.isRequired,
    handleRemoveQueueEntry: PropTypes.func.isRequired,
    copyToClipboard: PropTypes.func.isRequired,
    openPinterestCreate: PropTypes.func.isRequired,
  }).isRequired,
};

PinQueuePane.defaultProps = {
  queueProps: {
    editingQueueEntryId: null,
    activeQueueEntry: null,
  },
};

// ─── PinterestPinComposer ─────────────────────────────────────────────────────

function PinterestPinComposer({ network }) {
  const isDark = useSelector(state => state.theme.darkMode);

  const [pinTitle, setPinTitle] = useState('');
  const [destinationLink, setDestinationLink] = useState('');
  const [boardName, setBoardName] = useState('');
  const [pinTag, setPinTag] = useState('');
  const [pinDescription, setPinDescription] = useState('');
  const [altCaption, setAltCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [activePane, setActivePane] = useState('compose');
  const [queuedDraftText, setQueuedDraftText] = useState('');
  const [queueDate, setQueueDate] = useState(() => formatPinDate(new Date()));
  const [queueTime, setQueueTime] = useState(() => formatPinTime(new Date()));
  const [pinQueue, setPinQueue] = useState([]);
  const [editingQueueEntryId, setEditingQueueEntryId] = useState(null);
  const [triedSavingQueue, setTriedSavingQueue] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const paneTabs = useMemo(
    () => [
      { id: 'compose', label: '📌 Create Pin' },
      { id: 'queue', label: '🗓️ Pin Queue' },
    ],
    [],
  );

  const cleanTitle = pinTitle.trim();
  const cleanLink = destinationLink.trim();
  const cleanBoard = boardName.trim();
  const cleanDesc = pinDescription.trim();
  const cleanTag = pinTag.trim();
  const cleanAlt = altCaption.trim();
  const cleanImage = imageUrl.trim();

  const titleWithinRange = cleanTitle.length >= PIN_TITLE_MIN && cleanTitle.length <= PIN_TITLE_MAX;
  const linkIsValid = cleanLink.length === 0 || /^https?:\/\//i.test(cleanLink);
  const boardIsValid = cleanBoard.length >= 1 && cleanBoard.length <= 50;
  const descIsValid = cleanDesc.length <= PIN_DESC_MAX;
  const altIsValid = cleanAlt.length <= PIN_NOTE_MAX;
  const imageIsValid = cleanImage.length === 0 || /^https?:\/\//i.test(cleanImage);

  const canCopyDraft = titleWithinRange && boardIsValid;
  const canPublish = canCopyDraft && cleanImage.length > 0 && imageIsValid;

  const warnTitle = cleanTitle.length > 0 && !titleWithinRange;
  const warnLink = cleanLink.length > 0 && !linkIsValid;
  const warnBoard = cleanBoard.length > 0 && !boardIsValid;
  const warnDesc = cleanDesc.length > 0 && !descIsValid;
  const warnAlt = cleanAlt.length > 0 && !altIsValid;
  const warnImage = cleanImage.length > 0 && !imageIsValid;

  const hasComposedContent = Boolean(
    cleanTitle || cleanLink || cleanBoard || cleanDesc || cleanTag,
  );

  const pinPreview = useMemo(() => {
    if (!hasComposedContent) return '';
    return buildPinPreview({
      title: pinTitle,
      link: destinationLink,
      board: cleanBoard,
      tag: pinTag,
      description: pinDescription,
      alt: altCaption,
    });
  }, [
    pinTitle,
    destinationLink,
    cleanBoard,
    pinTag,
    pinDescription,
    altCaption,
    hasComposedContent,
  ]);

  const activeQueueEntry = useMemo(
    () => pinQueue.find(entry => entry.id === editingQueueEntryId) || null,
    [editingQueueEntryId, pinQueue],
  );

  const nowRef = new Date();
  const todayStr = formatPinDate(nowRef);
  const currentTimeStr = formatPinTime(nowRef);
  const queueTimeFloor = queueDate === todayStr ? currentTimeStr : '00:00';

  const syncQueueFromBackend = useCallback(async () => {
    setIsLoadingQueue(true);
    try {
      const remoteEntries = await fetchSavedPins();
      setPinQueue(remoteEntries);
    } catch {
      toast.error('Could not load saved pins from the server.');
    } finally {
      setIsLoadingQueue(false);
    }
  }, []);

  const copyToClipboard = async (text, fieldLabel) => {
    const value = text?.trim();
    if (!value) {
      toast.warn(`Nothing to copy for ${fieldLabel}.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${fieldLabel} copied to clipboard`);
    } catch {
      toast.error(`Could not copy ${fieldLabel.toLowerCase()}.`);
    }
  };

  const handleClearCompose = () => {
    setPinTitle('');
    setDestinationLink('');
    setBoardName('');
    setPinTag('');
    setPinDescription('');
    setAltCaption('');
    setImageUrl('');
    setTagSuggestions([]);
  };

  const openPinterestCreate = () => {
    window.open('https://www.pinterest.com/pin/creation/button/', '_blank', 'noopener,noreferrer');
  };

  const handleMoveToQueue = () => {
    if (!hasComposedContent) {
      toast.error('Nothing to queue yet. Add details in Create Pin first.');
      return;
    }
    const missing = [!cleanTitle && 'Title', !cleanBoard && 'Board'].filter(Boolean).join(', ');
    if (missing) {
      toast.error(`Add ${missing} before queuing.`);
      return;
    }
    const now = new Date();
    setQueueDate(formatPinDate(now));
    setQueueTime(formatPinTime(now));
    setQueuedDraftText(pinPreview);
    setTriedSavingQueue(false);
    setActivePane('queue');
    toast.success('Draft moved to Pin Queue.');
  };

  const handlePublishNow = async () => {
    if (!canPublish) {
      toast.error('Add a valid image URL, title, and board before publishing.');
      return;
    }
    setIsSyncing(true);
    try {
      await publishPinNow({
        pinTitle: cleanTitle,
        pinDescription: cleanDesc,
        imgType: 'URL',
        imageUrl: cleanImage,
      });
      toast.success('Pin published to Pinterest!');
    } catch (err) {
      toast.error(err.message || 'Could not publish pin. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const applyQueueDateTime = (nextDate, nextTime) => {
    const { date, time } = clampPinScheduleDateTime(nextDate, nextTime);
    setQueueDate(date);
    setQueueTime(time);
    setTriedSavingQueue(false);
  };

  const handleQueueDateChange = evt => {
    if (evt.target.value) applyQueueDateTime(evt.target.value, queueTime);
  };
  const handleQueueTimeChange = evt => {
    if (evt.target.value) applyQueueDateTime(queueDate, evt.target.value);
  };
  const handleReturnToCompose = () => {
    setTriedSavingQueue(false);
    setActivePane('compose');
  };

  const handlePersistQueueEntry = async () => {
    setTriedSavingQueue(true);
    if (!queuedDraftText.trim()) {
      toast.warn('Add content to the queue before saving.');
      return;
    }
    if (!queueDate || !queueTime) {
      toast.error('Choose a date and time for the pin.');
      return;
    }
    setIsSyncing(true);
    try {
      await savePinToBackend({
        pinTitle: cleanTitle,
        pinDescription: cleanDesc,
        destinationLink: cleanLink,
        boardName: cleanBoard,
        pinTag: cleanTag,
        altCaption: cleanAlt,
        imgType: 'URL',
        imageUrl: cleanImage,
        scheduledDate: queueDate,
        scheduledTime: queueTime,
      });
      await syncQueueFromBackend();
      toast.success('Pin entry saved.');
      setTriedSavingQueue(false);
      setEditingQueueEntryId(null);
    } catch {
      toast.error('Could not save the pin to the server. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadQueueEntry = entryId => {
    const target = pinQueue.find(e => e.id === entryId);
    if (!target) return;
    const { date, time } = clampPinScheduleDateTime(target.scheduledDate, target.scheduledTime);
    setPinTitle(target.pinTitle || '');
    setQueuedDraftText(target.draftText || '');
    setQueueDate(date);
    setQueueTime(time);
    setTriedSavingQueue(false);
    setEditingQueueEntryId(target.id);
    setActivePane('queue');
    toast.info('Pin entry loaded for editing.');
  };

  const handleRemoveQueueEntry = async entryId => {
    setIsSyncing(true);
    try {
      await deletePinFromBackend(entryId);
      setPinQueue(prev => prev.filter(e => e.id !== entryId));
      if (editingQueueEntryId === entryId) setEditingQueueEntryId(null);
      toast.success('Pin entry removed.');
    } catch {
      toast.error('Could not remove the pin. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePublishQueueEntry = async entry => {
    setIsSyncing(true);
    const parsedPostData = JSON.parse(entry.draftText);
    try {
      await publishPinNow({
        pinTitle: parsedPostData.title,
        pinDescription: parsedPostData.description || '',
        imgType: parsedPostData.media_source?.source_type === 'image_base64' ? 'FILE' : 'URL',
        imageUrl: parsedPostData.media_source?.url || '',
        mediaItems:
          parsedPostData.media_source?.source_type === 'image_base64'
            ? parsedPostData.media_source
            : { url: parsedPostData.media_source?.url },
      });
      await deletePinFromBackend(entry.id);
      setPinQueue(prev => prev.filter(e => e.id !== entry.id));
      toast.success('Pin published and removed from queue.');
    } catch (err) {
      toast.error(err.message || 'Could not publish pin. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePaneSwitch = paneId => {
    if (paneId === 'compose') {
      setEditingQueueEntryId(null);
      setQueuedDraftText('');
      setTriedSavingQueue(false);
    }
    if (paneId === 'queue') syncQueueFromBackend();
    setActivePane(paneId);
  };

  const handleSuggestTags = () => {
    const suggestions = extractTagSuggestions(pinTitle, pinDescription, boardName);
    setTagSuggestions(suggestions);
    if (suggestions.length === 0) toast.info('No tag suggestions found.');
  };

  const handleClearTag = () => {
    setPinTag('');
    setTagSuggestions([]);
  };

  return (
    <div className={classNames(pStyles['pin-composer'], { [pStyles.dark]: isDark })}>
      <div className={classNames(pStyles['pin-panetabs'], { [pStyles.dark]: isDark })}>
        {paneTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={classNames(pStyles['pin-panetab'], { [pStyles.active]: activePane === id })}
            onClick={() => handlePaneSwitch(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activePane === 'compose' ? (
        <PinComposePane
          composeProps={{
            isDark,
            pinTitle,
            setPinTitle,
            destinationLink,
            setDestinationLink,
            boardName,
            setBoardName,
            pinTag,
            setPinTag,
            pinDescription,
            setPinDescription,
            altCaption,
            setAltCaption,
            imageUrl,
            setImageUrl,
            tagSuggestions,
            cleanTitle,
            cleanLink,
            cleanBoard,
            cleanDesc,
            cleanTag,
            cleanAlt,
            cleanImage,
            warnTitle,
            warnLink,
            warnBoard,
            warnDesc,
            warnAlt,
            warnImage,
            canCopyDraft,
            canPublish,
            isSyncing,
            pinPreview,
            handleClearCompose,
            handleMoveToQueue,
            handlePublishNow,
            handleSuggestTags,
            handleClearTag,
            copyToClipboard,
            openPinterestCreate,
          }}
        />
      ) : (
        <PinQueuePane
          queueProps={{
            isDark,
            queueDate,
            queueTime,
            todayStr,
            queueTimeFloor,
            queuedDraftText,
            triedSavingQueue,
            isSyncing,
            isLoadingQueue,
            pinQueue,
            editingQueueEntryId,
            activeQueueEntry,
            handleQueueDateChange,
            handleQueueTimeChange,
            handlePersistQueueEntry,
            handleReturnToCompose,
            handleLoadQueueEntry,
            handlePublishQueueEntry,
            handleRemoveQueueEntry,
            copyToClipboard,
            openPinterestCreate,
          }}
        />
      )}
    </div>
  );
}

PinterestPinComposer.propTypes = {
  network: PropTypes.string,
};

PinterestPinComposer.defaultProps = {
  network: 'pinterest',
};

export default PinterestPinComposer;
