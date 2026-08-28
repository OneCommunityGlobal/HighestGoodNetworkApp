import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
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
const YOUTUBE_CONNECTION_ATTEMPT_KEY = 'youtubeConnectionAttempt';
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
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('youtube') === 'error'
      ? 'YouTube authorization failed. Please try connecting again.'
      : '';
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagDraft, setTagDraft] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('public');
  const [audienceSettings, setAudienceSettings] = useState(initialAudienceSettings);

  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl('');
      setVideoDuration(null);
      return undefined;
    }

    const previewUrl = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [videoFile]);

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

    sessionStorage.setItem(YOUTUBE_CONNECTION_ATTEMPT_KEY, 'true');
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

    return result;
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
    const connectionWasJustRequested =
      sessionStorage.getItem(YOUTUBE_CONNECTION_ATTEMPT_KEY) === 'true';
    sessionStorage.removeItem(YOUTUBE_CONNECTION_ATTEMPT_KEY);

    async function checkConnection() {
      try {
        const connectionResult = await getYouTubeConnectionStatus();

        setConnected(Boolean(connectionResult.connected));
        setAccount(connectionResult.account ?? null);

        if (connectionWasJustRequested && connectionResult.connected && !connectionResult.account) {
          toast.error(
            'Your connected Google account does not have a YouTube channel. Create a channel, then try again.',
            { toastId: 'youtube-channel-not-found' },
          );
        }
      } catch (error) {
        setConnected(false);
        setAccount(null);
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
      setVideoDuration(null);
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

  const hasConnectedChannel = connected && account;

  return (
    <main
      className={`${styles.youtubeAutoPoster} ${!hasConnectedChannel ? styles.emptyStatePage : ''}`}
    >
      {hasConnectedChannel && <h1>YouTube Autoposter</h1>}
      {hasConnectedChannel ? (
        <section className={styles.accountCard} aria-label="Connected YouTube channel">
          <img
            className={styles.channelThumbnail}
            src={account.thumbnail}
            alt={`${account.channelName} channel thumbnail`}
          />
          <div className={styles.channelDetails}>
            <span className={styles.connectedBadge}>
              <span className={styles.connectedDot} aria-hidden="true" />
              Connected
            </span>
            <h2 className={styles.channelName}>{account.channelName}</h2>
            <a
              className={styles.channelUrl}
              href={
                /^https?:\/\//i.test(account.customUrl)
                  ? account.customUrl
                  : `https://www.youtube.com/${account.customUrl.replace(/^\/+/, '')}`
              }
              target="_blank"
              rel="noreferrer"
            >
              {account.customUrl}
            </a>
          </div>
        </section>
      ) : (
        <section
          className={styles.connectionPrompt}
          aria-labelledby="youtube-connection-title"
          aria-live="polite"
        >
          <div className={styles.emptyStateContent}>
            <div className={styles.youtubeMark} aria-hidden="true">
              <span className={styles.playIcon} />
            </div>
            <h1 id="youtube-connection-title" className={styles.connectionTitle}>
              {checking ? 'Checking YouTube connection…' : 'Connect your YouTube channel'}
            </h1>
            {!checking && (
              <p className={styles.connectionDescription}>
                Link your channel once, then upload and publish videos without leaving the app.
              </p>
            )}
            {!checking && (
              <>
                <button
                  className={styles.connectButton}
                  type="button"
                  onClick={() => void connectYouTube()}
                >
                  Connect YouTube
                </button>
                <p className={styles.connectionHint}>You’ll continue securely with Google.</p>
              </>
            )}
          </div>
        </section>
      )}
      {hasConnectedChannel && (
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
            <div className={styles.videoSourceTile}>
              {videoPreviewUrl && (
                <div className={styles.videoThumb}>
                  <video
                    src={videoPreviewUrl}
                    muted
                    preload="metadata"
                    onLoadedMetadata={event => setVideoDuration(event.currentTarget.duration)}
                    aria-label="Selected video preview"
                  />
                </div>
              )}
              <div className={styles.videoMeta}>
                <p
                  className={`${styles.videoFilename} ${!videoFile ? styles.emptyVideoPrompt : ''}`}
                >
                  {videoFile ? videoFile.name : 'Choose a video to upload'}
                </p>
                {videoFile && (
                  <div className={styles.videoSpecs}>
                    <span>
                      Size <strong>{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</strong>
                    </span>
                    {videoDuration && (
                      <span>
                        Length{' '}
                        <strong>
                          {Math.floor(videoDuration / 60)}:
                          {String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                        </strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <label className={styles.replaceButton}>
                {videoFile ? 'Replace' : 'Choose video'}
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  aria-label="Video source"
                  className={styles.fileInput}
                  onChange={event => setVideoFile(event.target.files?.[0] ?? null)}
                  required={!videoFile}
                />
              </label>
            </div>
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
          <section className={`${styles.card}`} aria-labelledby="audience-settings-title">
            <h4 id="audience-settings-title" className={styles.togglesTitle}>
              Audience &amp; embed
            </h4>
            <div className={styles.togglesList}>
              {AUDIENCE_SETTINGS.map(setting => {
                const labelId = `${setting.key}-label`;
                const descriptionId = `${setting.key}-description`;

                return (
                  <div key={setting.key} className={styles.toggleRow}>
                    <div className={styles.toggleText}>
                      <span id={labelId} className={styles.toggleLabel}>
                        {setting.label}
                      </span>
                      <p id={descriptionId} className={styles.toggleDescription}>
                        {setting.description}
                      </p>
                    </div>
                    <label className={styles.switchControl}>
                      <input
                        id={setting.key}
                        type="checkbox"
                        role="switch"
                        className={styles.toggleInput}
                        name={setting.key}
                        checked={audienceSettings[setting.key]}
                        aria-labelledby={labelId}
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
                    </label>
                  </div>
                );
              })}
            </div>
          </section>

          <button type="submit" disabled={!connected || checking || uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      )}
      {error && <p role="alert">Error: {error}</p>}
      {result?.video && (
        <p>
          Upload complete:{' '}
          <a href={result.video.url} target="_blank" rel="noreferrer">
            Open video on YouTube
          </a>
        </p>
      )}
    </main>
  );
}

export default YoutubeAutoPoster;
