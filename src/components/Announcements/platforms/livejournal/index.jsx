import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './LiveJournalAutoPoster.module.css';

const SUBJECT_MAX = 255;

const sanitizeTags = text =>
  [
    ...new Map(
      text
        .split(',')
        .map(tag =>
          tag
            .trim()
            .replace(/^#/, '')
            .trim(),
        )
        .filter(Boolean)
        .map(tag => [tag.toLowerCase(), tag]),
    ).values(),
  ].slice(0, 10);

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

const makeId = () => `livejournal-${crypto.randomUUID()}`;

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

const validateEntry = ({ subject, content }) => {
  if (!subject.trim()) {
    toast.error('Please enter an entry subject.');
    return false;
  }

  if (subject.trim().length > SUBJECT_MAX) {
    toast.error(`Subject cannot exceed ${SUBJECT_MAX} characters.`);
    return false;
  }

  if (!content.trim()) {
    toast.error('Please enter entry content.');
    return false;
  }

  return true;
};

function LiveJournalAutoPoster() {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [activeTab, setActiveTab] = useState('make');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [privacy, setPrivacy] = useState('public');

  const [scheduledDraft, setScheduledDraft] = useState('');
  const [scheduledDate, setScheduledDate] = useState(() => formatDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatTime(new Date()));

  const [savedSchedules, setSavedSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);

  const tags = useMemo(() => sanitizeTags(tagsText), [tagsText]);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const trimmedUrl = originalUrl.trim();

  const urlValid = !trimmedUrl || /^https?:\/\/\S+$/i.test(trimmedUrl);

  const titleValid = trimmedTitle.length > 0 && trimmedTitle.length <= SUBJECT_MAX;

  const contentValid = Boolean(trimmedContent);

  const readyToCopy = titleValid && contentValid && urlValid;

  const titleInvalid = trimmedTitle.length > 0 && !titleValid;

  const contentInvalid = !contentValid && Boolean(content.trim());

  const urlInvalid = !urlValid;

  const hasInput = Boolean(trimmedTitle || trimmedContent || tagsText.trim() || trimmedUrl);

  const buildDraft = () => {
    const tagList = tags.length ? tags.map(tag => `#${tag}`).join(', ') : 'None';

    return [
      `Subject\n${trimmedTitle || 'Untitled entry'}`,
      `Content\n${trimmedContent || '—'}`,
      `Tags\n${tagList}`,
      `Original URL\n${trimmedUrl || '—'}`,
      `Privacy\n${privacy}`,
    ].join('\n\n');
  };

  const preview = useMemo(() => (hasInput ? buildDraft() : ''), [
    title,
    content,
    tagsText,
    originalUrl,
    privacy,
    hasInput,
  ]);

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
    setOriginalUrl('');
    setPrivacy('public');
  };

  const handleReset = () => {
    resetEditor();
    toast.info('Editor fields cleared.');
  };

  const openLiveJournalEditor = () => {
    window.open('https://www.livejournal.com/update.bml', '_blank', 'noopener,noreferrer');
  };

  const handleScheduleClick = () => {
    const isValid = validateEntry({
      subject: trimmedTitle,
      content: trimmedContent,
    });

    if (!isValid || !urlValid) {
      if (!urlValid) {
        toast.error('Enter a valid HTTP(S) URL or leave it empty.');
      }
      return;
    }

    const now = new Date();

    setScheduledDate(formatDate(now));
    setScheduledTime(formatTime(now));
    setScheduledDraft(preview);
    setScheduleAttemptedSave(false);
    setEditingId(null);
    setActiveTab('schedule');

    toast.success('Entry moved to the Schedule tab.');
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
      toast.warn('Add an entry to the schedule first.');
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
      originalUrl: trimmedUrl,
      privacy,
      scheduledDraft: scheduledDraft.trim(),
      scheduledDate,
      scheduledTime,
      updatedAt: new Date().toISOString(),
    };

    setSavedSchedules(previous => [record, ...previous.filter(item => item.id !== id)]);

    toast.success(
      editingId
        ? 'Scheduled entry updated for this session.'
        : 'Scheduled entry saved for this session.',
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
    setOriginalUrl(item.originalUrl || '');
    setPrivacy(item.privacy || 'public');
    setScheduledDraft(item.scheduledDraft || '');
    setScheduledDate(date);
    setScheduledTime(time);
    setEditingId(item.id);
    setScheduleAttemptedSave(false);
    setActiveTab('schedule');

    toast.info('Loaded scheduled entry for editing.');
  };

  const handleDeleteSchedule = id => {
    setSavedSchedules(previous => previous.filter(item => item.id !== id));

    if (editingId === id) {
      setEditingId(null);
      setScheduledDraft('');
    }

    toast.info('Scheduled entry removed from this session.');
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
      data-testid="livejournal-auto-poster"
    >
      <div className={styles.subtabs}>
        {[
          { id: 'make', label: '📝 Make Entry' },
          { id: 'schedule', label: '⏰ Scheduled Entry' },
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
            <h3>LiveJournal Auto-Poster</h3>

            <p>
              Create and format a LiveJournal entry. Add a subject, entry content, optional tags,
              and an original article URL. Preview and copy your entry, or open LiveJournal to
              publish it manually.
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
                <label htmlFor="livejournal-title">Entry subject *</label>

                <span
                  className={classNames(styles.fieldMeta, {
                    [styles.invalidText]: titleInvalid,
                  })}
                >
                  {title.length}/{SUBJECT_MAX}
                </span>
              </div>

              <input
                id="livejournal-title"
                value={title}
                maxLength={SUBJECT_MAX}
                onChange={event => setTitle(event.target.value)}
                className={styles.input}
                placeholder="Enter your entry subject"
              />

              {!trimmedTitle && (
                <p className={styles.hint}>Add a subject for your LiveJournal entry.</p>
              )}

              {titleInvalid && (
                <p className={styles.error}>Subject cannot exceed {SUBJECT_MAX} characters.</p>
              )}

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(title, 'Subject')}
                >
                  Copy subject
                </button>

                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setTitle('')}
                >
                  Clear subject
                </button>
              </div>
            </section>

            <section
              className={classNames(styles.card, {
                [styles.invalid]: urlInvalid,
              })}
            >
              <div className={styles.fieldHeader}>
                <label htmlFor="livejournal-url">Original article URL</label>

                <span className={styles.fieldMeta}>optional</span>
              </div>

              <input
                id="livejournal-url"
                type="url"
                value={originalUrl}
                onChange={event => setOriginalUrl(event.target.value)}
                className={styles.input}
                placeholder="https://example.com/article"
              />

              <p className={urlInvalid ? styles.error : styles.hint}>
                {urlInvalid
                  ? 'Enter a valid HTTP(S) URL.'
                  : 'Add a link to the original article if applicable.'}
              </p>

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(originalUrl, 'Original URL')}
                >
                  Copy URL
                </button>

                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => setOriginalUrl('')}
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
                <label htmlFor="livejournal-content">Entry content *</label>

                <span className={styles.fieldMeta}>
                  {content.length.toLocaleString()} characters
                </span>
              </div>

              <textarea
                id="livejournal-content"
                value={content}
                onChange={event => setContent(event.target.value)}
                className={classNames(styles.input, styles.textarea)}
                rows={9}
                placeholder="Write your LiveJournal entry here..."
              />

              {!trimmedContent && <p className={styles.hint}>Add the main body of your entry.</p>}

              <div className={styles.fieldActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(content, 'Entry content')}
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
                <label htmlFor="livejournal-tags">Tags</label>

                <span className={styles.fieldMeta}>Up to 10 tags</span>
              </div>

              <textarea
                id="livejournal-tags"
                value={tagsText}
                onChange={event => setTagsText(event.target.value)}
                className={classNames(styles.input, styles.tagInput)}
                rows={2}
                placeholder="Technology, Personal, Travel"
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

              <p className={styles.hint}>Tags are optional. Separate multiple tags with commas.</p>

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
                <label htmlFor="livejournal-privacy">Entry privacy</label>
              </div>

              <select
                className={styles['privacy-select']}
                value={privacy}
                onChange={e => setPrivacy(e.target.value)}
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>

              <p className={styles.hint}>
                Select who should be able to view your entry. This is included in the local preview
                only. You must select the actual privacy setting in LiveJournal when publishing.
              </p>
            </section>
          </div>

          <section className={styles.card}>
            <div className={styles.previewHeader}>
              <h4>LiveJournal entry preview</h4>

              <div className={styles.previewActions}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleScheduleClick}
                >
                  Schedule this entry
                </button>

                <button
                  type="button"
                  style={buttonStyle('outline', darkMode)}
                  onClick={openLiveJournalEditor}
                >
                  Open LiveJournal
                </button>

                <button
                  type="button"
                  style={{
                    ...buttonStyle('primary', darkMode),
                    opacity: readyToCopy ? 1 : 0.5,
                  }}
                  onClick={() => copyText(preview, 'LiveJournal entry')}
                  disabled={!readyToCopy}
                >
                  Copy full entry
                </button>
              </div>
            </div>

            <pre className={styles.previewBody}>
              {preview || 'Your entry preview will appear here as you type.'}
            </pre>

            {!readyToCopy && (
              <p className={styles.previewHint}>
                Add a subject and entry content to enable copying the complete entry.
              </p>
            )}
          </section>
        </>
      ) : (
        <div className={styles.schedulerGrid}>
          <section className={classNames(styles.card, styles.schedulerCard)}>
            <h3>Schedule LiveJournal Entry</h3>

            <p>
              Save a local schedule entry for your LiveJournal post. This does not automatically
              publish the entry at the selected time.
            </p>

            {editingSchedule && (
              <p className={styles.schedulerNote}>
                Editing "{editingSchedule.title || 'Untitled entry'}". Saving will update the
                existing entry.
              </p>
            )}

            <div className={styles.scheduleControls}>
              <div className={styles.scheduleField}>
                <label htmlFor="livejournal-schedule-date">Scheduled date *</label>

                <input
                  id="livejournal-schedule-date"
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
                <label htmlFor="livejournal-schedule-time">Scheduled time *</label>

                <input
                  id="livejournal-schedule-time"
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

            <label htmlFor="livejournal-schedule-draft">Scheduled entry</label>

            <textarea
              id="livejournal-schedule-draft"
              value={scheduledDraft}
              readOnly
              rows={9}
              className={classNames(styles.input, styles.schedulerTextarea)}
              placeholder="Choose Schedule this entry in Make Entry to load your draft."
            />

            <div className={styles.schedulerActions}>
              <button
                type="button"
                style={buttonStyle('primary', darkMode)}
                onClick={handleSaveSchedule}
                disabled={!scheduleHasDraft}
              >
                {editingId ? 'Update scheduled entry' : 'Save scheduled entry'}
              </button>

              <button
                type="button"
                style={buttonStyle('ghost', darkMode)}
                onClick={() => copyText(scheduledDraft, 'Scheduled entry')}
                disabled={!scheduleHasDraft}
              >
                Copy scheduled entry
              </button>

              <button
                type="button"
                style={buttonStyle('outline', darkMode)}
                onClick={() => setActiveTab('make')}
              >
                Back to Make Entry
              </button>
            </div>
          </section>

          <section className={classNames(styles.card, styles.savedCard)}>
            <h3>Saved scheduled entries</h3>

            <p className={styles.hint}>
              Edit a saved entry, copy it, or open LiveJournal to publish it manually.
            </p>

            <div className={styles.savedList}>
              {savedSchedules.length === 0 ? (
                <p className={styles.empty}>
                  No scheduled entries yet. Save one to see it listed here.
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
                      <h4 className={styles.savedTitle}>{item.title || 'Untitled entry'}</h4>

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
                        onClick={() => copyText(item.scheduledDraft, 'Scheduled entry')}
                      >
                        Copy
                      </button>

                      <button
                        type="button"
                        style={buttonStyle('outline', darkMode)}
                        onClick={openLiveJournalEditor}
                      >
                        Open LiveJournal
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

export default LiveJournalAutoPoster;
