import { useEffect, useState } from 'react';
import styles from './YoutubeAutoPoster.module.css';
import { ENDPOINTS } from '~/utils/URL';

const readError = async response => {
  const body = await response.json().catch(() => null);
  return body?.error ?? `Request failed with status ${response.status}`;
};

const minimumScheduleTime = () => {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

const MAX_TAGS = 500;
const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'unlisted', label: 'Unlisted' },
  { value: 'private', label: 'Private' },
];
const AUDIENCE_SETTINGS = [
  {
    key: 'notifySubscribers',
    label: 'Notify subscribers',
    description: 'Send a push to your subscribers when published.',
    defaultValue: false,
  },
  {
    key: 'embeddable',
    label: 'Embeddable',
    description: 'Allow other sites to embed your video.',
    defaultValue: true,
  },
  {
    key: 'publicStatsViewable',
    label: 'Public stats viewable',
    description: 'Show like / view counts publicly.',
    defaultValue: true,
  },
  {
    key: 'containsSyntheticMedia',
    label: 'Contains synthetic media',
    description: 'AI-generated or synthetic content.',
    defaultValue: false,
  },
];

const initialAudienceSettings = Object.fromEntries(
  AUDIENCE_SETTINGS.map(setting => [setting.key, setting.defaultValue]),
);

