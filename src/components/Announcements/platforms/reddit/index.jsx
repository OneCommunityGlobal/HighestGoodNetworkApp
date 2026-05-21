import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import styles from './Reddit.module.css';

const TITLE_MIN = 5;
const TITLE_MAX = 300;
const BODY_MAX = 40000;

const STOP_WORDS = new Set([
  'about',
  'after',
  'also',
  'another',
  'because',
  'been',
  'being',
  'between',
  'can',
  'could',
  'during',
  'each',
  'from',
  'have',
  'into',
  'more',
  'other',
  'over',
  'since',
  'some',
  'than',
  'that',
  'their',
  'there',
  'these',
  'they',
  'this',
  'through',
  'under',
  'until',
  'where',
  'which',
  'while',
  'with',
  'within',
]);

const FLAIR_RULES = [
  {
    flair: 'Question',
    patterns: [/\?/, /\bhow\b/, /\bwhat\b/, /\bwhy\b/, /\bhelp\b/, /\bissue\b/, /\bproblem\b/],
  },
  {
    flair: 'Discussion',
    patterns: [/\bdiscussion\b/, /\bthoughts\b/, /\bopinion\b/, /\bdebate\b/, /\bshould\b/],
  },
  {
    flair: 'News',
    patterns: [
      /\bnews\b/,
      /\breleased\b/,
      /\blaunch\b/,
      /\bannouncement\b/,
      /\bupdate\b/,
      /\bbreaking\b/,
    ],
  },
  {
    flair: 'Tutorial',
    patterns: [/\btutorial\b/, /\bguide\b/, /\bstep[- ]by[- ]step\b/, /\blearn\b/],
  },
  {
    flair: 'Showcase',
    patterns: [/\bshowcase\b/, /\bproject\b/, /\bbuilt\b/, /\bmade\b/, /\bcreated\b/],
  },
  {
    flair: 'Bug',
    patterns: [/\bbug\b/, /\berror\b/, /\bfix\b/, /\bcrash\b/, /\bissue\b/],
  },
];

