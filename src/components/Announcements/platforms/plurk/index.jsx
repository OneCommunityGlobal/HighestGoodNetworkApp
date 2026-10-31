import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './PlurkAutoPoster.module.css';

const PLURK_MAX = 360;
const STORAGE_KEY = 'plurk-auto-poster-schedules';

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
  `plurk-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const readSchedules = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

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
    return { ...base, backgroundColor: '#6554d9', color: '#fff' };
  }

  if (variant === 'outline') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: darkMode ? '#9bb5ff' : '#6554d9',
      border: `1px solid ${darkMode ? '#3d4d6d' : '#6554d9'}`,
    };
  }

  return {
    ...base,
    backgroundColor: darkMode ? '#1c2b44' : '#eeeaff',
    color: darkMode ? '#cfd9f8' : '#5141a8',
  };
};

function PlurkAutoPoster() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [activeTab, setActiveTab] = useState('make');
  const [content, setContent] = useState('');
  const [qualifier, setQualifier] = useState('says');
  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledQualifier, setScheduledQualifier] = useState('says');
  const [scheduledDate, setScheduledDate] = useState(() => formatDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatTime(new Date()));
  const [savedSchedules, setSavedSchedules] = useState(readSchedules);
  const [editingId, setEditingId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);

  const trimmedContent = content.trim();
  const contentValid = trimmedContent.length > 0 && trimmedContent.length <= PLURK_MAX;
  const hasInput = Boolean(trimmedContent);
  const readyToCopy = contentValid;

  const preview = useMemo(() => {
    if (!hasInput) return '';
    return `${qualifier} ${trimmedContent}`;
  }, [qualifier, trimmedContent, hasInput]);

  const editingSchedule = useMemo(
    () => savedSchedules.find(item => item.id === editingId) || null,
    [savedSchedules, editingId],
  );

  const scheduleHasDraft = Boolean(scheduledDraft.trim());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSchedules));
    } catch {
      toast.error('Could not save scheduled posts in this browser.');
    }
  }, [savedSchedules]);

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
    setContent('');
    setQualifier('says');
  };

  const validatePost = () => {
    if (!trimmedContent) {
      toast.error('Please enter your Plurk post content.');
      return false;
    }

    if (trimmedContent.length > PLURK_MAX) {
      toast.error(`Plurk content must not exceed ${PLURK_MAX} characters.`);
      return false;
    }

    return true;
  };

  const handleReset = () => {
    resetEditor();
    toast.info('Post editor cleared.');
  };

  const handleScheduleClick = () => {
    if (!validatePost()) return;

    const now = new Date();
    setScheduledDate(formatDate(now));
    setScheduledTime(formatTime(now));
    setScheduledDraft(trimmedContent);
    setScheduledQualifier(qualifier);
    setScheduleAttemptedSave(false);
    setEditingId(null);
    setActiveTab('schedule');
    toast.success('Post moved to the Schedule tab.');
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
      toast.warn('Add a Plurk post to the schedule first.');
      return;
    }

    if (scheduledDraft.trim().length > PLURK_MAX) {
      toast.error(`Plurk content must not exceed ${PLURK_MAX} characters.`);
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
      content: scheduledDraft.trim(),
      qualifier: scheduledQualifier,
      scheduledDate,
      scheduledTime,
      updatedAt: new Date().toISOString(),
      status: 'scheduled',
    };

    setSavedSchedules(previous => [record, ...previous.filter(item => item.id !== id)]);

    toast.success(
      editingId ? 'Scheduled Plurk post updated.' : 'Plurk post saved to your schedule.',
    );

    resetEditor();
    setScheduledDraft('');
    setScheduledQualifier('says');
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

    setContent(item.content || '');
    setQualifier(item.qualifier || 'says');
    setScheduledDraft(item.content || '');
    setScheduledQualifier(item.qualifier || 'says');
    setScheduledDate(date);
    setScheduledTime(time);
    setEditingId(item.id);
    setScheduleAttemptedSave(false);
    setActiveTab('schedule');
    toast.info('Loaded scheduled Plurk post for editing.');
  };

  const handleDeleteSchedule = id => {
    setSavedSchedules(previous => previous.filter(item => item.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setScheduledDraft('');
    }

    toast.info('Scheduled Plurk post deleted.');
  };

  const removeScheduledDraft = () => {
    setScheduledDraft('');
    setEditingId(null);
    setScheduleAttemptedSave(false);
  };

  const openPlurk = () => {
    window.open('https://www.plurk.com/', '_blank', 'noopener,noreferrer');
  };

  const today = formatDate(new Date());
  const scheduleTimeMin = scheduledDate === today ? formatTime(new Date()) : undefined;

  return (
    <div
      className={classNames(styles['medium-autoposter'], {
        [styles.dark]: darkMode,
      })}
      data-testid="plurk-auto-poster"
    >
      <div className={styles.subtabs}>
        {[
          { id: 'make', label: '📝 Make Plurk' },
          { id: 'schedule', label: '⏰ Scheduled Posts' },
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
            <h3>Plurk Auto-Poster</h3>
            <p>
              Compose a short Plurk post, choose a qualifier, preview the result, and save it for a
              future date and time. This frontend stores scheduled posts locally and does not
              publish to Plurk.
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
                [styles.invalid]: hasInput && !contentValid,
              })}
            >
              <div className={styles.fieldHeader}>
                <label htmlFor="plurk-content">Post content *</label>
                <span
                  className={classNames(styles.fieldMeta, {
                    [styles.invalidText]: hasInput && !contentValid,
                  })}
                >
                  {content.length}/{PLURK_MAX}
                </span>
              </div>

              <textarea
                id="plurk-content"
                value={content}
                maxLength={PLURK_MAX}
                onChange={event => setContent(event.target.value)}
                className={classNames(styles.input, styles.textarea)}
                rows={7}
                placeholder="What would you like to Plurk?"
              />

              <p className={styles.hint}>
                Write your post here. You can include hashtags and links directly in the text.
              </p>

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(content, 'Post content')}
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

            <section className={styles.card}>
              <div className={styles.fieldHeader}>
                <label htmlFor="plurk-qualifier">Post qualifier</label>
                <span className={styles.fieldMeta}>required</span>
              </div>

              <select
                id="plurk-qualifier"
                value={qualifier}
                onChange={event => setQualifier(event.target.value)}
                className={styles.input}
              >
                <option value="says">says</option>
                <option value="thinks">thinks</option>
                <option value="feels">feels</option>
                <option value="shares">shares</option>
                <option value="likes">likes</option>
                <option value="loves">loves</option>
                <option value="asks">asks</option>
                <option value="wonders">wonders</option>
                <option value="hopes">hopes</option>
                <option value="wishes">wishes</option>
                <option value="needs">needs</option>
                <option value="wants">wants</option>
                <option value="will">will</option>
                <option value="was">was</option>
                <option value="has">has</option>
                <option value="gives">gives</option>
                <option value="hates">hates</option>
              </select>

              <p className={styles.hint}>
                The qualifier appears before your post, such as “says” or “thinks”.
              </p>

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setQualifier('says')}
                >
                  Reset qualifier
                </button>
              </div>
            </section>
          </div>

          <section className={styles.card}>
            <div className={styles.previewHeader}>
              <h4>Plurk preview</h4>
              <div className={styles.previewActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleScheduleClick}
                >
                  Schedule this post
                </button>

                <button type="button" style={buttonStyle('outline', darkMode)} onClick={openPlurk}>
                  Open Plurk
                </button>

                <button
                  type="button"
                  style={{
                    ...buttonStyle('primary', darkMode),
                    opacity: readyToCopy ? 1 : 0.5,
                  }}
                  onClick={() => copyText(preview, 'Plurk post')}
                  disabled={!readyToCopy}
                >
                  Copy post
                </button>
              </div>
            </div>

            <pre className={styles.previewBody}>
              {preview || 'Your Plurk preview will appear here as you type.'}
            </pre>

            {!readyToCopy && (
              <p className={styles.previewHint}>
                Enter post content to enable copying and scheduling.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className={styles.schedulerGrid}>
          <section className={classNames(styles.card, styles.schedulerCard)}>
            <h3>Schedule Plurk Post</h3>
            <p>
              Choose when you want to post. Schedule entries are stored in this browser only; this
              page does not publish automatically.
            </p>

            {editingSchedule && (
              <p className={styles.schedulerNote}>
                Editing this scheduled Plurk post. Saving will update the existing entry.
              </p>
            )}

            <div className={styles.scheduleControls}>
              <div className={styles.scheduleField}>
                <label htmlFor="plurk-schedule-date">Scheduled date *</label>
                <input
                  id="plurk-schedule-date"
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
                <label htmlFor="plurk-schedule-time">Scheduled time *</label>
                <input
                  id="plurk-schedule-time"
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

            <label htmlFor="plurk-schedule-qualifier">Qualifier</label>
            <select
              id="plurk-schedule-qualifier"
              value={scheduledQualifier}
              onChange={event => setScheduledQualifier(event.target.value)}
              className={styles.input}
            >
              <option value="says">says</option>
              <option value="thinks">thinks</option>
              <option value="feels">feels</option>
              <option value="shares">shares</option>
              <option value="likes">likes</option>
              <option value="loves">loves</option>
              <option value="asks">asks</option>
              <option value="wonders">wonders</option>
              <option value="hopes">hopes</option>
              <option value="wishes">wishes</option>
              <option value="needs">needs</option>
              <option value="wants">wants</option>
              <option value="will">will</option>
              <option value="was">was</option>
              <option value="has">has</option>
              <option value="gives">gives</option>
              <option value="hates">hates</option>
            </select>

            <label htmlFor="plurk-schedule-draft">Scheduled post</label>
            <textarea
              id="plurk-schedule-draft"
              value={scheduledDraft}
              onChange={event => setScheduledDraft(event.target.value)}
              maxLength={PLURK_MAX}
              rows={7}
              className={classNames(styles.input, styles.schedulerTextarea)}
              placeholder="Use Schedule this post in Make Plurk to load your post."
            />
            <p className={styles.hint}>
              {scheduledDraft.length}/{PLURK_MAX} characters
            </p>

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
                onClick={() => copyText(scheduledDraft, 'Scheduled post')}
                disabled={!scheduleHasDraft}
              >
                Copy scheduled post
              </button>

              <button
                type="button"
                style={buttonStyle('outline', darkMode)}
                onClick={removeScheduledDraft}
              >
                Clear schedule editor
              </button>

              <button
                type="button"
                style={buttonStyle('outline', darkMode)}
                onClick={() => setActiveTab('make')}
              >
                Back to Make Plurk
              </button>
            </div>
          </section>

          <section className={classNames(styles.card, styles.savedCard)}>
            <h3>Saved scheduled posts</h3>
            <p className={styles.hint}>Edit, copy, or delete posts saved in this browser.</p>

            <div className={styles.savedList}>
              {savedSchedules.length === 0 ? (
                <p className={styles.empty}>
                  No scheduled posts yet. Save a post to see it listed here.
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
                      <h4 className={styles.savedTitle}>{item.qualifier || 'says'} · Plurk post</h4>
                      <span className={styles.savedMeta}>
                        {formatDateTime(item.scheduledDate, item.scheduledTime)}
                      </span>
                    </div>

                    <p className={styles.savedExcerpt}>
                      {item.content.length > 140
                        ? `${item.content.slice(0, 140).trim()}…`
                        : item.content || 'No post content.'}
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
                        onClick={() =>
                          copyText(
                            `${item.qualifier || 'says'} ${item.content}`,
                            'Scheduled Plurk post',
                          )
                        }
                      >
                        Copy
                      </button>

                      <button
                        type="button"
                        style={buttonStyle('outline', darkMode)}
                        onClick={openPlurk}
                      >
                        Open Plurk
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

export default PlurkAutoPoster;
