import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function YouTubeAutoPosterCallback() {
  const history = useHistory();
  const requestStarted = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent React StrictMode from exchanging the same code twice.
    if (requestStarted.current) return;
    requestStarted.current = true;

    async function completeConnection() {
      const query = new URLSearchParams(window.location.search);
      const code = query.get('code');
      const state = query.get('state');
      const googleError = query.get('error');

      if (googleError) {
        setError(`Google authorization failed: ${googleError}`);
        return;
      }

      if (!code || !state) {
        setError('Google did not return an authorization code or state.');
        return;
      }

      // Replace this with your application's existing authentication state.
      const authToken = localStorage.getItem('token');

      if (!authToken) {
        setError('Your login session was not found. Please log in again.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:4500/api/youtube/connect`, {
          method: 'POST',
          headers: {
            Authorization: authToken,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ code, state }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Unable to connect YouTube');
        }

        history.replace('/announcements/youtube', {
          replace: true,
          state: {
            message: 'YouTube account connected successfully',
          },
        });
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    completeConnection();
  }, [history]);

  if (error) {
    return (
      <main>
        <h1>YouTube connection failed</h1>
        <p>{error}</p>
        <button type="button" onClick={() => history.replace('/announcements/youtube')}>
          Return to upload
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Connecting YouTube</h1>
      <p>Please wait while your YouTube account is connected.</p>
    </main>
  );
}
