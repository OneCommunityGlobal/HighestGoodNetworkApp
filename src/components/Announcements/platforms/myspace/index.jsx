import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './Myspace.module.css';
import { setPlatformScheduleCount } from '../PlatformScheduleBadge';

const HEADLINE_MIN = 12;
const HEADLINE_MAX = 95;
const BODY_MIN = 80;
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

const MYSPACE_SCHEDULE_STORAGE_KEY = 'hgn_myspace_schedules';

const readSchedulesFromStorage = () => {
  if (typeof window === 'undefined' || !window?.localStorage) {
    return { data: [], error: new Error('Local storage unavailable') };
  }
  try {
    const stored = window.localStorage.getItem(MYSPACE_SCHEDULE_STORAGE_KEY);
    if (!stored) return { data: [] };
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return { data: [] };
    return { data: parsed };
  } catch (error) {
    return { data: [], error };
  }
};

const persistSchedulesToStorage = schedules => {
  if (typeof window === 'undefined' || !window?.localStorage) {
    return { success: false, error: new Error('Local storage unavailable') };
  }
  try {
    window.localStorage.setItem(MYSPACE_SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

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

const buildPreview = ({ headline, body, sourceUrl, tags }) =>
  `${headline?.trim() || '—'}\n\n${body?.trim() || '—'}\n\n${sourceUrl?.trim() || '—'}\n\n${
    tags.length ? tags.join(', ') : '—'
  }\n`;

const padTimeUnit = value => String(value).padStart(2, '0');

const formatLocalDate = date =>
  `${date.getFullYear()}-${padTimeUnit(date.getMonth() + 1)}-${padTimeUnit(date.getDate())}`;

const formatLocalTime = date => `${padTimeUnit(date.getHours())}:${padTimeUnit(date.getMinutes())}`;

const generateRandomSlug = () => {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const buffer = new Uint32Array(3);
    window.crypto.getRandomValues(buffer);
    return Array.from(buffer, value => value.toString(36).slice(0, 4)).join('');
  }
  let fallback = '';
  for (let i = 0; i < 3; i += 1) {
    fallback += Date.now().toString(36);
  }
  return fallback.slice(0, 12);
};

const createScheduleId = () => `schedule-${Date.now().toString(36)}-${generateRandomSlug()}`;

const createScheduleId = () => `schedule-${Date.now().toString(36)}-${generateRandomSlug()}`;

const normalizeScheduleRecord = record => {
  if (!record || typeof record !== 'object') return null;
  const normalizedId = record._id || record.id || createScheduleId();
  return {
    ...record,
    id: normalizedId,
    _id: record._id || normalizedId,
    updatedAt: record.updatedAt || record.updated_at || new Date().toISOString(),
  };
};

const sortSchedulesByUpdatedAt = schedules =>
  [...schedules].sort((a, b) => {
    const getTime = entry =>
      new Date(entry?.updatedAt || entry?.createdAt || entry?.created_at || 0).getTime();
    return getTime(b) - getTime(a);
  });

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
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFileName, setPhotoFileName] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [body, setBody] = useState('');
  const [song, setSong] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('make');
  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => formatLocalDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatLocalTime(new Date()));
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [scheduleSyncError, setScheduleSyncError] = useState('');
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (platform !== 'myspace') return undefined;
    let isMounted = true;

    const loadSchedulesFromBrowser = () => {
      if (!isMounted) return;
      setSchedulesLoading(true);
      setScheduleSyncError('');
      const { data, error } = readSchedulesFromStorage();
      if (error && isMounted) {
        setSavedSchedules([]);
        setScheduleSyncError('Unable to load saved scheduled posts from this browser.');
        toast.error('Unable to load saved Myspace posts. Local storage may be disabled.');
      } else if (isMounted) {
        const normalized = (Array.isArray(data) ? data : [])
          .map(normalizeScheduleRecord)
          .filter(Boolean);
        setSavedSchedules(sortSchedulesByUpdatedAt(normalized));
      }
      if (isMounted) {
        setSchedulesLoading(false);
      }
    };

    loadSchedulesFromBrowser();

    const handleStorageSync = event => {
      if (event.key === MYSPACE_SCHEDULE_STORAGE_KEY) {
        loadSchedulesFromBrowser();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageSync);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageSync);
      }
    };
  }, [platform]);

  useEffect(() => {
    if (platform !== 'myspace') return undefined;
    setPlatformScheduleCount(platform, savedSchedules.length);
    return () => setPlatformScheduleCount(platform, 0);
  }, [platform, savedSchedules.length]);

  useEffect(() => {
    if (!photoPreviewUrl) return undefined;
    return () => {
      URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

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
  const trimmedBody = body.trim();
  const trimmedPhoto = photoUrl.trim();
  const trimmedSong = song.trim();

  const headlineInRange =
    trimmedHeadline.length >= HEADLINE_MIN && trimmedHeadline.length <= HEADLINE_MAX;
  const urlValid = /^https?:\/\//i.test(trimmedUrl);
  const bodyValid = trimmedBody.length >= BODY_MIN;
  const tagsValid = tags.length > 0;

  const readyToCopy = headlineInRange && bodyValid && tagsValid;

  const highlightHeadline = trimmedHeadline.length > 0 && !headlineInRange;
  const highlightUrl = trimmedUrl.length > 0 && !urlValid;
  const highlightBody = trimmedBody.length > 0 && !bodyValid;

  const hasAnyInput = Boolean(
    trimmedHeadline ||
      trimmedUrl ||
      trimmedBody ||
      tagsText.trim() ||
      trimmedPhoto ||
      trimmedSong ||
      photoFileName,
  );

  const preview = useMemo(() => {
    if (!hasAnyInput) return '';
    return buildPreview({ headline, body, sourceUrl, tags });
  }, [body, headline, hasAnyInput, sourceUrl, tags]);
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
    setPhotoUrl('');
    setTagsText('');
    setBody('');
    setSong('');
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
    if (tags.length === 0) missingFields.push('Post tags / keywords');
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

  const dropPhotoPreviewOnly = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl('');
    }
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handlePhotoFileChange = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl(objectUrl);
    setPhotoFileName(file.name);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const handleChoosePhoto = () => {
    photoInputRef.current?.click();
  };

  const handleClearPhoto = () => {
    dropPhotoPreviewOnly();
    setPhotoFileName('');
    setPhotoUrl('');
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
    if (scheduleSaving) return;
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
    const payload = {
      headline,
      sourceUrl,
      photoUrl,
      photoFileName,
      tagsText,
      tags: [...tags],
      body,
      song,
      scheduledDraft: scheduledDraft.trim(),
      scheduledDate,
      scheduledTime,
    };
    const localRecord = normalizeScheduleRecord({
      ...payload,
      id: recordId,
      updatedAt: new Date().toISOString(),
    });
    setScheduleSaving(true);
    let persistSuccess = true;
    setSavedSchedules(prev => {
      const remaining = prev.filter(item => item.id !== localRecord.id);
      const next = sortSchedulesByUpdatedAt([localRecord, ...remaining]);
      const { success } = persistSchedulesToStorage(next);
      if (!success) {
        persistSuccess = false;
      }
      return next;
    });
    if (persistSuccess) {
      const toastMessage = isEditing
        ? 'Scheduled post updated locally.'
        : 'Scheduled post saved locally.';
      toast.success(toastMessage);
      setScheduleSyncError('');
    } else {
      toast.error('Unable to save schedule in browser storage. It may disappear after refresh.');
      setScheduleSyncError('Unable to sync schedules to browser storage.');
    }
    handleReset();
    setScheduledDraft('');
    setScheduledDate('');
    setScheduledTime('');
    setScheduleAttemptedSave(false);
    setEditingScheduleId(null);
    setActiveSubTab('make');
    setScheduleSaving(false);
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
    dropPhotoPreviewOnly();
    setPhotoUrl(target.photoUrl || '');
    setPhotoFileName(target.photoFileName || '');
    setTagsText(target.tagsText || '');
    setBody(target.body || '');
    setSong(target.song || '');
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
              Myspace’s blog composer asks for the same blocks shown here: a subject line, blog
              entry, optional photo and song, external link, and keywords. Fill them out once, copy
              each one, and then paste directly into the Myspace blog form.
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
                  onClick={() => copyText(tags.join(', '), 'Post tags / keywords')}
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
              <label htmlFor="myspace-photo">Add a photo & song (optional)</label>
              <span className={styles['myspace-field__meta']}>
                Matches the optional attachments under the Myspace blog form.
              </span>
            </div>
            <div className={styles['myspace-meta__grid']}>
              <div className={styles['myspace-meta__column']}>
                <label htmlFor="myspace-photo" className={styles['myspace-field__sublabel']}>
                  Add a photo
                </label>
                <input
                  id="myspace-photo"
                  type="url"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  className={styles['myspace-field__input']}
                  placeholder="https://example.com/myspace-image.jpg"
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className={styles['myspace-field__file']}
                  onChange={handlePhotoFileChange}
                />
                <div style={fieldActionRow}>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={handleChoosePhoto}
                  >
                    Choose photo from device
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={() => copyText(photoUrl, 'Photo link')}
                  >
                    Copy photo link
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={handleClearPhoto}
                  >
                    Clear photo
                  </button>
                </div>
                {photoFileName && (
                  <p className={styles['myspace-photo__meta']}>
                    Selected from device: <strong>{photoFileName}</strong>
                  </p>
                )}
                {photoPreviewUrl && (
                  <img
                    src={photoPreviewUrl}
                    alt="Selected preview"
                    className={styles['myspace-photo__preview']}
                  />
                )}
              </div>
              <div className={styles['myspace-meta__column']}>
                <label htmlFor="myspace-song" className={styles['myspace-field__sublabel']}>
                  Add a song
                </label>
                <input
                  id="myspace-song"
                  type="text"
                  value={song}
                  onChange={e => setSong(e.target.value)}
                  className={styles['myspace-field__input']}
                  placeholder="Artist – Song Title"
                />
                <div style={fieldActionRow}>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={() => copyText(song, 'Song')}
                  >
                    Copy song
                  </button>
                  <button
                    type="button"
                    style={buttonStyle('ghost', darkMode)}
                    onClick={() => setSong('')}
                  >
                    Clear song
                  </button>
                </div>
              </div>
            </div>
            <p className={styles['myspace-field__hint']}>
              Paste hosted links or pick a local photo (saved only for this browser session), plus
              jot the song info you plan to add inside Myspace.
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
                Fill every required field to enable copying the complete draft. The preview lists
                title, blog entry, external link, and keywords in the exact order Myspace expects.
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
                disabled={!scheduleHasDraft || scheduleSaving}
              >
                {scheduleSaving
                  ? 'Saving…'
                  : editingScheduleId
                  ? 'Update scheduled post'
                  : 'Save scheduled post'}
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
              Choose a saved entry to continue editing or submit it to Myspace. These are stored
              locally in this browser.
            </p>
            {schedulesLoading && (
              <p className={styles['myspace-field__hint']}>Loading saved scheduled posts…</p>
            )}
            {scheduleSyncError && (
              <p className={styles['myspace-field__error']}>{scheduleSyncError}</p>
            )}
            <div className={styles['myspace-saved__list']}>
              {!schedulesLoading && savedSchedules.length === 0 ? (
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
