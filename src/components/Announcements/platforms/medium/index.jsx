import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './MediumAutoPoster.module.css';

import {
  formatDate,
  formatTime,
  formatDateTime,
  formatExcerpt,
  copyText,
  buttonStyle as getButtonStyle,
} from '../../shared/autoPosterUtils';

import AutoPosterTabs from '../../shared/AutoPosterTabs';

const TITLE_MIN = 10;
const TITLE_MAX = 100;
const CONTENT_MIN = 50;

const sanitizeTags = text =>
  [
    ...new Set(
      text
        .split(',')
        .map(tag =>
          tag
            .trim()
            .replace(/^#/, '')
            .toLowerCase(),
        )
        .filter(Boolean)
        .map(tag => tag.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
        .filter(Boolean),
    ),
  ].slice(0, 5);

const validateSchedule = ({ scheduledDraft, scheduledDate, scheduledTime }) => {
  if (!scheduledDraft.trim()) {
    toast.error('Please add a draft before saving.');
    return false;
  }

  if (!scheduledDate) {
    toast.error('Please select a scheduled date.');
    return false;
  }

  if (!scheduledTime) {
    toast.error('Please select a scheduled time.');
    return false;
  }

  const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

  if (Number.isNaN(selectedDateTime.getTime())) {
    toast.error('Please select a valid date and time.');
    return false;
  }

  if (selectedDateTime <= new Date()) {
    toast.error('Please select a future date and time.');
    return false;
  }

  return true;
};

const buildScheduleData = ({
  editingId,
  trimmedTitle,
  trimmedContent,
  tags,
  tagsText,
  trimmedUrl,
  visibility,
  scheduledDate,
  scheduledTime,
  scheduledDraft,
}) => ({
  id: editingId || `medium-${Date.now()}`,
  title: trimmedTitle,
  content: trimmedContent,
  tags,
  tagsText,
  canonicalUrl: trimmedUrl,
  visibility,
  scheduledDate,
  scheduledTime,
  scheduledDraft,
});

const persistSchedule = (scheduleData, editingId, setSavedSchedules) => {
  if (editingId) {
    setSavedSchedules(previousSchedules =>
      previousSchedules.map(item => (item.id === editingId ? scheduleData : item)),
    );

    toast.success('Scheduled post updated.');
    return;
  }

  setSavedSchedules(previousSchedules => [...previousSchedules, scheduleData]);
  toast.success('Scheduled post saved.');
};

const buttonStyle = (variant, darkMode) =>
  getButtonStyle(variant, darkMode, {
    primary: '#0d6efd',
    ghostBackground: '#e9efff',
    ghostText: '#1c3f82',
  });

const getToday = () => formatDate(new Date());

const getCurrentTime = () => formatTime(new Date());

const resetScheduleState = ({
  setEditingId,
  setScheduledDraft,
  setScheduledDate,
  setScheduledTime,
  setScheduleAttemptedSave,
}) => {
  setEditingId(null);
  setScheduledDraft('');
  setScheduledDate(getToday());
  setScheduledTime(getCurrentTime());
  setScheduleAttemptedSave(false);
};

const validateArticle = ({
  trimmedTitle,
  titleValid,
  trimmedContent,
  contentValid,
  tags,
  urlValid,
}) => {
  if (!trimmedTitle) {
    toast.error('Please enter an article title.');
    return false;
  }

  if (!titleValid) {
    toast.error(`Title must contain ${TITLE_MIN}-${TITLE_MAX} characters.`);
    return false;
  }

  if (!trimmedContent) {
    toast.error('Please enter article content.');
    return false;
  }

  if (!contentValid) {
    toast.error(`Article content must contain at least ${CONTENT_MIN} characters.`);
    return false;
  }

  if (!tags.length) {
    toast.error('Please add at least one tag.');
    return false;
  }

  if (!urlValid) {
    toast.error('Enter a valid HTTP(S) canonical URL or leave it empty.');
    return false;
  }

  return true;
};

const SavedScheduleList = ({
  savedSchedules,
  editingId,
  darkMode,
  editMediumSchedule,
  openMediumEditor,
  handleDeleteSchedule,
}) => (
  <div className={styles.savedList}>
    {savedSchedules.length === 0 ? (
      <p className={styles.empty}>No scheduled posts yet. Save one to see it listed here.</p>
    ) : (
      savedSchedules.map(item => (
        <article
          key={item.id}
          className={classNames(styles.savedItem, {
            [styles.savedItemActive]: item.id === editingId,
          })}
        >
          <div className={styles.savedHeader}>
            <h4 className={styles.savedTitle}>{item.title || 'Untitled article'}</h4>

            <span className={styles.savedMeta}>
              {formatDateTime(item.scheduledDate, item.scheduledTime)}
            </span>
          </div>

          <p className={styles.savedExcerpt}>
            {formatExcerpt(item.content, 'No content captured.')}
          </p>

          <div className={styles.savedActions}>
            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => editMediumSchedule(item)}
            >
              Edit
            </button>

            <button
              type="button"
              style={buttonStyle('outline', darkMode)}
              onClick={() => copyText(item.scheduledDraft, 'Scheduled draft')}
            >
              Copy
            </button>

            <button
              type="button"
              style={buttonStyle('outline', darkMode)}
              onClick={openMediumEditor}
            >
              Open Medium
            </button>

            <button
              type="button"
              style={buttonStyle('ghost', darkMode)}
              onClick={() => handleDeleteSchedule(item.id)}
            >
              Delete
            </button>
          </div>
        </article>
      ))
    )}
  </div>
);

function MediumAutoPoster() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  // Editor state
  const [activeTab, setActiveTab] = useState('make');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [visibility, setVisibility] = useState('draft');

  // Scheduling state
  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState(getToday);
  const [scheduledTime, setScheduledTime] = useState(getCurrentTime);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);

  const today = getToday();
  const scheduleTimeMin = scheduledDate === today ? getCurrentTime() : '';

  const editingSchedule = useMemo(
    () => savedSchedules.find(item => item.id === editingId) || null,
    [savedSchedules, editingId],
  );

  const scheduleHasDraft = Boolean(scheduledDraft.trim());

  // Article validation
  const tags = useMemo(() => sanitizeTags(tagsText), [tagsText]);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedUrl = canonicalUrl.trim();

  const titleValid = trimmedTitle.length >= TITLE_MIN && trimmedTitle.length <= TITLE_MAX;
  const contentValid = trimmedContent.length >= CONTENT_MIN;
  const urlValid = !trimmedUrl || /^https?:\/\/\S+$/i.test(trimmedUrl);

  const readyToCopy = titleValid && contentValid && tags.length > 0 && urlValid;

  const titleInvalid = trimmedTitle.length > 0 && !titleValid;
  const contentInvalid = trimmedContent.length > 0 && !contentValid;
  const urlInvalid = !urlValid;

  const hasInput = Boolean(trimmedTitle || trimmedContent || tagsText.trim() || trimmedUrl);

  const buildDraft = () => {
    const tagList = tags.length ? tags.map(tag => `#${tag}`).join(', ') : '—';

    return [
      `Title\n${trimmedTitle || '—'}`,
      `Content\n${trimmedContent || '—'}`,
      `Tags\n${tagList}`,
      `Canonical URL\n${trimmedUrl || '—'}`,
      `Visibility\n${visibility}`,
    ].join('\n\n');
  };

  const preview = useMemo(() => (hasInput ? buildDraft() : ''), [
    title,
    content,
    tagsText,
    canonicalUrl,
    visibility,
    hasInput,
  ]);

  // Editor handlers
  const resetEditor = () => {
    setTitle('');
    setContent('');
    setTagsText('');
    setCanonicalUrl('');
    setVisibility('draft');
  };

  const handleReset = () => {
    resetEditor();
    toast.info('Editor fields cleared.');
  };

  const openMediumEditor = () => {
    window.open('https://medium.com/new-story', '_blank', 'noopener,noreferrer');
  };

  const removeTag = tagToRemove => {
    setTagsText(tags.filter(tag => tag !== tagToRemove).join(', '));
  };

  // Scheduling handlers
  const handleScheduleDateChange = event => {
    const nextDate = event.target.value;

    setScheduledDate(nextDate);
    setScheduleAttemptedSave(false);

    if (nextDate === today && scheduledTime < getCurrentTime()) {
      setScheduledTime(getCurrentTime());
    }
  };

  const handleScheduleTimeChange = event => {
    setScheduledTime(event.target.value);
    setScheduleAttemptedSave(false);
  };

  const handleScheduleClick = () => {
    const isValid = validateArticle({
      trimmedTitle,
      titleValid,
      trimmedContent,
      contentValid,
      tags,
      urlValid,
    });

    if (!isValid) return;

    const now = new Date();

    setScheduledDate(formatDate(now));
    setScheduledTime(formatTime(now));
    setScheduledDraft(preview);
    setScheduleAttemptedSave(false);
    setEditingId(null);
    setActiveTab('schedule');

    toast.success('Draft moved to the Schedule tab.');
  };

  const handleSaveSchedule = () => {
    setScheduleAttemptedSave(true);

    const isValid = validateSchedule({
      scheduledDraft,
      scheduledDate,
      scheduledTime,
    });

    if (!isValid) return;

    const scheduleData = buildScheduleData({
      editingId,
      trimmedTitle,
      trimmedContent,
      tags,
      tagsText,
      trimmedUrl,
      visibility,
      scheduledDate,
      scheduledTime,
      scheduledDraft,
    });

    persistSchedule(scheduleData, editingId, setSavedSchedules);

    resetScheduleState({
      setEditingId,
      setScheduledDraft,
      setScheduledDate,
      setScheduledTime,
      setScheduleAttemptedSave,
    });

    resetEditor();
    setActiveTab('make');
  };

  const editMediumSchedule = item => {
    setEditingId(item.id);
    setScheduledDraft(item.scheduledDraft || '');
    setScheduledDate(item.scheduledDate || getToday());
    setScheduledTime(item.scheduledTime || getCurrentTime());

    setTitle(item.title || '');
    setContent(item.content || '');
    setTagsText(item.tagsText || '');
    setCanonicalUrl(item.canonicalUrl || '');
    setVisibility(item.visibility || 'draft');

    setScheduleAttemptedSave(false);
    setActiveTab('schedule');
  };

  const handleDeleteSchedule = id => {
    setSavedSchedules(previousSchedules => previousSchedules.filter(item => item.id !== id));

    if (editingId === id) {
      resetScheduleState({
        setEditingId,
        setScheduledDraft,
        setScheduledDate,
        setScheduledTime,
        setScheduleAttemptedSave,
      });
    }

    toast.success('Scheduled post deleted.');
  };

  const handleCancelEditing = () => {
    resetScheduleState({
      setEditingId,
      setScheduledDraft,
      setScheduledDate,
      setScheduledTime,
      setScheduleAttemptedSave,
    });

    resetEditor();
    setActiveTab('make');
  };

  return (
    <div
      className={classNames(styles['medium-autoposter'], {
        [styles.dark]: darkMode,
      })}
      data-testid="medium-auto-poster"
    >
      <AutoPosterTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        styles={styles}
        tabs={[
          { id: 'make', label: '📝 Make Post' },
          { id: 'schedule', label: '⏰ Scheduled Post' },
        ]}
      />

      {activeTab === 'make' ? (
        <>
          <section className={styles.card}>
            <h3>Medium Auto-Poster</h3>

            <p>
              Create and format a Medium article draft. Add a title, article content, relevant tags,
              and optional canonical URL. Preview your draft, copy the content, or open Medium to
              submit it manually.
            </p>

            <div className={styles.topActions}>
              <button type="button" style={buttonStyle('outline', darkMode)} onClick={handleReset}>
                Clear fields
              </button>
            </div>
          </section>

          <div className={styles.grid}>
            <section
              className={classNames(styles.card, {
                [styles.invalid]: titleInvalid,
              })}
            >
              <div className={styles.fieldHeader}>
                <label htmlFor="medium-title">Article title *</label>

                <span
                  className={classNames(styles.fieldMeta, {
                    [styles.invalidText]: titleInvalid,
                  })}
                >
                  {title.length}/{TITLE_MAX}
                </span>
              </div>

              <input
                id="medium-title"
                value={title}
                maxLength={TITLE_MAX}
                onChange={event => setTitle(event.target.value)}
                className={styles.input}
                placeholder="Write a clear, engaging title"
              />

              {!trimmedTitle && <p className={styles.hint}>Use at least {TITLE_MIN} characters.</p>}

              {titleInvalid && (
                <p className={styles.error}>
                  The title must contain {TITLE_MIN}-{TITLE_MAX} characters.
                </p>
              )}

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(title, 'Title')}
                >
                  Copy title
                </button>

                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setTitle('')}
                >
                  Clear title
                </button>
              </div>
            </section>

            <section
              className={classNames(styles.card, {
                [styles.invalid]: urlInvalid,
              })}
            >
              <div className={styles.fieldHeader}>
                <label htmlFor="medium-canonical">Canonical URL</label>
                <span className={styles.fieldMeta}>optional</span>
              </div>

              <input
                id="medium-canonical"
                type="url"
                value={canonicalUrl}
                onChange={event => setCanonicalUrl(event.target.value)}
                className={styles.input}
                placeholder="https://example.com/original-article"
              />

              <p className={urlInvalid ? styles.error : styles.hint}>
                {urlInvalid
                  ? 'Enter a valid HTTP(S) URL.'
                  : 'Add the original article URL if this content was published elsewhere.'}
              </p>

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(canonicalUrl, 'Canonical URL')}
                >
                  Copy URL
                </button>

                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setCanonicalUrl('')}
                >
                  Clear URL
                </button>
              </div>
            </section>

            <section
              className={classNames(styles.card, {
                [styles.invalid]: contentInvalid,
              })}
            >
              <div className={styles.fieldHeader}>
                <label htmlFor="medium-content">Article content *</label>

                <span
                  className={classNames(styles.fieldMeta, {
                    [styles.invalidText]: contentInvalid,
                  })}
                >
                  {content.length.toLocaleString()} characters
                </span>
              </div>

              <textarea
                id="medium-content"
                value={content}
                onChange={event => setContent(event.target.value)}
                className={classNames(styles.input, styles.textarea)}
                rows={9}
                placeholder="Write your article here..."
              />

              {!trimmedContent && <p className={styles.hint}>Add the main body of your article.</p>}

              {contentInvalid && (
                <p className={styles.error}>
                  Add at least {CONTENT_MIN} characters of article content.
                </p>
              )}

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(content, 'Article content')}
                >
                  Copy content
                </button>

                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setContent('')}
                >
                  Clear content
                </button>
              </div>
            </section>

            <section
              className={classNames(styles.card, {
                [styles.invalid]: !tags.length && Boolean(tagsText.trim()),
              })}
            >
              <div className={styles.fieldHeader}>
                <label htmlFor="medium-tags">Tags *</label>
                <span className={styles.fieldMeta}>up to 5 tags</span>
              </div>

              <textarea
                id="medium-tags"
                value={tagsText}
                onChange={event => setTagsText(event.target.value)}
                className={classNames(styles.input, styles.tagInput)}
                rows={2}
                placeholder="Technology, Software Engineering, AI"
              />

              <div className={styles.chips}>
                {tags.map(tag => (
                  <span className={styles.chip} key={tag}>
                    <span>{tag}</span>

                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className={styles.chipClear}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {!tags.length && (
                <p className={styles.hint}>Add comma-separated tags for your article.</p>
              )}

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(tags.join(', '), 'Tags')}
                >
                  Copy tags
                </button>

                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setTagsText('')}
                >
                  Clear tags
                </button>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.fieldHeader}>
                <label htmlFor="medium-visibility">Article visibility</label>
              </div>

              <select
                id="medium-visibility"
                value={visibility}
                onChange={event => setVisibility(event.target.value)}
                className={styles.input}
              >
                <option value="draft">Draft</option>
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
              </select>

              <p className={styles.hint}>
                This setting is part of the local draft preview only. It does not change any Medium
                publishing settings.
              </p>
            </section>
          </div>

          <section className={styles.card}>
            <div className={styles.previewHeader}>
              <h4>Article preview</h4>

              <div className={styles.previewActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleScheduleClick}
                >
                  Schedule this post
                </button>

                <button
                  type="button"
                  style={buttonStyle('outline', darkMode)}
                  onClick={openMediumEditor}
                >
                  Open Medium editor
                </button>

                <button
                  type="button"
                  style={{
                    ...buttonStyle('primary', darkMode),
                    opacity: readyToCopy ? 1 : 0.5,
                  }}
                  onClick={() => copyText(preview, 'Medium draft')}
                  disabled={!readyToCopy}
                >
                  Copy full draft
                </button>
              </div>
            </div>

            <pre className={styles.previewBody}>
              {preview || 'Your article preview will appear here as you type.'}
            </pre>

            {!readyToCopy && (
              <p className={styles.previewHint}>
                Add a valid title, at least {CONTENT_MIN} characters of content, and one tag to
                enable copying the complete draft.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className={styles.schedulerGrid}>
          <section className={classNames(styles.card, styles.schedulerCard)}>
            <h3>Schedule Medium Post</h3>

            <p>
              Save a local schedule entry for your article. This demo does not publish automatically
              at the selected time.
            </p>

            {editingSchedule && (
              <p className={styles.schedulerNote}>
                Editing “{editingSchedule.title || 'Untitled article'}”. Saving will update the
                existing entry.
              </p>
            )}

            <div className={styles.scheduleControls}>
              <div className={styles.scheduleField}>
                <label htmlFor="medium-schedule-date">Scheduled date *</label>

                <input
                  id="medium-schedule-date"
                  type="date"
                  min={today}
                  value={scheduledDate}
                  onChange={handleScheduleDateChange}
                  className={styles.input}
                  aria-invalid={scheduleAttemptedSave && !scheduledDate}
                />

                {scheduleAttemptedSave && !scheduledDate && (
                  <p className={styles.error}>Select a date.</p>
                )}
              </div>

              <div className={styles.scheduleField}>
                <label htmlFor="medium-schedule-time">Scheduled time *</label>

                <input
                  id="medium-schedule-time"
                  type="time"
                  min={scheduleTimeMin}
                  value={scheduledTime}
                  onChange={handleScheduleTimeChange}
                  className={styles.input}
                  aria-invalid={scheduleAttemptedSave && !scheduledTime}
                />

                {scheduleAttemptedSave && !scheduledTime && (
                  <p className={styles.error}>Select a time.</p>
                )}
              </div>
            </div>

            <label htmlFor="medium-schedule-draft">Scheduled draft</label>

            <textarea
              id="medium-schedule-draft"
              value={scheduledDraft}
              readOnly
              rows={9}
              className={classNames(styles.input, styles.schedulerTextarea)}
              placeholder="Choose Schedule this post in Make Post to load your draft."
            />

            <div className={styles.schedulerActions}>
              <button
                type="button"
                style={buttonStyle('primary', darkMode)}
                onClick={handleSaveSchedule}
                disabled={!scheduleHasDraft}
              >
                {editingId ? 'Update scheduled post' : 'Save scheduled post'}
              </button>

              <button
                type="button"
                style={buttonStyle('ghost', darkMode)}
                onClick={() => copyText(scheduledDraft, 'Scheduled draft')}
                disabled={!scheduleHasDraft}
              >
                Copy scheduled draft
              </button>

              <button
                type="button"
                style={buttonStyle('outline', darkMode)}
                onClick={editingId ? handleCancelEditing : () => setActiveTab('make')}
              >
                Back to Make Post
              </button>
            </div>
          </section>

          <section className={classNames(styles.card, styles.savedCard)}>
            <h3>Saved scheduled posts</h3>

            <p className={styles.hint}>
              Edit a saved draft, copy it, or open Medium to submit it manually.
            </p>

            <SavedScheduleList
              savedSchedules={savedSchedules}
              editingId={editingId}
              darkMode={darkMode}
              editMediumSchedule={editMediumSchedule}
              openMediumEditor={openMediumEditor}
              handleDeleteSchedule={handleDeleteSchedule}
            />
          </section>
        </div>
      )}
    </div>
  );
}

export default MediumAutoPoster;
