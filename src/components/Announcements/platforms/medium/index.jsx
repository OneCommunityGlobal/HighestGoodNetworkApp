import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './MediumAutoPoster.module.css';

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

const pad = value => String(value).padStart(2, '0');

const formatDate = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatTime = date => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const formatDateTime = (date, time) => {
  if (!date) return 'Date unavailable';

  const parsed = new Date(`${date}T${time || '00:00'}`);

  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: time ? 'short' : undefined,
      });
};

const makeId = () =>
  `medium-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const buttonStyle = (variant, darkMode) => {
  const base = {
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '10px 18px',
    transition: 'filter 0.2s ease',
  };

  if (variant === 'primary') {
    return { ...base, backgroundColor: '#0d6efd', color: '#fff' };
  }

  if (variant === 'outline') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: darkMode ? '#9bb5ff' : '#0d6efd',
      border: `1px solid ${darkMode ? '#3d4d6d' : '#0d6efd'}`,
    };
  }

  return {
    ...base,
    backgroundColor: darkMode ? '#1c2b44' : '#e9efff',
    color: darkMode ? '#cfd9f8' : '#1c3f82',
  };
};

function MediumAutoPoster() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [activeTab, setActiveTab] = useState('make');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [visibility, setVisibility] = useState('draft');

  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => formatDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatTime(new Date()));
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);

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

  const preview = useMemo(
    () => (hasInput ? buildDraft() : ''),
    // The preview should update whenever the editor fields change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, content, tagsText, canonicalUrl, visibility, hasInput],
  );

  const editingSchedule = useMemo(
    () => savedSchedules.find(item => item.id === editingId) || null,
    [savedSchedules, editingId],
  );

  const scheduleHasDraft = Boolean(scheduledDraft.trim());

  const copyText = async (text, label) => {
    if (!text?.trim()) {
      toast.warn(`Nothing to copy for ${label}.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard.`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  const resetEditor = () => {
    setTitle('');
    setContent('');
    setTagsText('');
    setCanonicalUrl('');
    setVisibility('draft');
  };

  const validateArticle = () => {
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

  const handleReset = () => {
    resetEditor();
    toast.info('Editor fields cleared.');
  };

  const handleScheduleClick = () => {
    if (!validateArticle()) return;

    const now = new Date();

    setScheduledDate(formatDate(now));
    setScheduledTime(formatTime(now));
    setScheduledDraft(preview);
    setScheduleAttemptedSave(false);
    setEditingId(null);
    setActiveTab('schedule');

    toast.success('Draft moved to the Schedule tab.');
  };

  const handleScheduleDateChange = event => {
    const nextDate = event.target.value;
    if (!nextDate) return;

    const today = formatDate(new Date());
    const safeDate = nextDate < today ? today : nextDate;

    setScheduledDate(safeDate);
    setScheduleAttemptedSave(false);

    if (safeDate === today) {
      const currentTime = formatTime(new Date());
      setScheduledTime(previous => (!previous || previous < currentTime ? currentTime : previous));
    }
  };

  const handleScheduleTimeChange = event => {
    const nextTime = event.target.value;
    if (!nextTime) return;

    if (scheduledDate === formatDate(new Date())) {
      const currentTime = formatTime(new Date());
      setScheduledTime(nextTime < currentTime ? currentTime : nextTime);
    } else {
      setScheduledTime(nextTime);
    }

    setScheduleAttemptedSave(false);
  };

  const handleSaveSchedule = () => {
    setScheduleAttemptedSave(true);

    if (!scheduleHasDraft) {
      toast.warn('Add an article to the schedule first.');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error('Choose a schedule date and time.');
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);

    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      toast.error('Choose a future date and time.');
      return;
    }

    const id = editingId || makeId();

    const record = {
      id,
      title: trimmedTitle,
      content: trimmedContent,
      tags: [...tags],
      tagsText,
      canonicalUrl: trimmedUrl,
      visibility,
      scheduledDraft: scheduledDraft.trim(),
      scheduledDate,
      scheduledTime,
      updatedAt: new Date().toISOString(),
    };

    setSavedSchedules(previous => [record, ...previous.filter(item => item.id !== id)]);

    toast.success(
      editingId
        ? 'Scheduled draft updated for this session.'
        : 'Scheduled draft saved for this session.',
    );

    resetEditor();
    setScheduledDraft('');
    setScheduledDate(formatDate(new Date()));
    setScheduledTime(formatTime(new Date()));
    setScheduleAttemptedSave(false);
    setEditingId(null);
    setActiveTab('make');
  };

  const handleEditSchedule = item => {
    const today = formatDate(new Date());
    let date = item.scheduledDate || today;
    let time = item.scheduledTime || formatTime(new Date());

    if (date < today) date = today;

    if (date === today && time < formatTime(new Date())) {
      time = formatTime(new Date());
    }

    setTitle(item.title || '');
    setContent(item.content || '');
    setTagsText(item.tagsText || '');
    setCanonicalUrl(item.canonicalUrl || '');
    setVisibility(item.visibility || 'draft');

    setScheduledDraft(item.scheduledDraft || '');
    setScheduledDate(date);
    setScheduledTime(time);
    setEditingId(item.id);
    setScheduleAttemptedSave(false);
    setActiveTab('schedule');

    toast.info('Loaded scheduled draft for editing.');
  };

  const handleDeleteSchedule = id => {
    setSavedSchedules(previous => previous.filter(item => item.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setScheduledDraft('');
    }

    toast.info('Scheduled draft removed from this session.');
  };

  const openMediumEditor = () => {
    window.open('https://medium.com/new-story', '_blank', 'noopener,noreferrer');
  };

  const removeTag = tagToRemove => {
    setTagsText(tags.filter(tag => tag !== tagToRemove).join(', '));
  };

  const today = formatDate(new Date());
  const scheduleTimeMin = scheduledDate === today ? formatTime(new Date()) : undefined;

  return (
    <div
      className={classNames(styles['medium-autoposter'], {
        [styles.dark]: darkMode,
      })}
      data-testid="medium-auto-poster"
    >
      <div className={styles.subtabs}>
        {[
          { id: 'make', label: '📝 Make Post' },
          { id: 'schedule', label: '⏰ Scheduled Post' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className={classNames(styles.subtab, {
              [styles.active]: activeTab === tab.id,
            })}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                onClick={() => setActiveTab('make')}
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

            <div className={styles.savedList}>
              {savedSchedules.length === 0 ? (
                <p className={styles.empty}>
                  No scheduled posts yet. Save one to see it listed here.
                </p>
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
                      {item.content.length > 140
                        ? `${item.content.slice(0, 140).trim()}…`
                        : item.content || 'No content captured.'}
                    </p>

                    <div className={styles.savedActions}>
                      <button
                        type="button"
                        style={buttonStyle('ghost', darkMode)}
                        onClick={() => handleEditSchedule(item)}
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
          </section>
        </div>
      )}
    </div>
  );
}

export default MediumAutoPoster;
