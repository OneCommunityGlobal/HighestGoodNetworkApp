import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import styles from './Reddit.module.css';
import {
  TITLE_MIN,
  TITLE_MAX,
  BODY_MAX,
  sanitizeSubreddit,
  buildPreview,
  formatLocalDate,
  formatLocalTime,
  formatDisplayDateTime,
  clampScheduleDateTime,
  createScheduleId,
  extractFlairSuggestions,
  topCardActions,
  buttonStyle,
  fieldActionRow,
} from './Reddithelpers';

// ─── ScheduleField sub-component ─────────────────────────────────────────────
// Renders a labelled date/time input with inline validation error.

function ScheduleField({ id, type, label, value, min, onChange, attemptedSave, errorText }) {
  const isInvalid = attemptedSave && !value;
  return (
    <div className={styles['reddit-scheduler__field']}>
      <label htmlFor={id}>
        {label} <span className={styles['reddit-field__required']}>*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        onChange={onChange}
        className={classNames(styles['reddit-field__input'], {
          [styles['reddit-field__input--invalid']]: isInvalid,
        })}
        aria-invalid={isInvalid}
      />
      {isInvalid && <p className={styles['reddit-field__error']}>{errorText}</p>}
    </div>
  );
}

ScheduleField.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  min: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  attemptedSave: PropTypes.bool.isRequired,
  errorText: PropTypes.string.isRequired,
};

// ─── RedditAutoPoster ─────────────────────────────────────────────────────────