// Subreddit name must be 3-21 chars, letters/digits/underscores only
const sanitizeSubreddit = raw =>
  raw
    .trim()
    .replace(/^r\//, '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 21);

const extractFlairSuggestions = (title, body, subreddit = '') => {
  const text = `${title} ${body}`.toLowerCase();

  // subreddit-specific suggestions
  const subredditSuggestions = {
    reactjs: ['Help', 'Discussion', 'Showcase'],
    javascript: ['Question', 'Discussion', 'News'],
    programming: ['Discussion', 'News', 'Tutorial'],
    webdev: ['Showcase', 'Tutorial', 'Question'],
  };

  const normalizedSubreddit = subreddit.toLowerCase();

  if (subredditSuggestions[normalizedSubreddit]) {
    return subredditSuggestions[normalizedSubreddit];
  }

  const matchedFlairs = [];

  for (const rule of FLAIR_RULES) {
    const matched = rule.patterns.some(pattern => pattern.test(text));

    if (matched && !matchedFlairs.includes(rule.flair)) {
      matchedFlairs.push(rule.flair);
    }
  }

  // fallback keyword extraction
  if (matchedFlairs.length === 0) {
    const words = text.match(/[a-z0-9']+/g) || [];

    const keywords = words
      .map(word => word.replace(/'/g, ''))
      .filter(word => word.length >= 4 && !STOP_WORDS.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 3);

    return keywords;
  }

  return matchedFlairs;
};

const buildPreview = ({ title, url, subreddit, flair, body }) =>
  `Subreddit\nr/${subreddit?.trim() || '—'}\n\nTitle\n${title?.trim() ||
    '—'}\n\nURL\n${url?.trim() || '—'}\n\nBody\n${body?.trim() || '—'}\n\nFlair\n${flair?.trim() ||
    '(none)'}\n`;

const padTimeUnit = value => String(value).padStart(2, '0');

const formatLocalDate = date =>
  `${date.getFullYear()}-${padTimeUnit(date.getMonth() + 1)}-${padTimeUnit(date.getDate())}`;

const formatLocalTime = date => `${padTimeUnit(date.getHours())}:${padTimeUnit(date.getMinutes())}`;

const getSecureBase36 = length => {
  const chars = [];
  const max = 36 * 7;
  while (chars.length < length) {
    const bytes = new Uint8Array(length);
    globalThis.crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= max) continue;
      chars.push((byte % 36).toString(36));
      if (chars.length === length) break;
    }
  }
  return chars.join('');
};

const createScheduleId = () => `schedule-${Date.now().toString(36)}-${getSecureBase36(6)}`;

const formatDisplayDateTime = (dateString, timeString) => {
  if (!dateString) return '—';
  try {
    const composed = `${dateString}T${timeString || '00:00'}`;
    const parsed = new Date(composed);
    if (Number.isNaN(parsed.getTime())) {
      return `${dateString}${timeString ? `, ${timeString}` : ''}`;
    }
    const formattedDate = parsed.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = timeString
      ? parsed.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      : '';
    return formattedTime ? `${formattedDate} • ${formattedTime}` : formattedDate;
  } catch {
    return `${dateString}${timeString ? `, ${timeString}` : ''}`;
  }
};

const topCardActions = () => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '16px',
});

const buttonStyle = (variant, darkMode) => {
  const base = {
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '10px 18px',
    transition: 'filter 0.2s ease',
  };
  if (variant === 'primary') return { ...base, backgroundColor: '#ff4500', color: '#fff' };
  if (variant === 'outline')
    return {
      ...base,
      backgroundColor: 'transparent',
      color: darkMode ? '#ff8060' : '#ff4500',
      border: `1px solid ${darkMode ? '#6b3020' : '#ff4500'}`,
    };
  return {
    ...base,
    backgroundColor: darkMode ? '#1c2b44' : '#fff0eb',
    color: darkMode ? '#ffb8a0' : '#a33000',
  };
};

const fieldActionRow = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' };

const clampScheduleDateTime = (targetDate, targetTime) => {
  const refreshedToday = formatLocalDate(new Date());
  const date = !targetDate || targetDate < refreshedToday ? refreshedToday : targetDate;

  let time = targetTime || '00:00';
  if (date === refreshedToday) {
    const refreshedTime = formatLocalTime(new Date());
    if (time < refreshedTime) time = refreshedTime;
  }

  return { date, time };
};
const normalizeDate = (nextDateRaw, today) => {
  if (!nextDateRaw) return null;
  return nextDateRaw < today ? today : nextDateRaw;
};

const normalizeTimeForDate = (nextTimeRaw, scheduledDate, today) => {
  if (!nextTimeRaw) return null;

  // If scheduling for today, ensure time is not in the past
  if (scheduledDate === today) {
    const refreshedTime = formatLocalTime(new Date());
    return nextTimeRaw >= refreshedTime ? nextTimeRaw : refreshedTime;
  }

  return nextTimeRaw;
};
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

  const handleScheduleClick = () => {
    if (!hasAnyInput) {
      toast.error('Nothing to schedule yet. Add details in Make Post first.');
      return;
    }
    const missing = [];
    if (!trimmedTitle) missing.push('Title');
    if (!trimmedSubreddit) missing.push('Subreddit');
    if (missing.length > 0) {
      toast.error(`Add ${missing.join(', ')} before scheduling.`);
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

  const handleScheduleDateChange = event => {
    const nextDate = normalizeDate(event.target.value, today);
    if (!nextDate) return;

    setScheduledDate(nextDate);
    setScheduleAttemptedSave(false);

    if (nextDate === today) {
      const refreshedTime = formatLocalTime(new Date());
      setScheduledTime(prev => (prev && prev >= refreshedTime ? prev : refreshedTime));
    }
  };

  const handleScheduleTimeChange = event => {
    const nextTime = event.target.value;
    if (!nextTime) return;

    const normalized = normalizeTimeForDate(nextTime, scheduledDate, today);

    setScheduledTime(normalized);
    setScheduleAttemptedSave(false);
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
            onClick={() => {
              if (id === 'make') {
                setEditingScheduleId(null);
                setScheduledDraft('');
                setScheduleAttemptedSave(false);
              }
              setActiveSubTab(id);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'make' ? (
        <>
          {/* Top card – post type toggle */}
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
                    {
                      [styles['reddit-field__input--invalid']]: highlightSubreddit,
                    },
                  )}
                  placeholder="programming"
                  maxLength={21}
                />
              </div>
              {!trimmedSubreddit && (
                <p className={styles['reddit-field__hint']}>
                  Enter the subreddit name without the "r/" prefix (3–21 characters).
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
                  onClick={() => {
                    const suggestions = extractFlairSuggestions(title, body, subreddit);

                    setFlairSuggestions(suggestions);

                    if (suggestions.length === 0) {
                      toast.info('No flair suggestions found.');
                    }
                  }}
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
                  onClick={() => {
                    setFlair('');
                    setFlairSuggestions([]);
                  }}
                >
                  Clear flair
                </button>
              </div>
              {flairSuggestions.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '14px',
                  }}
                >
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
                  Body exceeds Reddit's {BODY_MAX.toLocaleString()}-character limit.
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
                Editing saved schedule "{editingSchedule.title || 'Untitled draft'}". Saving will
                overwrite the existing entry.
              </p>
            )}
            <div className={styles['reddit-scheduler__controls']}>
              <div className={styles['reddit-scheduler__field']}>
                <label htmlFor="reddit-schedule-date">
                  Scheduled date <span className={styles['reddit-field__required']}>*</span>
                </label>
                <input
                  id="reddit-schedule-date"
                  type="date"
                  value={scheduledDate}
                  min={today}
                  onChange={handleScheduleDateChange}
                  className={classNames(styles['reddit-field__input'], {
                    [styles['reddit-field__input--invalid']]:
                      scheduleAttemptedSave && !scheduledDate,
                  })}
                  aria-invalid={scheduleAttemptedSave && !scheduledDate}
                />
                {scheduleAttemptedSave && !scheduledDate && (
                  <p className={styles['reddit-field__error']}>Select a schedule date.</p>
                )}
              </div>
              <div className={styles['reddit-scheduler__field']}>
                <label htmlFor="reddit-schedule-time">
                  Scheduled time <span className={styles['reddit-field__required']}>*</span>
                </label>
                <input
                  id="reddit-schedule-time"
                  type="time"
                  value={scheduledTime}
                  min={scheduleTimeMin}
                  onChange={handleScheduleTimeChange}
                  className={classNames(styles['reddit-field__input'], {
                    [styles['reddit-field__input--invalid']]:
                      scheduleAttemptedSave && !scheduledTime,
                  })}
                  aria-invalid={scheduleAttemptedSave && !scheduledTime}
                />
                {scheduleAttemptedSave && !scheduledTime && (
                  <p className={styles['reddit-field__error']}>Select a schedule time.</p>
                )}
              </div>
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
