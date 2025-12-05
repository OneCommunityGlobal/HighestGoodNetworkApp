import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import styles from './Myspace.module.css';

const HEADLINE_MIN = 12;
const HEADLINE_MAX = 95;
const BODY_MIN = 80;
const MYSPACE_CATEGORY_SUGGESTIONS = [
  'Announcements',
  'Art & Design',
  'Causes & Awareness',
  'Education',
  'Health & Wellness',
  'Lifestyle',
  'Music',
  'Science & Tech',
  'Sustainability',
  'Volunteering',
];
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

const toTitleCase = text =>
  text
    .split(/[\s-]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

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

const buildPreview = ({ headline, category, sourceUrl, tags, body, mood, listeningTo }) =>
  `Subject / Title\n${headline?.trim() || '—'}\n\nCategory\n${category?.trim() || '—'}\n\nTags\n${
    tags.length ? tags.join(', ') : '—'
  }\n\nMood\n${mood?.trim() || '—'}\n\nListening To\n${listeningTo?.trim() ||
    '—'}\n\nExternal Link\n${sourceUrl?.trim() || '—'}\n\nBlog Entry\n${body?.trim() || '—'}\n`;

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
  const [category, setCategory] = useState(MYSPACE_CATEGORY_SUGGESTIONS[0]);
  const [tagsText, setTagsText] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('');
  const [listeningTo, setListeningTo] = useState('');
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
  const trimmedCategory = category.trim();
  const trimmedBody = body.trim();
  const trimmedMood = mood.trim();
  const trimmedListeningTo = listeningTo.trim();

  const headlineInRange =
    trimmedHeadline.length >= HEADLINE_MIN && trimmedHeadline.length <= HEADLINE_MAX;
  const urlValid = /^https?:\/\//i.test(trimmedUrl);
  const categoryValid = trimmedCategory.length >= 3;
  const bodyValid = trimmedBody.length >= BODY_MIN;
  const tagsValid = tags.length > 0;

  const readyToCopy = headlineInRange && categoryValid && bodyValid && tagsValid;

  const highlightHeadline = trimmedHeadline.length > 0 && !headlineInRange;
  const highlightUrl = trimmedUrl.length > 0 && !urlValid;
  const highlightCategory = trimmedCategory.length > 0 && !categoryValid;
  const highlightBody = trimmedBody.length > 0 && !bodyValid;

  const hasAnyInput = Boolean(
    trimmedHeadline ||
      trimmedUrl ||
      trimmedCategory ||
      trimmedBody ||
      tagsText.trim() ||
      trimmedMood ||
      trimmedListeningTo,
  );

  const preview = useMemo(() => {
    if (!hasAnyInput) return '';
    return buildPreview({
      headline,
      sourceUrl,
      category,
      tags,
      body,
      mood,
      listeningTo,
    });
  }, [body, category, headline, hasAnyInput, listeningTo, mood, sourceUrl, tags]);
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
    setCategory(MYSPACE_CATEGORY_SUGGESTIONS[0]);
    setTagsText('');
    setBody('');
    setMood('');
    setListeningTo('');
  };

  const openMyspaceSubmit = () => {
    if (typeof window !== 'undefined') {
      window.open('https://myspace.com/pages/blog', '_blank', 'noopener,noreferrer');
    }
  };

  const handleScheduleClick = () => {
    if (!hasAnyInput) {
      toast.error('Nothing to schedule yet. Add details in Make Post first.');
      return;
    }
    const missingFields = [];
    if (!trimmedHeadline) missingFields.push('Blog title / Subject');
    if (!trimmedCategory) missingFields.push('Category');
    if (tags.length === 0) missingFields.push('Tags');
    if (!trimmedBody) missingFields.push('Blog entry');
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

  const handleCategorySuggestion = () => {
    if (tags.length > 0) {
      setCategory(toTitleCase(tags[0].replace(/-/g, ' ')));
      return;
    }
    if (headline.trim()) {
      const derived = headline.split(/[:–-]/)[0] || headline;
      const trimmedDerived = derived.trim();
      if (trimmedDerived) {
        setCategory(toTitleCase(trimmedDerived));
        return;
      }
    }
    setCategory(MYSPACE_CATEGORY_SUGGESTIONS[0]);
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
      category,
      tagsText,
      tags: [...tags],
      body,
      mood,
      listeningTo,
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
    setCategory(target.category || MYSPACE_CATEGORY_SUGGESTIONS[0]);
    setTagsText(target.tagsText || '');
    setBody(target.body || '');
    setMood(target.mood || '');
    setListeningTo(target.listeningTo || '');
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
              Myspace’s blog composer asks for the same blocks shown here: a subject line, category,
              post body, optional mood/listening info, and tags. Fill them out once, copy each one,
              and then paste directly into the Myspace blog form.
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
                <label htmlFor="myspace-headline">Blog title / Subject *</label>
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
                  Match the “Subject” field from Myspace. Keep it between {HEADLINE_MIN} and{' '}
                  {HEADLINE_MAX} characters.
                </p>
              )}
              {highlightHeadline && (
                <p className={styles['myspace-field__error']}>
                  Aim for {HEADLINE_MIN}-{HEADLINE_MAX} characters so the title fits the Myspace
                  subject input.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(headline, 'Blog title / Subject')}
                >
                  Copy title
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setHeadline('')}
                >
                  Clear title
                </button>
              </div>
            </div>

            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: highlightUrl,
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-url">External link (optional)</label>
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
                  Paste the canonical article or project URL if you plan to link to it inside your
                  Myspace blog entry.
                </p>
              )}
              {highlightUrl && (
                <p className={styles['myspace-field__error']}>
                  Use a fully qualified HTTP(S) link.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(sourceUrl, 'External link')}
                >
                  Copy link
                </button>
              </div>
            </div>

            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: highlightCategory,
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-category">Category *</label>
                <span className={styles['myspace-field__meta']}>Myspace category drop-down</span>
              </div>
              <input
                id="myspace-category"
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={styles['myspace-field__input']}
                placeholder="e.g. Sustainability"
                list="myspace-category-options"
              />
              <datalist id="myspace-category-options">
                {MYSPACE_CATEGORY_SUGGESTIONS.map(option => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              {!trimmedCategory && (
                <p className={styles['myspace-field__hint']}>
                  Choose the same category you will select on Myspace.
                </p>
              )}
              {highlightCategory && (
                <p className={styles['myspace-field__error']}>
                  Pick a descriptive category with at least three characters.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleCategorySuggestion}
                >
                  Suggest category
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(category, 'Category')}
                >
                  Copy category
                </button>
              </div>
            </div>

            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: !tagsValid && !!tagsText.trim(),
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-tags">Post tags / keywords *</label>
                <span className={styles['myspace-field__meta']}>
                  Mirrors the “Keywords” field on Myspace
                </span>
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
                  Provide at least one descriptive tag separated by commas — exactly how Myspace
                  expects keywords.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setTagsText(extractTagCandidates(headline, body).join(', '))}
                >
                  Suggest tags
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(tags.join(', '), 'Tags / Keywords')}
                >
                  Copy tags
                </button>
              </div>
            </div>

            <div
              className={classNames(styles['myspace-card'], {
                [styles.invalid]: highlightBody,
              })}
            >
              <div className={styles['myspace-field__header']}>
                <label htmlFor="myspace-summary">Blog entry *</label>
                <span
                  className={classNames(styles['myspace-field__meta'], {
                    [styles.invalid]: highlightBody || (!trimmedBody && readyToCopy),
                  })}
                >
                  {body.trim().length} characters
                </span>
              </div>
              <textarea
                id="myspace-summary"
                value={body}
                onChange={e => setBody(e.target.value)}
                className={classNames(
                  styles['myspace-field__input'],
                  styles['myspace-field__textarea'],
                )}
                rows={5}
                placeholder="Draft the full text of your Myspace blog post."
              />
              {!trimmedBody && (
                <p className={styles['myspace-field__hint']}>
                  Paste this directly into the blog editor’s “Blog Entry” box.
                </p>
              )}
              {highlightBody && (
                <p className={styles['myspace-field__error']}>
                  Aim for at least {BODY_MIN} characters so Myspace accepts the entry.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(body, 'Blog entry')}
                >
                  Copy blog entry
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setBody('')}
                >
                  Clear blog entry
                </button>
              </div>
            </div>
          </div>

          <section className={styles['myspace-card']}>
            <div className={styles['myspace-field__header']}>
              <label htmlFor="myspace-mood">Mood & Listening To (optional)</label>
              <span className={styles['myspace-field__meta']}>
                Matches the optional vibe fields shown under the Myspace blog form.
              </span>
            </div>
            <div className={styles['myspace-meta__grid']}>
              <div className={styles['myspace-meta__column']}>
                <label htmlFor="myspace-mood" className={styles['myspace-field__sublabel']}>
                  Mood
                </label>
                <input
                  id="myspace-mood"
                  type="text"
                  value={mood}
                  onChange={e => setMood(e.target.value)}
                  className={styles['myspace-field__input']}
                  placeholder="Inspired, grateful, optimistic"
                />
                <div style={fieldActionRow}>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={() => copyText(mood, 'Mood')}
                  >
                    Copy mood
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={() => setMood('')}
                  >
                    Clear mood
                  </button>
                </div>
              </div>
              <div className={styles['myspace-meta__column']}>
                <label htmlFor="myspace-listening" className={styles['myspace-field__sublabel']}>
                  Listening To
                </label>
                <input
                  id="myspace-listening"
                  type="text"
                  value={listeningTo}
                  onChange={e => setListeningTo(e.target.value)}
                  className={styles['myspace-field__input']}
                  placeholder="Artist – Song Title / Podcast"
                />
                <div style={fieldActionRow}>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={() => copyText(listeningTo, 'Listening To')}
                  >
                    Copy listening to
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={() => setListeningTo('')}
                  >
                    Clear listening to
                  </button>
                </div>
              </div>
            </div>
            <p className={styles['myspace-field__hint']}>
              Add any vibe or soundtrack details you plan to paste into the optional “Mood” and
              “Listening To” boxes on Myspace.
            </p>
          </section>

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
                  Open Myspace blog
                </button>
                <button
                  type="button"
                  style={{ ...buttonStyle('primary', darkMode), opacity: readyToCopy ? 1 : 0.5 }}
                  onClick={() => copyText(preview, 'Myspace blog draft')}
                  disabled={!readyToCopy}
                >
                  Copy full draft
                </button>
              </div>
            </div>
            <pre className={styles['myspace-preview__body']}>{preview}</pre>
            {!readyToCopy && (
              <p className={styles['myspace-preview__hint']}>
                Fill every required field to enable copying the complete draft. These fields map
                directly to the Myspace blog composer.
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