function RedditAutoPoster({ platform }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [flair, setFlair] = useState('');
  const [body, setBody] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('make');
  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => formatLocalDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatLocalTime(new Date()));
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);
  const [flairSuggestions, setFlairSuggestions] = useState([]);

  const subTabs = useMemo(
    () => [
      { id: 'make', label: '📝 Make Post' },
      { id: 'schedule', label: '⏰ Scheduled Post' },
    ],
    [],
  );

  // ── Derived validation state ──────────────────────────────────────────────

  const trimmedTitle = title.trim();
  const trimmedUrl = url.trim();
  const trimmedSubreddit = subreddit.trim();
  const trimmedBody = body.trim();
  const trimmedFlair = flair.trim();

  const titleInRange = trimmedTitle.length >= TITLE_MIN && trimmedTitle.length <= TITLE_MAX;
  const urlValid = trimmedUrl.length === 0 || /^https?:\/\//i.test(trimmedUrl);
  const subredditValid = trimmedSubreddit.length >= 3 && trimmedSubreddit.length <= 21;
  const bodyValid = trimmedBody.length <= BODY_MAX;

  const readyToCopy = titleInRange && subredditValid;

  const highlightTitle = trimmedTitle.length > 0 && !titleInRange;
  const highlightUrl = trimmedUrl.length > 0 && !urlValid;
  const highlightSubreddit = trimmedSubreddit.length > 0 && !subredditValid;
  const highlightBody = trimmedBody.length > 0 && !bodyValid;

  const hasAnyInput = Boolean(
    trimmedTitle || trimmedUrl || trimmedSubreddit || trimmedBody || trimmedFlair,
  );

  const preview = useMemo(() => {
    if (!hasAnyInput) return '';
    return buildPreview({ title, url, subreddit: trimmedSubreddit, flair, body });
  }, [title, url, trimmedSubreddit, flair, body, hasAnyInput]);

  const scheduleHasDraft = scheduledDraft.trim().length > 0;
  const editingSchedule = useMemo(
    () => savedSchedules.find(s => s.id === editingScheduleId) || null,
    [editingScheduleId, savedSchedules],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const copyText = async (text, label) => {
    const value = text?.trim();
    if (!value) {
      toast.warn(`Nothing to copy for ${label}.`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  const handleReset = () => {
    setTitle('');
    setUrl('');
    setSubreddit('');
    setFlair('');
    setBody('');
    setFlairSuggestions([]);
  };

  const openRedditSubmit = () => {
    const sub = trimmedSubreddit ? `r/${trimmedSubreddit}/` : '';
    window.open(`https://www.reddit.com/${sub}submit`, '_blank', 'noopener,noreferrer');
  };

  const getMissingScheduleFields = () => {
    const missing = [];
    if (!trimmedTitle) missing.push('Title');
    if (!trimmedSubreddit) missing.push('Subreddit');
    return missing.length > 0 ? missing.join(', ') : null;
  };

  const handleScheduleClick = () => {
    if (!hasAnyInput) {
      toast.error('Nothing to schedule yet. Add details in Make Post first.');
      return;
    }
    const missingFields = getMissingScheduleFields();
    if (missingFields) {
      toast.error(`Add ${missingFields} before scheduling.`);
      return;
    }
    const now = new Date();
    setScheduledDate(formatLocalDate(now));
    setScheduledTime(formatLocalTime(now));
    setScheduledDraft(preview);
    setScheduleAttemptedSave(false);
    setActiveSubTab('schedule');
    toast.success('Draft moved to Schedule tab.');
  };

  const now = new Date();
  const today = formatLocalDate(now);
  const currentTime = formatLocalTime(now);
  const scheduleTimeMin = scheduledDate === today ? currentTime : '00:00';

  const applyScheduleDateTime = (nextDate, nextTime) => {
    const { date, time } = clampScheduleDateTime(nextDate, nextTime);
    setScheduledDate(date);
    setScheduledTime(time);
    setScheduleAttemptedSave(false);
  };

  const handleScheduleDateChange = event => {
    if (!event.target.value) return;
    applyScheduleDateTime(event.target.value, scheduledTime);
  };

  const handleScheduleTimeChange = event => {
    if (!event.target.value) return;
    applyScheduleDateTime(scheduledDate, event.target.value);
  };

  const handleBackToMake = () => {
    setScheduleAttemptedSave(false);
    setActiveSubTab('make');
  };

  const handleSaveSchedule = () => {
    setScheduleAttemptedSave(true);
    if (!scheduleHasDraft) {
      toast.warn('Add content to the schedule before saving.');
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error('Choose a schedule date and time.');
      return;
    }
    const isEditing = Boolean(editingScheduleId);
    const recordId = isEditing ? editingScheduleId : createScheduleId();
    const record = {
      id: recordId,
      title,
      url,
      subreddit: trimmedSubreddit,
      flair,
      body,
      scheduledDraft: scheduledDraft.trim(),
      scheduledDate,
      scheduledTime,
      updatedAt: new Date().toISOString(),
    };
    setSavedSchedules(prev => [record, ...prev.filter(item => item.id !== record.id)]);
    toast.success(isEditing ? 'Scheduled post updated.' : 'Scheduled post saved.');
    setScheduleAttemptedSave(false);
    setEditingScheduleId(null);
  };

  const handleEditSchedule = scheduleId => {
    const target = savedSchedules.find(s => s.id === scheduleId);
    if (!target) return;
    const { date, time } = clampScheduleDateTime(target.scheduledDate, target.scheduledTime);
    setTitle(target.title || '');
    setUrl(target.url || '');
    setSubreddit(target.subreddit || '');
    setFlair(target.flair || '');
    setBody(target.body || '');
    setScheduledDraft(target.scheduledDraft || '');
    setScheduledDate(date);
    setScheduledTime(time);
    setScheduleAttemptedSave(false);
    setEditingScheduleId(target.id);
    setActiveSubTab('schedule');
    toast.info('Loaded scheduled post for editing.');
  };

  const handleMakeTabClick = id => {
    if (id === 'make') {
      setEditingScheduleId(null);
      setScheduledDraft('');
      setScheduleAttemptedSave(false);
    }
    setActiveSubTab(id);
  };

  const handleSuggestFlair = () => {
    const suggestions = extractFlairSuggestions(title, body, subreddit);
    setFlairSuggestions(suggestions);
    if (suggestions.length === 0) toast.info('No flair suggestions found.');
  };

  const handleClearFlair = () => {
    setFlair('');
    setFlairSuggestions([]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={classNames(styles['reddit-autoposter'], { [styles.dark]: darkMode })}>
      <div className={classNames(styles['reddit-subtabs'], { [styles.dark]: darkMode })}>
        {subTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={classNames(styles['reddit-subtab'], {
              [styles.active]: activeSubTab === id,
            })}
            onClick={() => handleMakeTabClick(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'make' ? (
        <>
          {/* Top card */}
          <section className={styles['reddit-card']}>
            <h3>Reddit Auto Poster</h3>
            <p>Compose your Reddit post, then copy each field or open Reddit directly.</p>
            <div style={topCardActions()}>
              <button type="button" style={buttonStyle('outline', darkMode)} onClick={handleReset}>
                Clear fields
              </button>
            </div>
          </section>

          <div className={styles['reddit-grid']}>
            {/* Subreddit */}
            <div
              className={classNames(styles['reddit-card'], {
                [styles.invalid]: highlightSubreddit,
              })}
            >
              <div className={styles['reddit-field__header']}>
                <label htmlFor="reddit-subreddit">Subreddit *</label>
                <span
                  className={classNames(styles['reddit-field__meta'], {
                    [styles.invalid]: highlightSubreddit,
                  })}
                >
                  r/
                </span>
              </div>
              <div className={styles['reddit-subreddit-input-wrap']}>
                <span className={styles['reddit-subreddit-prefix']}>r/</span>
                <input
                  id="reddit-subreddit"
                  type="text"
                  value={subreddit}
                  onChange={e => setSubreddit(sanitizeSubreddit(e.target.value))}
                  className={classNames(
                    styles['reddit-field__input'],
                    styles['reddit-field__input--subreddit'],
                    { [styles['reddit-field__input--invalid']]: highlightSubreddit },
                  )}
                  placeholder="programming"
                  maxLength={21}
                />
              </div>
              {!trimmedSubreddit && (
                <p className={styles['reddit-field__hint']}>
                  Enter the subreddit name without the &quot;r/&quot; prefix (3–21 characters).
                </p>
              )}
              {highlightSubreddit && (
                <p className={styles['reddit-field__error']}>
                  Subreddit name must be 3–21 characters (letters, digits, underscores only).
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(`r/${trimmedSubreddit}`, 'Subreddit')}
                >
                  Copy subreddit
                </button>
              </div>
            </div>

            {/* Title */}
            <div
              className={classNames(styles['reddit-card'], { [styles.invalid]: highlightTitle })}
            >
              <div className={styles['reddit-field__header']}>
                <label htmlFor="reddit-title">Title *</label>
                <span
                  className={classNames(styles['reddit-field__meta'], {
                    [styles.invalid]: highlightTitle,
                  })}
                >
                  {title.trim().length}/{TITLE_MAX}
                </span>
              </div>
              <input
                id="reddit-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={classNames(styles['reddit-field__input'], {
                  [styles['reddit-field__input--invalid']]: highlightTitle,
                })}
                placeholder="e.g. Open-source tool achieves 10x performance improvement"
                maxLength={TITLE_MAX}
              />
              {!trimmedTitle && (
                <p className={styles['reddit-field__hint']}>
                  Keep titles clear and specific. Reddit allows up to {TITLE_MAX} characters.
                </p>
              )}
              {highlightTitle && (
                <p className={styles['reddit-field__error']}>
                  Title must be at least {TITLE_MIN} characters.
                </p>
              )}
              <div style={fieldActionRow}>
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
            </div>

            {/* URL */}
            <div className={classNames(styles['reddit-card'], { [styles.invalid]: highlightUrl })}>
              <div className={styles['reddit-field__header']}>
                <label htmlFor="reddit-url">URL</label>
                <span className={styles['reddit-field__meta']}>optional</span>
              </div>
              <input
                id="reddit-url"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className={classNames(styles['reddit-field__input'], {
                  [styles['reddit-field__input--invalid']]: highlightUrl,
                })}
                placeholder="https://"
              />
              {!trimmedUrl && (
                <p className={styles['reddit-field__hint']}>
                  Paste the full URL you want to share. Must start with http:// or https://.
                </p>
              )}
              {highlightUrl && (
                <p className={styles['reddit-field__error']}>
                  Enter a valid URL starting with http:// or https://.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(url, 'URL')}
                >
                  Copy URL
                </button>
              </div>
            </div>

            {/* Flair */}
            <div className={styles['reddit-card']}>
              <div className={styles['reddit-field__header']}>
                <label htmlFor="reddit-flair">Flair</label>
                <span className={styles['reddit-field__meta']}>optional</span>
              </div>
              <input
                id="reddit-flair"
                type="text"
                value={flair}
                onChange={e => setFlair(e.target.value)}
                className={styles['reddit-field__input']}
                placeholder="e.g. Discussion, News, Question"
              />
              {!trimmedFlair && (
                <p className={styles['reddit-field__hint']}>
                  Smart flair suggestions are based on your title and content.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleSuggestFlair}
                >
                  Suggest flair
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(flair, 'Flair')}
                >
                  Copy flair
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleClearFlair}
                >
                  Clear flair
                </button>
              </div>
              {flairSuggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                  {flairSuggestions.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFlair(item)}
                      style={{
                        borderRadius: '999px',
                        padding: '6px 12px',
                        border: darkMode ? '1px solid #444' : '1px solid #ddd',
                        background: darkMode ? '#1f2937' : '#f3f4f6',
                        cursor: 'pointer',
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div
              className={classNames(styles['reddit-card'], styles['reddit-card--wide'], {
                [styles.invalid]: highlightBody,
              })}
            >
              <div className={styles['reddit-field__header']}>
                <label htmlFor="reddit-body">Body</label>
                <span
                  className={classNames(styles['reddit-field__meta'], {
                    [styles.invalid]: highlightBody,
                  })}
                >
                  {body.trim().length}/{BODY_MAX}
                </span>
              </div>
              <textarea
                id="reddit-body"
                value={body}
                onChange={e => setBody(e.target.value)}
                className={classNames(
                  styles['reddit-field__input'],
                  styles['reddit-field__textarea'],
                  { [styles['reddit-field__input--invalid']]: highlightBody },
                )}
                rows={6}
                placeholder="Write your post body here. Markdown is supported on Reddit."
                maxLength={BODY_MAX}
              />
              {!trimmedBody && (
                <p className={styles['reddit-field__hint']}>
                  Optional body text. Markdown formatting is supported.
                </p>
              )}
              {highlightBody && (
                <p className={styles['reddit-field__error']}>
                  Body exceeds Reddit&apos;s {BODY_MAX.toLocaleString()}-character limit.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(body, 'Body')}
                >
                  Copy body
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setBody('')}
                >
                  Clear body
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <section className={styles['reddit-card']}>
            <div className={styles['reddit-preview__header']}>
              <h4>Submission preview</h4>
              <div className={styles['reddit-preview__actions']}>
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
                  onClick={openRedditSubmit}
                >
                  Open reddit.com/submit
                </button>
                <button
                  type="button"
                  style={{ ...buttonStyle('primary', darkMode), opacity: readyToCopy ? 1 : 0.5 }}
                  onClick={() => copyText(preview, 'Reddit draft')}
                  disabled={!readyToCopy}
                >
                  Copy full draft
                </button>
              </div>
            </div>
            <pre className={styles['reddit-preview__body']}>{preview}</pre>
            {!readyToCopy && (
              <p className={styles['reddit-preview__hint']}>
                Fill every required field to enable copying the complete draft.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className={styles['reddit-scheduler__grid']}>
          <section className={classNames(styles['reddit-card'], styles['reddit-card--scheduler'])}>
            <h3>Schedule Reddit Post</h3>
            <p>Set your scheduled date and time, then save the post for later submission.</p>
            {editingSchedule && (
              <p className={styles['reddit-scheduler__note']}>
                Editing saved schedule &quot;{editingSchedule.title || 'Untitled draft'}&quot;.
                Saving will overwrite the existing entry.
              </p>
            )}
            <div className={styles['reddit-scheduler__controls']}>
              <ScheduleField
                id="reddit-schedule-date"
                type="date"
                label="Scheduled date"
                value={scheduledDate}
                min={today}
                onChange={handleScheduleDateChange}
                attemptedSave={scheduleAttemptedSave}
                errorText="Select a schedule date."
              />
              <ScheduleField
                id="reddit-schedule-time"
                type="time"
                label="Scheduled time"
                value={scheduledTime}
                min={scheduleTimeMin}
                onChange={handleScheduleTimeChange}
                attemptedSave={scheduleAttemptedSave}
                errorText="Select a schedule time."
              />
            </div>
            <label htmlFor="reddit-schedule-content">Scheduled draft</label>
            <textarea
              id="reddit-schedule-content"
              value={scheduledDraft}
              className={classNames(
                styles['reddit-field__input'],
                styles['reddit-scheduler__textarea'],
              )}
              placeholder='Click "Schedule this post" in the Make Post tab to load content here.'
              rows={8}
              readOnly
            />
            <div className={styles['reddit-scheduler__actions']}>
              <button
                type="button"
                style={buttonStyle('primary', darkMode)}
                onClick={handleSaveSchedule}
                disabled={!scheduleHasDraft}
              >
                {editingScheduleId ? 'Update scheduled post' : 'Save scheduled post'}
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
                onClick={handleBackToMake}
              >
                Back to Make Post
              </button>
            </div>
          </section>

          <section className={classNames(styles['reddit-card'], styles['reddit-card--saved'])}>
            <h3>Saved scheduled posts</h3>
            <p className={styles['reddit-field__hint']}>
              Choose a saved entry to continue editing or submit it to Reddit.
            </p>
            <div className={styles['reddit-saved__list']}>
              {savedSchedules.length === 0 ? (
                <p className={styles['reddit-scheduler__empty']}>
                  No saved scheduled posts yet. Save one to see it listed here.
                </p>
              ) : (
                savedSchedules.map(schedule => {
                  const isActive = schedule.id === editingScheduleId;
                  const excerpt =
                    schedule.scheduledDraft && schedule.scheduledDraft.length > 140
                      ? `${schedule.scheduledDraft.slice(0, 140).trim()}...`
                      : schedule.scheduledDraft || 'No content captured.';
                  return (
                    <article
                      key={schedule.id}
                      className={classNames(styles['reddit-saved__item'], {
                        [styles['reddit-saved__item--active']]: isActive,
                      })}
                    >
                      <div className={styles['reddit-saved__header']}>
                        <h4 className={styles['reddit-saved__title']}>
                          {schedule.title || 'Untitled draft'}
                        </h4>
                        <span className={styles['reddit-saved__meta']}>
                          {formatDisplayDateTime(schedule.scheduledDate, schedule.scheduledTime)}
                        </span>
                      </div>
                      <p className={styles['reddit-saved__excerpt']}>{excerpt}</p>
                      <div className={styles['reddit-saved__actions']}>
                        <button
                          type="button"
                          style={buttonStyle('ghost', darkMode)}
                          onClick={() => handleEditSchedule(schedule.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          style={buttonStyle('outline', darkMode)}
                          onClick={openRedditSubmit}
                        >
                          Submit
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

RedditAutoPoster.propTypes = {
  platform: PropTypes.string,
};

RedditAutoPoster.defaultProps = {
  platform: 'reddit',
};

export default RedditAutoPoster;