function YoutubeAutoPoster({ platform }) {
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('youtube') === 'error'
      ? 'YouTube authorization failed. Please try connecting again.'
      : '';
  });
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagDraft, setTagDraft] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [audienceSettings, setAudienceSettings] = useState(initialAudienceSettings);

  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  const addTag = rawValue => {
    const normalized = rawValue.trim().replace(/^#+/, '');
    if (!normalized) return;
    if (tags.length >= MAX_TAGS) return;
    if (tags.includes(normalized)) {
      setTagDraft('');
      return;
    }
    setTags(current => [...current, normalized]);
    setTagDraft('');
  };

  const removeTag = value => {
    setTags(current => current.filter(tag => tag !== value));
  };

  const commitDraft = event => {
    event.preventDefault();
    addTag(tagDraft);
  };

  const splitAndAddDraft = (rawValue = tagDraft) => {
    const pieces = rawValue
      .split(',')
      .map(piece => piece.trim())
      .filter(Boolean);
    if (pieces.length === 0) return;
    const remainingSlots = MAX_TAGS - tags.length;
    const accepted = pieces.slice(0, remainingSlots);
    if (accepted.length === 0) return;
    setTags(current => {
      const next = [...current];
      for (const piece of accepted) {
        if (!next.includes(piece)) next.push(piece);
      }
      return next;
    });
    setTagDraft('');
  };

  async function connectYouTube() {
    const token = localStorage.getItem('token');

    const response = await fetch(ENDPOINTS.YOUTUBE_AUTOPOSTER_AUTH_URL, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to connect YouTube');
    }

    window.location.assign(result.authUrl);
  }

  async function getYouTubeConnectionStatus() {
    const token = localStorage.getItem('token');

    const response = await fetch(ENDPOINTS.YOUTUBE_AUTOPOSTER_STATUS_URL, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to check YouTube connection');
    }

    return result.connected;
  }

  async function uploadYouTubeVideo(videoFile, values) {
    const token = localStorage.getItem('token');
    const formData = new FormData();

    formData.append('video', videoFile);
    formData.append(
      'metadata',
      JSON.stringify({
        title: values.title,
        description: values.description || '',
        categoryId: values.categoryId,
        tags: values.tags || [],
        privacyStatus: values.privacyStatus || 'private',
        madeForKids: values.madeForKids,
        notifySubscribers: values.notifySubscribers ?? false,
        embeddable: values.embeddable ?? true,
        publicStatsViewable: values.publicStatsViewable ?? true,
        containsSyntheticMedia: values.containsSyntheticMedia ?? false,
      }),
    );

    const response = await fetch(ENDPOINTS.YOUTUBE_AUTOPOSTER_UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      credentials: 'include',
      body: formData,
    });

    const uploadResult = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(uploadResult?.message || 'YouTube upload failed');
    }

    return uploadResult;
  }

  useEffect(() => {
    async function checkConnection() {
      try {
        const status = await getYouTubeConnectionStatus();
        setConnected(status);
      } catch (error) {
        setConnected(false);
      } finally {
        setChecking(false);
      }
    }

    checkConnection();
  }, []);

  // const disconnect = async () => {
  //   setError('');
  //   const response = await fetch('/api/auth/disconnect', { method: 'POST' });

  //   if (!response.ok) {
  //     setError(await readError(response));
  //     return;
  //   }

  //   setAuth(current => (current ? { ...current, connected: false } : current));
  // };

  const submitVideo = async event => {
    event.preventDefault();
    setError('');
    setResult(null);
    setUploading(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      if (!videoFile || videoFile.size === 0 || !videoFile.type.startsWith('video/')) {
        throw new Error('Select a video file to upload');
      }

      const values = {
        title: formData.get('title'),
        description: formData.get('description'),
        categoryId: formData.get('categoryId'),
        tags,
        privacyStatus,
        madeForKids: formData.get('madeForKids') === 'true',
        ...audienceSettings,
      };

      setResult(await uploadYouTubeVideo(videoFile, values));
      form.reset();
      setVideoFile(null);
      setTags([]);
      setTagDraft('');
      setPrivacyStatus('public');
      setAudienceSettings(initialAudienceSettings);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className={styles.youtubeAutoPoster}>
      <h1>YouTube Autoposter</h1>
      <button type="button" onClick={connectYouTube}>
        click me
      </button>

      {connected ? <p>YouTube account connected</p> : <p>not connected</p>}

      <form
        className={styles.form}
        aria-label="YouTube video upload"
        onSubmit={event => void submitVideo(event)}
      >
        {/* Video details */}
        <section className={styles.card}>
          <h4 className={styles.cardTitle}>Video details</h4>
          <div className={styles.cardContent}>
            <div className={styles.inputGroup}>
              <label htmlFor="videoTitle" className={styles.inputLabel}>
                Video Title <span className={styles.inputRequired}>*</span>
              </label>
              <input
                id="videoTitle"
                name="title"
                type="text"
                className={styles.inputField}
                maxLength={100}
                required
              />
            </div>
            <div className={styles.horizontal}>
              <div className={styles.inputGroup}>
                <label htmlFor="categoryId" className={styles.inputLabel}>
                  Category <span className={styles.inputRequired}>*</span>
                </label>
                <input
                  id="categoryId"
                  name="categoryId"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  className={styles.inputField}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="madeForKids" className={styles.inputLabel}>
                  Made for kids <span className={styles.inputRequired}>*</span>
                </label>
                <select
                  id="madeForKids"
                  name="madeForKids"
                  className={styles.inputField}
                  defaultValue="false"
                  required
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="videoDescription" className={styles.inputLabel}>
                Description <span className={styles.inputOptional}>Optional</span>
              </label>
              <input
                id="videoDescription"
                name="description"
                type="text"
                className={styles.inputField}
                maxLength={5000}
              />
            </div>
          </div>
        </section>

        {/* Video upload */}
        <section className={styles.card}>
          <h4 className={styles.cardTitle}>Video source</h4>
          <input
            type="file"
            name="video"
            accept="video/*"
            aria-label="Video source"
            onChange={event => setVideoFile(event.target.files?.[0] ?? null)}
            required
          />
        </section>

        {/* Tags */}
        <section className={styles.card}>
          <div className={styles.tagsHead}>
            <h4 className={styles.cardTitle}>
              Tags <span className={styles.inputOptional}>Optional</span>
            </h4>
            <span className={styles.tagCount}>
              {tags.length} / {MAX_TAGS}
            </span>
          </div>
          <div className={styles.tagsWrap}>
            {tags.map(tag => (
              <span key={tag} className={styles.tagChip}>
                <span className={styles.tagText}>#{tag}</span>
                <button
                  type="button"
                  className={styles.tagRemove}
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => removeTag(tag)}
                >
                  ✕
                </button>
              </span>
            ))}
            <span className={styles.addTagChip}>
              +
              <input
                type="text"
                className={styles.addTagInput}
                placeholder="add tag"
                value={tagDraft}
                onChange={event => {
                  const { value } = event.target;
                  if (value.includes(',')) {
                    splitAndAddDraft(value);
                    return;
                  }
                  setTagDraft(value);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ',') {
                    commitDraft(event);
                  } else if (event.key === 'Backspace' && tagDraft === '' && tags.length > 0) {
                    removeTag(tags[tags.length - 1]);
                  }
                }}
                onBlur={() => splitAndAddDraft()}
                disabled={tags.length >= MAX_TAGS}
              />
            </span>
          </div>
          <p className={styles.tagHint}>
            Use commas or Enter to separate. Tags help YouTube recommend your video.
          </p>
        </section>

        {/* Visibility */}
        <section className={styles.card}>
          <div className={styles.visibilityHead}>
            <h4 id="visibility-title" className={styles.visibilityTitle}>
              Visibility
            </h4>
            <span
              className={`${styles.visibilityStatus} ${styles[`${privacyStatus}Status`]}`}
              aria-live="polite"
            >
              {privacyStatus.toUpperCase()}
            </span>
          </div>
          <div className={styles.visibilityOptions}>
            {PRIVACY_OPTIONS.map(option => (
              <label key={option.value} className={styles.visibilityChoice}>
                <input
                  type="radio"
                  className={styles.visibilityInput}
                  name="visibilityPicker"
                  value={option.value}
                  checked={privacyStatus === option.value}
                  onChange={event => setPrivacyStatus(event.target.value)}
                />
                <span className={styles.visibilityOption}>{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Audience & Embed */}
        <section
          className={`${styles.card} ${styles.togglesCard}`}
          aria-labelledby="audience-settings-title"
        >
          <h4 id="audience-settings-title" className={styles.togglesTitle}>
            Audience &amp; embed
          </h4>
          <div className={styles.togglesList}>
            {AUDIENCE_SETTINGS.map(setting => {
              const descriptionId = `${setting.key}-description`;

              return (
                <div key={setting.key} className={styles.toggleRow}>
                  <div className={styles.toggleText}>
                    <label htmlFor={setting.key} className={styles.toggleLabel}>
                      {setting.label}
                    </label>
                    <p id={descriptionId} className={styles.toggleDescription}>
                      {setting.description}
                    </p>
                  </div>
                  <input
                    id={setting.key}
                    type="checkbox"
                    role="switch"
                    className={styles.toggleInput}
                    name={setting.key}
                    checked={audienceSettings[setting.key]}
                    aria-describedby={descriptionId}
                    onChange={event =>
                      setAudienceSettings(current => ({
                        ...current,
                        [setting.key]: event.target.checked,
                      }))
                    }
                  />
                  <span className={styles.toggleTrack} aria-hidden="true">
                    <span className={styles.toggleKnob} />
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <button type="submit" disabled={!connected || checking || uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>

      {error && <p role="alert">Error: {error}</p>}

      {result?.video && (
        <p>
          Upload complete:{' '}
          <a href={result.video.url} target="_blank" rel="noreferrer">
            Open video on YouTube
          </a>
        </p>
      )}

      {/* <section>
        <h2>1. Connect YouTube</h2>
        {auth === null && <p>Checking connection…</p>}
        {auth && !auth.configured && (
          <p>Google OAuth is not configured. Add the credentials to backend/.env.</p>
        )}
        {auth?.configured && !auth.connected && (
          <a href="/api/auth/google">Connect YouTube account</a>
        )}
        {auth?.connected && (
          <p>
            YouTube is connected.{' '}
            <button type="button" onClick={() => void disconnect()}>
              Disconnect
            </button>
          </p>
        )}
      </section>

      <section>
        <h2>2. Upload video</h2>
        <form className={styles.form} onSubmit={event => void submitVideo(event)}>
          <label>
            Video file
            <input type="file" name="video" accept="video/*" required />
          </label>

          <label>
            Title
            <input type="text" name="title" maxLength={100} required />
          </label>

          <label>
            Description
            <textarea name="description" maxLength={5000} rows={5} />
          </label>

          <label>
            Tags (comma separated)
            <input type="text" name="tags" />
          </label>

          <label>
            Category
            <select name="categoryId" defaultValue="22">
              <option value="22">People &amp; Blogs</option>
              <option value="24">Entertainment</option>
              <option value="27">Education</option>
              <option value="28">Science &amp; Technology</option>
            </select>
          </label>

          <label>
            Audience
            <select name="madeForKids" defaultValue="false" required>
              <option value="false">No, it is not made for kids</option>
              <option value="true">Yes, it is made for kids</option>
            </select>
          </label>

          <label>
            Privacy when publishing now
            <select
              name="privacyStatus"
              value={privacyStatus}
              onChange={event => setPrivacyStatus(event.target.value)}
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </label>

          <label>
            Schedule publication (optional, local time)
            <input type="datetime-local" name="scheduledAt" min={minimumScheduleTime()} />
          </label>
          <small>
            Scheduled videos are uploaded as private and published by YouTube at this time.
          </small>

          <button type="submit" disabled={!auth?.connected || uploading}>
            {uploading ? 'Uploading…' : 'Upload to YouTube'}
          </button>
        </form>
      </section>

      {error && <p role="alert">Error: {error}</p>}

      {result && (
        <section>
          <h2>Upload complete</h2>
          <p>
            <a href={result.youtubeUrl} target="_blank" rel="noreferrer">
              Open video on YouTube
            </a>
          </p>
          <p>Privacy: {result.privacyStatus}</p>
          {result.publishAt && <p>Scheduled for: {new Date(result.publishAt).toLocaleString()}</p>}
        </section>
      )} */}
    </main>
  );
}

export default YoutubeAutoPoster;
