import { useEffect, useState } from 'react';
import styles from './YoutubeAutoPoster.module.css';

const readError = async response => {
  const body = await response.json().catch(() => null);
  return body?.error ?? `Request failed with status ${response.status}`;
};

const minimumScheduleTime = () => {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

function YoutubeAutoPoster({ platform }) {
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('youtube') === 'error'
      ? 'YouTube authorization failed. Please try connecting again.'
      : '';
  });
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('youtube')) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    void fetch('/api/auth/status')
      .then(async response => {
        if (!response.ok) throw new Error(await readError(response));
        return await response.json();
      })
      .then(setAuth)
      .catch(requestError => {
        setError(requestError instanceof Error ? requestError.message : 'Could not reach backend');
      });
  }, []);

  const disconnect = async () => {
    setError('');
    const response = await fetch('/api/auth/disconnect', { method: 'POST' });

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    setAuth(current => (current ? { ...current, connected: false } : current));
  };

  const submitVideo = async event => {
    event.preventDefault();
    setError('');
    setResult(null);
    setUploading(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const scheduledAt = formData.get('scheduledAt');

      if (typeof scheduledAt === 'string' && scheduledAt) {
        formData.set('scheduledAt', new Date(scheduledAt).toISOString());
      }

      const response = await fetch('/api/videos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await readError(response);

        if (response.status === 401 || response.status === 403) {
          setAuth(current => (current ? { ...current, connected: false } : current));
        }

        throw new Error(message);
      }

      setResult(await response.json());
      form.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main>
      <h1>YouTube Autoposter</h1>

      <section>
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
            <select name="privacyStatus" defaultValue="private">
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
      )}
    </main>
  );
}

export default YoutubeAutoPoster;
