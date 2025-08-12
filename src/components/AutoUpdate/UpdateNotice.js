import { useEffect, useState } from 'react';
import './UpdateNotice.css';

const VERSION_URL = '/version.txt'; // Served by your app on each deployment

function UpdateNotice() {
  const [showNotice, setShowNotice] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    fetch(VERSION_URL, { cache: 'no-cache' })
      .then(response => response.text())
      .then(currentVersion => {
        const lastVersion = localStorage.getItem('appVersion');

        if (lastVersion && lastVersion !== currentVersion) {
          setShowNotice(true);
        }

        localStorage.setItem('appVersion', currentVersion);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Error fetching version.txt:', error);
      });
  }, []);

  if (!showNotice) return null;

  return (
    <div className="notice-popup">
      <p>
        <strong>A recent update has been merged from Dev to Main.</strong>
        <br />
        To ensure you’re working with the latest changes, please refresh your app.
        <span
          title="Click for help"
          onClick={() => setShowInfo(!showInfo)}
          style={{ cursor: 'pointer', marginLeft: '5px' }}
        >
          ℹ️
        </span>
      </p>
      <p>Thank you for keeping your workspace up to date!</p>
      {showInfo && (
        <div id="info-box">
          <p>
            The easy way to refresh the app is{' '}
            <strong>Command (Mac)/Control (PC) + Shift + R</strong>.<br />
            If that doesn’t work, try also emptying your cache for that page:
            <br />
            Right-click anywhere on the app screen → choose “Inspect” →<br />
            Right-click the refresh icon (top-left of the browser) → “Empty Cache and Hard Reload”.
          </p>
        </div>
      )}
      <button type="button" onClick={() => window.location.reload()}>
        Refresh Now
      </button>
    </div>
  );
}

export default UpdateNotice;
