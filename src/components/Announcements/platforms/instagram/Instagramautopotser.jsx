import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import styles from './Instagram.module.css';
import {
  CAPTION_MAX,
  ALT_TEXT_MAX,
  buildPreview,
  buildCaptionForClipboard,
  parseHashtags,
  formatLocalDate,
  formatLocalTime,
  formatDisplayDateTime,
  clampScheduleDateTime,
  extractHashtagSuggestions,
  topCardActions,
  buttonStyle,
  fieldActionRow,
} from './Instagramhelpers';

// ─── ScheduleField sub-component ─────────────────────────────────────────────

function ScheduleField({ id, type, label, value, min, onChange, attemptedSave, errorText }) {
  const isInvalid = attemptedSave && !value;
  return (
    <div className={styles['instagram-scheduler__field']}>
      <label htmlFor={id}>
        {label} <span className={styles['instagram-field__required']}>*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        onChange={onChange}
        className={classNames(styles['instagram-field__input'], {
          [styles['instagram-field__input--invalid']]: isInvalid,
        })}
        aria-invalid={isInvalid}
      />
      {isInvalid && <p className={styles['instagram-field__error']}>{errorText}</p>}
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

const STATUS_LABEL = {
  scheduled: 'Scheduled',
  publishing: 'Publishing…',
  failed: 'Failed',
  published: 'Published',
};

// ─── InstagramAutoPoster ───────────────────────────────────────────────────────

function InstagramAutoPoster({ platform }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [altText, setAltText] = useState('');
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState(null); // { base64, preview, name, isVideo }

  const [activeSubTab, setActiveSubTab] = useState('make');
  const [isPosting, setIsPosting] = useState(false);

  const [scheduledDate, setScheduledDate] = useState(() => formatLocalDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatLocalTime(new Date()));
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);

  const subTabs = useMemo(
    () => [
      { id: 'make', label: '📝 Create Post' },
      { id: 'schedule', label: '⏰ Scheduled Posts' },
      { id: 'history', label: '📜 Post History' },
    ],
    [],
  );

  // ── Derived validation state ──────────────────────────────────────────────

  const trimmedCaption = caption.trim();
  const trimmedAltText = altText.trim();
  const captionValid = trimmedCaption.length > 0 && trimmedCaption.length <= CAPTION_MAX;
  const altTextValid = trimmedAltText.length <= ALT_TEXT_MAX;
  const hasMedia = Boolean(media);

  const highlightCaption = caption.length > 0 && !captionValid;
  const highlightAltText = trimmedAltText.length > 0 && !altTextValid;

  const readyToPost = captionValid && hasMedia;

  const hasAnyInput = Boolean(trimmedCaption || hashtags.trim() || location.trim() || media);

  const preview = useMemo(() => {
    if (!hasAnyInput) return '';
    return buildPreview({ caption, hashtags, altText, location });
  }, [caption, hashtags, altText, location, hasAnyInput]);

  // ── Data loading ──────────────────────────────────────────────────────────

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: token } : {};
  };

  const loadScheduledPosts = async () => {
    setIsLoadingScheduled(true);
    try {
      const res = await fetch('/api/instagram/schedule', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to load scheduled posts');
      setScheduledPosts(await res.json());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/instagram/history?limit=20', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to load post history');
      setHistory(await res.json());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'schedule') loadScheduledPosts();
    if (activeSubTab === 'history') loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab]);

  // ── Handlers: fields ─────────────────────────────────────────────────────

  const handleMediaUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/^image\/|^video\//.test(file.type)) {
      toast.error('Please upload an image or video file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Media must be under 50MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMedia({
        base64: reader.result, // full data URI, e.g. data:image/png;base64,...
        preview: reader.result,
        name: file.name,
        isVideo: file.type.startsWith('video'),
      });
    };
    reader.onerror = () => toast.error('Failed to read media file.');
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    const fileInput = document.getElementById('instagram-media-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleReset = () => {
    setCaption('');
    setHashtags('');
    setAltText('');
    setLocation('');
    setMedia(null);
    setHashtagSuggestions([]);
    setEditingScheduleId(null);
  };

  const handleSuggestHashtags = () => {
    const suggestions = extractHashtagSuggestions(caption, altText);
    setHashtagSuggestions(suggestions);
    if (suggestions.length === 0) toast.info('No hashtag suggestions found.');
  };

  const addSuggestedHashtag = tag => {
    const current = parseHashtags(hashtags);
    if (current.includes(tag)) return;
    setHashtags([...current, tag].join(' '));
  };

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

  const shareToInstagram = async () => {
    const text = buildCaptionForClipboard({ caption, hashtags });
    if (navigator.share && media) {
      try {
        const blob = await (await fetch(media.base64)).blob();
        const file = new File([blob], media.name || 'post', { type: blob.type });
        if (navigator.canShare && !navigator.canShare({ files: [file] })) {
          throw new Error('unsupported');
        }
        await navigator.share({ text, files: [file] });
        return;
      } catch {
        // fall through to clipboard + manual open
      }
    }
    await copyText(text, 'Caption');
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    toast.info('Caption copied — attach your media and paste it in Instagram.');
  };

  // ── Handlers: real posting ──────────────────────────────────────────────

  const buildRequestBody = () => ({
    description: buildCaptionForClipboard({ caption, hashtags }),
    mediaItems: media ? media.base64 : '',
    mediaAltText: trimmedAltText || null,
  });

  const handlePostNow = async () => {
    if (!captionValid) {
      toast.error(`Caption must be 1–${CAPTION_MAX} characters.`);
      return;
    }
    if (!hasMedia) {
      toast.error('Instagram requires an image or video — attach media first.');
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch('/api/instagram/createPin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(buildRequestBody()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to post to Instagram.');
      toast.success('Posted to Instagram!');
      handleReset();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsPosting(false);
    }
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

  const handleGoToSchedule = () => {
    if (!hasAnyInput) {
      toast.error('Add a caption and media before scheduling.');
      return;
    }
    setActiveSubTab('schedule');
  };

  const handleSaveSchedule = async () => {
    setScheduleAttemptedSave(true);
    if (!captionValid) {
      toast.error(`Caption must be 1–${CAPTION_MAX} characters.`);
      return;
    }
    if (!hasMedia) {
      toast.error('Instagram requires an image or video — attach media first.');
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error('Choose a schedule date and time.');
      return;
    }
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error('Scheduled time must be in the future.');
      return;
    }

    setIsPosting(true);
    try {
      if (editingScheduleId) {
        await fetch(`/api/instagram/schedule/${editingScheduleId}`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
      }
      const res = await fetch('/api/instagram/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          ...buildRequestBody(),
          scheduledTime: scheduledDateTime.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to schedule post.');
      toast.success(editingScheduleId ? 'Scheduled post updated.' : 'Post scheduled.');
      handleReset();
      setScheduleAttemptedSave(false);
      loadScheduledPosts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleEditSchedule = post => {
    try {
      const data = JSON.parse(post.postData);
      // Caption + hashtags were combined when originally scheduled, so they
      // load back into the caption field together — split them out again
      // manually if you want separate hashtag suggestions this time.
      setCaption(data.status || '');
      setHashtags('');
      setAltText(data.mediaAltText || '');
      setLocation('');
      if (data.local_media_base64) {
        setMedia({
          base64: data.local_media_base64,
          preview: data.local_media_base64,
          name: 'scheduled-media',
          isVideo: data.local_media_base64.startsWith('data:video'),
        });
      }
      const scheduled = new Date(post.scheduledTime);
      const { date, time } = clampScheduleDateTime(
        formatLocalDate(scheduled),
        formatLocalTime(scheduled),
      );
      setScheduledDate(date);
      setScheduledTime(time);
      setEditingScheduleId(post._id);
      setScheduleAttemptedSave(false);
      toast.info('Loaded scheduled post for editing.');
    } catch {
      toast.error('Could not load this scheduled post for editing.');
    }
  };

  const handleDeleteScheduled = async postId => {
    try {
      const res = await fetch(`/api/instagram/schedule/${postId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to delete scheduled post.');
      toast.success('Scheduled post deleted.');
      loadScheduledPosts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRetryScheduled = async postId => {
    try {
      const res = await fetch(`/api/instagram/schedule/${postId}/retry`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to retry post.');
      toast.success('Post re-queued.');
      loadScheduledPosts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBackToMake = () => {
    setScheduleAttemptedSave(false);
    setEditingScheduleId(null);
    setActiveSubTab('make');
  };

  const handleTabClick = id => {
    if (id === 'make') {
      setEditingScheduleId(null);
      setScheduleAttemptedSave(false);
    }
    setActiveSubTab(id);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={classNames(styles['instagram-autoposter'], { [styles.dark]: darkMode })}>
      <div className={classNames(styles['instagram-subtabs'], { [styles.dark]: darkMode })}>
        {subTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={classNames(styles['instagram-subtab'], {
              [styles.active]: activeSubTab === id,
            })}
            onClick={() => handleTabClick(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'make' && (
        <>
          <section className={styles['instagram-card']}>
            <h3>Instagram Auto Poster</h3>
            <p>Compose a caption and attach media, then post immediately or schedule it.</p>
            <div style={topCardActions()}>
              <button type="button" style={buttonStyle('outline', darkMode)} onClick={handleReset}>
                Clear fields
              </button>
            </div>
            <p className={styles['instagram-notice']}>
              Instagram requires an image or video on every post — text-only posts aren&apos;t
              supported by their API.
            </p>
          </section>

          <div className={styles['instagram-grid']}>
            {/* Media */}
            <div className={classNames(styles['instagram-card'], styles['instagram-card--wide'])}>
              <div className={styles['instagram-field__header']}>
                <label htmlFor="instagram-media-upload">Media *</label>
                <span className={styles['instagram-field__meta']}>image or video</span>
              </div>
              <label
                htmlFor="instagram-media-upload"
                className={styles['instagram-media-dropzone']}
              >
                {media ? 'Replace media' : 'Click to attach an image or video'}
                <input
                  id="instagram-media-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {media && (
                <div className={styles['instagram-media-preview']}>
                  {media.isVideo ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption -- local preview of unpublished upload
                    <video src={media.preview} controls />
                  ) : (
                    <img src={media.preview} alt="Upload preview" />
                  )}
                  <div>
                    <p className={styles['instagram-field__hint']}>{media.name}</p>
                    <button
                      type="button"
                      style={buttonStyle('ghost', darkMode)}
                      onClick={handleRemoveMedia}
                    >
                      Remove media
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Caption */}
            <div
              className={classNames(styles['instagram-card'], styles['instagram-card--wide'], {
                [styles.invalid]: highlightCaption,
              })}
            >
              <div className={styles['instagram-field__header']}>
                <label htmlFor="instagram-caption">Caption *</label>
                <span
                  className={classNames(styles['instagram-field__meta'], {
                    [styles.invalid]: highlightCaption,
                  })}
                >
                  {caption.length}/{CAPTION_MAX}
                </span>
              </div>
              <textarea
                id="instagram-caption"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                className={classNames(
                  styles['instagram-field__input'],
                  styles['instagram-field__textarea'],
                )}
                rows={5}
                placeholder="Write your caption…"
                maxLength={CAPTION_MAX}
              />
              {highlightCaption && (
                <p className={styles['instagram-field__error']}>
                  Caption must be 1–{CAPTION_MAX} characters.
                </p>
              )}
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(caption, 'Caption')}
                >
                  Copy caption
                </button>
              </div>
            </div>

            {/* Hashtags */}
            <div className={styles['instagram-card']}>
              <div className={styles['instagram-field__header']}>
                <label htmlFor="instagram-hashtags">Hashtags</label>
                <span className={styles['instagram-field__meta']}>optional, up to 30</span>
              </div>
              <input
                id="instagram-hashtags"
                type="text"
                value={hashtags}
                onChange={e => setHashtags(e.target.value)}
                className={styles['instagram-field__input']}
                placeholder="#travel #sunset #photography"
              />
              <div style={fieldActionRow}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleSuggestHashtags}
                >
                  Suggest hashtags
                </button>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={() => copyText(hashtags, 'Hashtags')}
                >
                  Copy hashtags
                </button>
              </div>
              {hashtagSuggestions.length > 0 && (
                <div className={styles['instagram-chip-row']}>
                  {hashtagSuggestions.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={styles['instagram-chip']}
                      onClick={() => addSuggestedHashtag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Alt text */}
            <div
              className={classNames(styles['instagram-card'], {
                [styles.invalid]: highlightAltText,
              })}
            >
              <div className={styles['instagram-field__header']}>
                <label htmlFor="instagram-alt-text">Alt text</label>
                <span
                  className={classNames(styles['instagram-field__meta'], {
                    [styles.invalid]: highlightAltText,
                  })}
                >
                  {altText.length}/{ALT_TEXT_MAX}
                </span>
              </div>
              <input
                id="instagram-alt-text"
                type="text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                className={styles['instagram-field__input']}
                placeholder="Describe the image for screen readers"
                maxLength={ALT_TEXT_MAX}
              />
              {highlightAltText && (
                <p className={styles['instagram-field__error']}>
                  Alt text exceeds {ALT_TEXT_MAX} characters.
                </p>
              )}
            </div>

            {/* Location */}
            <div className={styles['instagram-card']}>
              <div className={styles['instagram-field__header']}>
                <label htmlFor="instagram-location">Location</label>
                <span className={styles['instagram-field__meta']}>optional</span>
              </div>
              <input
                id="instagram-location"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className={styles['instagram-field__input']}
                placeholder="e.g. San Francisco, CA"
              />
              <p className={styles['instagram-field__hint']}>
                Reference note only — location tagging isn&apos;t exposed by the publishing API, so
                add it manually if it matters.
              </p>
            </div>
          </div>

          {/* Preview */}
          <section className={styles['instagram-card']}>
            <div className={styles['instagram-preview__header']}>
              <h4>Post preview</h4>
              <div className={styles['instagram-preview__actions']}>
                <button
                  type="button"
                  style={buttonStyle('ghost', darkMode)}
                  onClick={handleGoToSchedule}
                >
                  Schedule this post
                </button>
                <button
                  type="button"
                  style={buttonStyle('outline', darkMode)}
                  onClick={shareToInstagram}
                >
                  Share to Instagram
                </button>
                <button
                  type="button"
                  style={{ ...buttonStyle('primary', darkMode), opacity: readyToPost ? 1 : 0.5 }}
                  onClick={handlePostNow}
                  disabled={!readyToPost || isPosting}
                >
                  {isPosting ? 'Posting…' : 'Post Now'}
                </button>
              </div>
            </div>
            <pre className={styles['instagram-preview__body']}>{preview}</pre>
            {!readyToPost && (
              <p className={styles['instagram-preview__hint']}>
                Add a caption and attach media to enable posting.
              </p>
            )}
          </section>
        </>
      )}

      {activeSubTab === 'schedule' && (
        <div className={styles['instagram-scheduler__grid']}>
          <section
            className={classNames(styles['instagram-card'], styles['instagram-card--scheduler'])}
          >
            <h3>{editingScheduleId ? 'Update Scheduled Post' : 'Schedule Instagram Post'}</h3>
            <p>Set the publish date and time, then save it to the queue.</p>
            {editingScheduleId && (
              <p className={styles['instagram-scheduler__note']}>
                Editing a saved post. Saving will replace the existing scheduled entry.
              </p>
            )}
            <div className={styles['instagram-scheduler__controls']}>
              <ScheduleField
                id="instagram-schedule-date"
                type="date"
                label="Scheduled date"
                value={scheduledDate}
                min={today}
                onChange={handleScheduleDateChange}
                attemptedSave={scheduleAttemptedSave}
                errorText="Select a schedule date."
              />
              <ScheduleField
                id="instagram-schedule-time"
                type="time"
                label="Scheduled time"
                value={scheduledTime}
                min={scheduleTimeMin}
                onChange={handleScheduleTimeChange}
                attemptedSave={scheduleAttemptedSave}
                errorText="Select a schedule time."
              />
            </div>
            {media ? (
              <div className={styles['instagram-media-preview']}>
                {media.isVideo ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption -- local preview of unpublished upload
                  <video src={media.preview} controls />
                ) : (
                  <img src={media.preview} alt="" />
                )}
                <p className={styles['instagram-field__hint']}>{media.name}</p>
              </div>
            ) : (
              <p className={styles['instagram-field__error']}>
                No media attached — go back to Create Post and attach one before saving.
              </p>
            )}
            <div className={styles['instagram-scheduler__actions']}>
              <button
                type="button"
                style={buttonStyle('primary', darkMode)}
                disabled={isPosting}
                onClick={handleSaveSchedule}
              >
                {isPosting
                  ? 'Saving…'
                  : editingScheduleId
                  ? 'Update scheduled post'
                  : 'Save scheduled post'}
              </button>
              <button
                type="button"
                style={buttonStyle('outline', darkMode)}
                onClick={handleBackToMake}
              >
                Back to Create Post
              </button>
            </div>
          </section>

          <section
            className={classNames(styles['instagram-card'], styles['instagram-card--saved'])}
          >
            <h3>Queue</h3>
            <p className={styles['instagram-field__hint']}>
              Posts publish automatically at their scheduled time.
            </p>
            <div className={styles['instagram-saved__list']}>
              {isLoadingScheduled && (
                <p className={styles['instagram-scheduler__empty']}>Loading…</p>
              )}
              {!isLoadingScheduled && scheduledPosts.length === 0 && (
                <p className={styles['instagram-scheduler__empty']}>Nothing queued yet.</p>
              )}
              {!isLoadingScheduled &&
                scheduledPosts.map(post => {
                  let captionPreview = 'No content captured.';
                  try {
                    const data = JSON.parse(post.postData);
                    const text = data.status || '';
                    captionPreview =
                      text.length > 140
                        ? `${text.slice(0, 140).trim()}...`
                        : text || captionPreview;
                  } catch {
                    // keep default
                  }
                  const isEditing = post._id === editingScheduleId;

                  return (
                    <article
                      key={post._id}
                      className={classNames(styles['instagram-saved__item'], {
                        [styles['instagram-saved__item--active']]: isEditing,
                      })}
                    >
                      <div className={styles['instagram-saved__header']}>
                        <h4 className={styles['instagram-saved__title']}>
                          {STATUS_LABEL[post.status] || post.status}
                        </h4>
                        <span className={styles['instagram-saved__meta']}>
                          {formatDisplayDateTime(
                            formatLocalDate(new Date(post.scheduledTime)),
                            formatLocalTime(new Date(post.scheduledTime)),
                          )}
                        </span>
                      </div>
                      <p className={styles['instagram-saved__excerpt']}>{captionPreview}</p>
                      {post.status === 'failed' && post.lastError && (
                        <p className={styles['instagram-field__error']}>{post.lastError}</p>
                      )}
                      <div className={styles['instagram-saved__actions']}>
                        {post.status !== 'publishing' && (
                          <button
                            type="button"
                            style={buttonStyle('ghost', darkMode)}
                            onClick={() => handleEditSchedule(post)}
                          >
                            Edit
                          </button>
                        )}
                        {post.status === 'failed' && (
                          <button
                            type="button"
                            style={buttonStyle('outline', darkMode)}
                            onClick={() => handleRetryScheduled(post._id)}
                          >
                            Retry
                          </button>
                        )}
                        {post.status !== 'publishing' && (
                          <button
                            type="button"
                            style={buttonStyle('ghost', darkMode)}
                            onClick={() => handleDeleteScheduled(post._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        </div>
      )}

      {activeSubTab === 'history' && (
        <section className={styles['instagram-card']}>
          <h3>Post History</h3>
          {isLoadingHistory && <p className={styles['instagram-scheduler__empty']}>Loading…</p>}
          {!isLoadingHistory && history.length === 0 && (
            <p className={styles['instagram-scheduler__empty']}>No published posts yet.</p>
          )}
          {!isLoadingHistory && history.length > 0 && (
            <div className={styles['instagram-saved__list']}>
              {history.map(post => {
                let captionPreview = 'No content captured.';
                try {
                  const data = JSON.parse(post.postData);
                  captionPreview = data.status || captionPreview;
                } catch {
                  // keep default
                }
                return (
                  <article key={post._id} className={styles['instagram-saved__item']}>
                    <div className={styles['instagram-saved__header']}>
                      <h4 className={styles['instagram-saved__title']}>Published</h4>
                      <span className={styles['instagram-saved__meta']}>
                        {post.publishedAt
                          ? formatDisplayDateTime(
                              formatLocalDate(new Date(post.publishedAt)),
                              formatLocalTime(new Date(post.publishedAt)),
                            )
                          : '—'}
                      </span>
                    </div>
                    <p className={styles['instagram-saved__excerpt']}>{captionPreview}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

InstagramAutoPoster.propTypes = {
  platform: PropTypes.string,
};

InstagramAutoPoster.defaultProps = {
  platform: 'instagram',
};

export default InstagramAutoPoster;
