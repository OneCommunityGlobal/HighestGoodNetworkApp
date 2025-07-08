import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from 'styles';
import './Announcements.css';

function YoutubeUploadHistory() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);
  const [scheduledUploads, setScheduledUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4500/api/youtubeAccounts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAccounts(response.data);
      } catch (error) {
        toast.error('Failed to fetch YouTube accounts');
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchUploadHistory = async () => {
      if (!selectedAccountId) {
        setUploadHistory([]);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4500/api/youtubeUploadHistory', {
          headers: { Authorization: `Bearer ${token}` },
          params: { youtubeAccountId: selectedAccountId },
        });
        setUploadHistory(response.data);
      } catch (error) {
        toast.error('Failed to fetch upload history');
        setUploadHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUploadHistory();
  }, [selectedAccountId]);

  const fetchScheduledUploads = async () => {
    if (!selectedAccountId) {
      setScheduledUploads([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4500/api/youtubeScheduledUploads', {
        headers: { Authorization: `Bearer ${token}` },
        params: { youtubeAccountId: selectedAccountId },
      });
      setScheduledUploads(response.data);
    } catch (error) {
      toast.error('Failed to fetch scheduled uploads');
      setScheduledUploads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowScheduled = () => {
    setShowScheduled(!showScheduled);
    if (!showScheduled) {
      fetchScheduledUploads();
    }
  };

  const historyToDisplay = uploadHistory.filter(item => item.videoId);

  return (
    <div className={`social-media-container ${darkMode ? 'bg-oxford-blue text-light' : ''}`}>
      <div className="social-media">
        <h3>YouTube Upload History</h3>

        <div
          className="account-selector"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '20px',
            marginBottom: '1rem',
          }}
        >
          <select
            id="yt-account-select"
            className="select-youtube-account"
            value={selectedAccountId}
            onChange={e => setSelectedAccountId(e.target.value)}
            style={{ ...(darkMode ? boxStyleDark : boxStyle) }}
          >
            <option value="">Select YouTube Account</option>
            <option value="test1">Test Channel 1</option>
            <option value="test2">Test Channel 2</option>
            {accounts
              .filter(
                account =>
                  account.displayName !== 'Test Channel 1' &&
                  account.displayName !== 'Test Channel 2',
              )
              .map(account => (
                <option key={account.id} value={account.id}>
                  {account.displayName}
                </option>
              ))}
          </select>
          {selectedAccountId && (
            <button
              type="button"
              onClick={handleShowScheduled}
              className="send-button"
              style={darkMode ? boxStyleDark : boxStyle}
            >
              {showScheduled ? 'Hide Scheduled' : 'Show Scheduled'}
            </button>
          )}
        </div>

        {loading && <p>Loading...</p>}

        {!loading && showScheduled && (
          <div className="scheduled-uploads" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h4>Scheduled Uploads</h4>
              <button
                type="button"
                onClick={fetchScheduledUploads}
                className="send-button"
                style={{
                  ...(darkMode ? boxStyleDark : boxStyle),
                  padding: '4px 8px',
                  fontSize: '12px',
                }}
              >
                Refresh
              </button>
            </div>
            {scheduledUploads.length > 0 ? (
              scheduledUploads.map(item => (
                <div
                  key={item._id}
                  className={`scheduled-item ${darkMode ? 'bg-yinmn-blue' : ''}`}
                  style={{
                    ...(darkMode ? boxStyleDark : boxStyle),
                    marginBottom: '1rem',
                    padding: '1rem',
                    border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
                    borderRadius: '8px',
                  }}
                >
                  <h5>{item.title}</h5>
                  <p>
                    <strong>Scheduled Time:</strong> {new Date(item.scheduledTime).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {item.status}
                  </p>
                  <p>
                    <strong>Privacy:</strong> {item.privacyStatus}
                  </p>
                  {item.description && (
                    <p>
                      <strong>Description:</strong> {item.description}
                    </p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <p>
                      <strong>Tags:</strong> {item.tags.join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No scheduled uploads found for this account.</p>
            )}
          </div>
        )}

        {!loading && !showScheduled && (
          <div className="history-list">
            {historyToDisplay.length > 0 ? (
              historyToDisplay.map(item => (
                <div
                  key={item._id}
                  className={`history-item ${darkMode ? 'bg-yinmn-blue' : ''}`}
                  style={{
                    ...(darkMode ? boxStyleDark : boxStyle),
                    marginBottom: '1rem',
                    padding: '1rem',
                    border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h4>{item.title}</h4>
                    <p>
                      <strong>Published At:</strong>{' '}
                      {new Date(
                        item.uploadTime || item.publishedAt || item.uploadDate,
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Video ID:</strong> {item.videoId || 'Not Available'}
                    </p>
                    {item.error && (
                      <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {item.error}</p>
                    )}
                    {item.videoId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${item.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt={`Thumbnail for ${item.title}`}
                      style={{
                        width: '180px',
                        height: '135px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  )}
                </div>
              ))
            ) : (
              <p>
                {selectedAccountId
                  ? 'No upload history found for this account.'
                  : 'Please select an account to see upload history.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default YoutubeUploadHistory;
