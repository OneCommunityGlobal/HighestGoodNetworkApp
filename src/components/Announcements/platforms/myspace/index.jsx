import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import styles from './Myspace.module.css';

const HEADLINE_MIN = 12;
const HEADLINE_MAX = 95;
const SUMMARY_MIN = 80;
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

const sanitizeTags = text =>
  text
    .split(',')
    .map(tag =>
      tag
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    )
    .filter(Boolean);

const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();

const extractTagCandidates = (headline, summary, existing) => {
  if (Array.isArray(existing) && existing.length) return existing.slice(0, 6);
  const corpus = `${headline} ${summary}`.toLowerCase();
  const words = corpus.match(/[a-z0-9']+/g) || [];
  const candidates = [];
  for (const raw of words) {
    const cleaned = raw.replace(/'/g, '');
    if (cleaned.length < 4) continue;
    if (STOP_WORDS.has(cleaned)) continue;
    if (!candidates.includes(cleaned)) candidates.push(cleaned);
    if (candidates.length === 6) break;
  }
  return candidates;
};

const buildPreview = ({ headline, sourceUrl, dept, tags, intro }) =>
  `Headline\n${headline?.trim() || '—'}\n\nSource URL\n${sourceUrl?.trim() ||
    '—'}\n\nDept\n${dept?.trim() || '—'}\n\nTags\n${
    tags.length ? tags.join(', ') : '—'
  }\n\nIntro / Summary\n${intro?.trim() || '—'}\n`;

const padTimeUnit = value => String(value).padStart(2, '0');

const formatLocalDate = date =>
  `${date.getFullYear()}-${padTimeUnit(date.getMonth() + 1)}-${padTimeUnit(date.getDate())}`;

const formatLocalTime = date => `${padTimeUnit(date.getHours())}:${padTimeUnit(date.getMinutes())}`;

const createScheduleId = () =>
  `schedule-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

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
      ? parsed.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';
    return formattedTime ? `${formattedDate} • ${formattedTime}` : formattedDate;
  } catch (error) {
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
  if (variant === 'primary') {
    return {
      ...base,
      backgroundColor: '#0d6efd',
      color: '#fff',
    };
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

const fieldActionRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '12px',
};

function MyspaceAutoPoster({ platform }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [headline, setHeadline] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [dept, setDept] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [intro, setIntro] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('make');
  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => formatLocalDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatLocalTime(new Date()));
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);

  const subTabs = useMemo(
    () => [
      { id: 'make', label: '📝 Make Post' },
      { id: 'schedule', label: '⏰ Scheduled Post' },
    ],
    [],
  );

  const tags = useMemo(() => sanitizeTags(tagsText), [tagsText]);

  const trimmedHeadline = headline.trim();
  const trimmedUrl = sourceUrl.trim();
  const trimmedDept = dept.trim();
  const trimmedIntro = intro.trim();

  const headlineInRange =
    trimmedHeadline.length >= HEADLINE_MIN && trimmedHeadline.length <= HEADLINE_MAX;
  const urlValid = /^https?:\/\//i.test(trimmedUrl);
  const deptValid = trimmedDept.length >= 3;
  const summaryValid = trimmedIntro.length >= SUMMARY_MIN;
  const tagsValid = tags.length > 0;

  const readyToCopy = headlineInRange && urlValid && deptValid && summaryValid && tagsValid;

  const highlightHeadline = trimmedHeadline.length > 0 && !headlineInRange;
  const highlightUrl = trimmedUrl.length > 0 && !urlValid;
  const highlightDept = trimmedDept.length > 0 && !deptValid;
  const highlightSummary = trimmedIntro.length > 0 && !summaryValid;

  const hasAnyInput = Boolean(
    trimmedHeadline || trimmedUrl || trimmedDept || trimmedIntro || tagsText.trim(),
  );

  const preview = useMemo(() => {
    if (!hasAnyInput) return '';
    return buildPreview({ headline, sourceUrl, dept, tags, intro });
  }, [dept, headline, hasAnyInput, intro, sourceUrl, tags]);
  const scheduleHasDraft = scheduledDraft.trim().length > 0;
  const editingSchedule = useMemo(
    () => savedSchedules.find(schedule => schedule.id === editingScheduleId) || null,
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
    } catch (error) {
      toast.error(`Could not copy ${label.toLowerCase()}.`);
    }
  };

  const handleReset = () => {
    setHeadline('');
    setSourceUrl('');
    setDept('');
    setTagsText('');
    setIntro('');
  };

  const openMyspaceSubmit = () => {
    if (typeof window !== 'undefined') {
      window.open('https://myspace.com/home', '_blank', 'noopener,noreferrer');
    }
  };

  const handleScheduleClick = () => {
    if (!hasAnyInput) {
      toast.error('Nothing to schedule yet. Add details in Make Post first.');
      return;
    }
    const missingFields = [];
    if (!trimmedHeadline) missingFields.push('Headline');
    if (!trimmedUrl) missingFields.push('Source URL');
    if (!trimmedDept) missingFields.push('Dept');
    if (tags.length === 0) missingFields.push('Tags');
    if (!trimmedIntro) missingFields.push('Intro / Summary');
    if (missingFields.length > 0) {
      toast.error(`Add ${missingFields.join(', ')} before scheduling.`);
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

  const removeTag = tagToRemove => {
    const remaining = tags.filter(tag => tag !== tagToRemove);
    setTagsText(remaining.join(', '));
  };
  const now = new Date();
  const today = formatLocalDate(now);
  const currentTime = formatLocalTime(now);
  const scheduleTimeMin = scheduledDate === today ? currentTime : '00:00';

  const handleScheduleDateChange = event => {
    const nextDateRaw = event.target.value;
    if (!nextDateRaw) return;
    const nextDate = nextDateRaw < today ? today : nextDateRaw;
    setScheduledDate(nextDate);
    setScheduleAttemptedSave(false);
    if (nextDate === today) {
      const refreshedNow = new Date();
      const refreshedTime = formatLocalTime(refreshedNow);
      setScheduledTime(prev => (prev && prev >= refreshedTime ? prev : refreshedTime));
    }
  };

  const handleScheduleTimeChange = event => {
    const nextTimeRaw = event.target.value;
    if (!nextTimeRaw) return;
    if (scheduledDate === today) {
      const refreshedNow = new Date();
      const refreshedTime = formatLocalTime(refreshedNow);
      setScheduledTime(nextTimeRaw >= refreshedTime ? nextTimeRaw : refreshedTime);
      setScheduleAttemptedSave(false);
      return;
    }
    setScheduledTime(nextTimeRaw);
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
      headline,
      sourceUrl,
      dept,
      tagsText,
      tags: [...tags],
      intro,
      scheduledDraft: scheduledDraft.trim(),
      scheduledDate,
      scheduledTime,
      updatedAt: new Date().toISOString(),
    };
    setSavedSchedules(prev => {
      const remaining = prev.filter(item => item.id !== record.id);
      return [record, ...remaining];
    });
    const toastMessage = isEditing ? 'Scheduled post updated.' : 'Scheduled post saved.';
    toast.success(toastMessage);
    handleReset();
    setScheduledDraft('');
    setScheduledDate('');
    setScheduledTime('');
    setScheduleAttemptedSave(false);
    setEditingScheduleId(null);
    setActiveSubTab('make');
  };

  const handleEditSchedule = scheduleId => {
    const target = savedSchedules.find(schedule => schedule.id === scheduleId);
    if (!target) return;
    const refreshedToday = formatLocalDate(new Date());
    let nextDate = target.scheduledDate || refreshedToday;
    if (nextDate < refreshedToday) {
      nextDate = refreshedToday;
    }
    let nextTime = target.scheduledTime || '00:00';
    if (nextDate === refreshedToday) {
      const refreshedNow = new Date();
      const refreshedTime = formatLocalTime(refreshedNow);
      if (!nextTime || nextTime < refreshedTime) {
        nextTime = refreshedTime;
      }
    }
    setHeadline(target.headline || '');
    setSourceUrl(target.sourceUrl || '');
    setDept(target.dept || '');
    setTagsText(target.tagsText || '');
    setIntro(target.intro || '');
    setScheduledDraft(target.scheduledDraft || '');
    setScheduledDate(nextDate);
    setScheduledTime(nextTime);
    setScheduleAttemptedSave(false);
    setEditingScheduleId(target.id);
    setActiveSubTab('schedule');
    toast.info('Loaded scheduled post for editing.');
  };

  return (
    <div className={classNames(styles['myspace-autoposter'], { [styles.dark]: darkMode })}>
      <div className={classNames(styles['myspace-subtabs'], { [styles.dark]: darkMode })}>
        {subTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={classNames(styles['myspace-subtab'], {
              [styles.active]: activeSubTab === id,
            })}
            onClick={() => setActiveSubTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'make' ? (
        <>
          <section className={styles['myspace-card']}>
            <h3>Myspace Auto-Poster</h3>
            <p>
              Myspace submissions require five pieces: a strong headline, the source URL, a short
              department slug, relevant tags, and an 80+ character summary. Use the tools below to
              build a ready-to-submit draft, then copy it (or open myspace.com/home) to finish the
              manual submission.
            </p>
            <div style={topCardActions()}>
              <button type="button" style={buttonStyle('outline', darkMode)} onClick={handleReset}>
                Clear fields
              </button>
            </div>
          </section>

          <div className={styles['myspace-grid']}>
            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: highlightHeadline,
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-headline">Headline *</label>
                <span
                  className={classNames(styles['myspace-field__meta'], {
                    [styles.invalid]: highlightHeadline || (!trimmedHeadline && readyToCopy),
                  })}
                >
                  {headline.trim().length}/{HEADLINE_MAX}
                </span>
              </div>
              <input
                id="myspace-headline"
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                className={styles['myspace-field__input']}
                placeholder="e.g. Open Source Volunteers Deliver Weekly Progress Platform"
              />
              {!trimmedHeadline && (
                <p className={styles['myspace-field__hint']}>
                  Add a headline with at least {HEADLINE_MIN} characters and keep it below{' '}
                  {HEADLINE_MAX}.
                </p>
              )}
              {highlightHeadline && (
                <p className={styles['myspace-field__error']}>
                  Aim for {HEADLINE_MIN}-{HEADLINE_MAX} characters so the headline fits Myspace’s
                  front page.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(headline, 'Headline')}
                >
                  Copy headline
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setHeadline('')}
                >
                  Clear headline
                </button>
              </div>
            </div>

            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: highlightUrl,
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-url">Source URL *</label>
              </div>
              <input
                id="myspace-url"
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                className={styles['myspace-field__input']}
                placeholder="https://"
              />
              {!trimmedUrl && (
                <p className={styles['myspace-field__hint']}>
                  Paste the canonical article or project URL.
                </p>
              )}
              {highlightUrl && (
                <p className={styles['myspace-field__error']}>
                  Myspace only accepts fully qualified HTTP(S) links.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(sourceUrl, 'Source URL')}
                >
                  Copy URL
                </button>
              </div>
            </div>

            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: highlightDept,
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-dept">Dept *</label>
                <span className={styles['myspace-field__meta']}>short slug</span>
              </div>
              <input
                id="myspace-dept"
                type="text"
                value={dept}
                onChange={e => setDept(e.target.value.toLowerCase())}
                className={styles['myspace-field__input']}
                placeholder="e.g. volunteer-tech"
              />
              {!trimmedDept && (
                <p className={styles['myspace-field__hint']}>
                  Set the playful department label Myspace shows under the headline.
                </p>
              )}
              {highlightDept && (
                <p className={styles['myspace-field__error']}>
                  Use a short slug-style phrase with lowercase letters and dashes.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setDept(slugify(dept || headline || platform || 'one-community'))}
                >
                  Suggest dept
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(dept, 'Dept')}
                >
                  Copy dept
                </button>
              </div>
            </div>

            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: !tagsValid && !!tagsText.trim(),
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-tags">Tags *</label>
                <span className={styles['myspace-field__meta']}>comma separated</span>
              </div>
              <textarea
                id="myspace-tags"
                value={tagsText}
                onChange={e => setTagsText(e.target.value)}
                className={classNames(
                  styles['myspace-field__input'],
                  styles['myspace-field__textarea'],
                )}
                rows={2}
                placeholder="open-source, volunteering, sustainability"
              />
              <div className={styles['myspace-chips']}>
                {tags.map(tag => (
                  <span key={tag} className={styles['myspace-chip']}>
                    <span className={styles['myspace-chip__label']}>{tag}</span>
                    <button
                      type="button"
                      className={styles['myspace-chip__clear']}
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                    >
                      ✖
                    </button>
                  </span>
                ))}
              </div>
              {!tagsValid && (
                <p className={styles['myspace-field__hint']}>
                  Provide at least one descriptive tag separated by commas.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setTagsText(extractTagCandidates(headline, intro).join(', '))}
                >
                  Suggest tags
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(tags.join(', '), 'Tags')}
                >
                  Copy tags
                </button>
              </div>
            </div>

            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: highlightSummary,
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-summary">Intro / Summary *</label>
                <span
                  className={classNames(styles['myspace-field__meta'], {
                    [styles.invalid]: highlightSummary || (!trimmedIntro && readyToCopy),
                  })}
                >
                  {intro.trim().length} characters
                </span>
              </div>
              <textarea
                id="myspace-summary"
                value={intro}
                onChange={e => setIntro(e.target.value)}
                className={classNames(
                  styles['myspace-field__input'],
                  styles['myspace-field__textarea'],
                )}
                rows={5}
                placeholder="Craft a 3-4 sentence summary that highlights why the story matters to Myspace readers."
              />
              {!trimmedIntro && (
                <p className={styles['myspace-field__hint']}>
                  Write a 2–3 sentence overview tailored for Myspace readers.
                </p>
              )}
              {highlightSummary && (
                <p className={styles['myspace-field__error']}>
                  Myspace requires at least {SUMMARY_MIN} characters of summary text.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(intro, 'Intro / Summary')}
                >
                  Copy summary
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setIntro('')}
                >
                  Clear summary
                </button>
              </div>
            </div>
          </div>

          <section className={styles['myspace-card']}>
            <div className={styles['myspace-preview__header']}>
              <h4>Submission preview</h4>
              <div className={styles['myspace-preview__actions']}>
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
                  onClick={openMyspaceSubmit}
                >
                  Open myspace.com/home
                </button>
                <button
                  type="button"
                  style={{ ...buttonStyle('primary', darkMode), opacity: readyToCopy ? 1 : 0.5 }}
                  onClick={() => copyText(preview, 'Myspace draft')}
                  disabled={!readyToCopy}
                >
                  Copy full draft
                </button>
              </div>
            </div>
            <pre className={styles['myspace-preview__body']}>{preview}</pre>
            {!readyToCopy && (
              <p className={styles['myspace-preview__hint']}>
                Fill every required field to enable copying the complete draft. Myspace’s form
                mirrors this layout.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className={styles['myspace-scheduler__grid']}>
          <section
            className={classNames(styles['myspace-card'], styles['myspace-card--scheduler'])}
          >
            <h3>Schedule Myspace Post</h3>
            <p>Scheduling controls, copy below or switch back to Make Post changes.</p>
            {editingSchedule && (
              <p className={styles['myspace-scheduler__note']}>
                Editing saved schedule “{editingSchedule.headline || 'Untitled draft'}”. Saving will
                overwrite the existing entry.
              </p>
            )}
            <div className={styles['myspace-scheduler__controls']}>
              <div className={styles['myspace-scheduler__field']}>
                <label htmlFor="myspace-schedule-date">
                  Scheduled date <span className={styles['myspace-field__required']}>*</span>
                </label>
                <input
                  id="myspace-schedule-date"
                  type="date"
                  value={scheduledDate}
                  min={today}
                  onChange={handleScheduleDateChange}
                  className={classNames(styles['myspace-field__input'], {
                    [styles['myspace-field__input--invalid']]:
                      scheduleAttemptedSave && !scheduledDate,
                  })}
                  aria-invalid={scheduleAttemptedSave && !scheduledDate}
                />
                {scheduleAttemptedSave && !scheduledDate && (
                  <p className={styles['myspace-field__error']}>Select a schedule date.</p>
                )}
              </div>
              <div className={styles['myspace-scheduler__field']}>
                <label htmlFor="myspace-schedule-time">
                  Scheduled time <span className={styles['myspace-field__required']}>*</span>
                </label>
                <input
                  id="myspace-schedule-time"
                  type="time"
                  value={scheduledTime}
                  min={scheduleTimeMin}
                  onChange={handleScheduleTimeChange}
                  className={classNames(styles['myspace-field__input'], {
                    [styles['myspace-field__input--invalid']]:
                      scheduleAttemptedSave && !scheduledTime,
                  })}
                  aria-invalid={scheduleAttemptedSave && !scheduledTime}
                />
                {scheduleAttemptedSave && !scheduledTime && (
                  <p className={styles['myspace-field__error']}>Select a schedule time.</p>
                )}
              </div>
            </div>
            <label htmlFor="myspace-schedule-content">Scheduled draft</label>
            <textarea
              id="myspace-schedule-content"
              value={scheduledDraft}
              className={classNames(
                styles['myspace-field__input'],
                styles['myspace-scheduler__textarea'],
              )}
              placeholder="Click “Schedule this post” in the Make Post tab to load content here."
              rows={8}
              readOnly
            />
            <div className={styles['myspace-scheduler__actions']}>
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

          <section className={classNames(styles['myspace-card'], styles['myspace-card--saved'])}>
            <h3>Saved scheduled posts</h3>
            <p className={styles['myspace-field__hint']}>
              Choose a saved entry to continue editing or submit it to Myspace.
            </p>
            <div className={styles['myspace-saved__list']}>
              {savedSchedules.length === 0 ? (
                <p className={styles['myspace-scheduler__empty']}>
                  No saved scheduled posts yet. Save one to see it listed here.
                </p>
              ) : (
                savedSchedules.map(schedule => {
                  const isActive = schedule.id === editingScheduleId;
                  const excerpt =
                    schedule.scheduledDraft && schedule.scheduledDraft.length > 140
                      ? `${schedule.scheduledDraft.slice(0, 140).trim()}...`
                      : schedule.scheduledDraft || 'No summary captured.';
                  return (
                    <article
                      key={schedule.id}
                      className={classNames(styles['myspace-saved__item'], {
                        [styles['myspace-saved__item--active']]: isActive,
                      })}
                    >
                      <div className={styles['myspace-saved__header']}>
                        <h4 className={styles['myspace-saved__title']}>
                          {schedule.headline || 'Untitled draft'}
                        </h4>
                        <span className={styles['myspace-saved__meta']}>
                          {formatDisplayDateTime(schedule.scheduledDate, schedule.scheduledTime)}
                        </span>
                      </div>
                      <p className={styles['myspace-saved__excerpt']}>{excerpt}</p>
                      <div className={styles['myspace-saved__actions']}>
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
                          onClick={openMyspaceSubmit}
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

MyspaceAutoPoster.propTypes = {
  platform: PropTypes.string,
};

MyspaceAutoPoster.defaultProps = {
  platform: 'myspace',
};

export default MyspaceAutoPoster;
