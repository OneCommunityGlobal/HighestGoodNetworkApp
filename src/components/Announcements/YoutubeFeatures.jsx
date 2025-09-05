import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from '../../styles';
import './Announcements.css';

function YoutubeFeatures() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState('');
  const [youtubeAccounts, setYoutubeAccounts] = useState([]);
  const [selectedYoutubeAccountId, setSelectedYoutubeAccountId] = useState('');
  const [showYoutubeDropdown, setShowYoutubeDropdown] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTags, setVideoTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('private');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch upload history function must be defined before useEffect
  const fetchUploadHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4500/api/youtubeUploadHistory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploadHistory(response.data);
    } catch (error) {
      toast.error('Failed to fetch upload history');
    }
  };

  useEffect(() => {
    fetch('/api/youtubeAccounts')
      .then(res => res.json())
      .then(data => setYoutubeAccounts(data))
      .catch(() => {});
    // Fetch upload history
    fetchUploadHistory();
  }, []);

  const handleVideoChange = e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoURL(url);
    } else {
      setVideoFile(null);
      setVideoURL('');
      toast.error('Please select a valid video file');
    }
  };

  const handlePostVideoToYouTube = async () => {
    if (!videoFile || !selectedYoutubeAccountId) {
      toast.error('Please select a video and YouTube account');
      return;
    }
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('youtubeAccountId', selectedYoutubeAccountId);
    formData.append('title', videoTitle);
    formData.append('description', videoDescription);
    formData.append('tags', videoTags);
    formData.append('privacyStatus', privacyStatus);
    if (isScheduled && scheduledTime) {
      formData.append('scheduledTime', scheduledTime);
    }
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.post('http://localhost:4500/api/uploadYtVideo', formData, {
        headers,
      });
      if (res.status === 200) {
        toast.success(
          isScheduled ? 'Video scheduled successfully!' : 'Video uploaded successfully!',
        );
        setShowYoutubeDropdown(false);
        setSelectedYoutubeAccountId('');
        // Refresh upload history
        fetchUploadHistory();
      } else {
        toast.error('Video upload failed');
      }
    } catch (err) {
      toast.error('Upload error');
    }
  };

  return (
    <div className="social-media-container">
      <div className="social-media">
        <h3>Social Media Post</h3>
        <span className={darkMode ? 'text-light' : 'text-dark'}>
          Click on below social media to post
        </span>
        <div
          className="social-buttons-container"
          style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
        >
          <button
            type="button"
            onClick={() => setShowYoutubeDropdown(true)}
            className="send-button"
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Post video to YouTube channel
          </button>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="send-button"
            style={darkMode ? boxStyleDark : boxStyle}
          >
            View Upload History
          </button>
          {showYoutubeDropdown && (
            <>
              <select
                className="select-youtube-account"
                value={selectedYoutubeAccountId}
                onChange={e => setSelectedYoutubeAccountId(e.target.value)}
              >
                <option value="">Select YouTube Account</option>
                <option value="test1">Test Channel 1</option>
                <option value="test2">Test Channel 2</option>
                {youtubeAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.displayName || acc.name || acc.clientId}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="send-button"
                disabled={!videoFile || !selectedYoutubeAccountId}
                onClick={handlePostVideoToYouTube}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Submit
              </button>
              <button
                type="button"
                className="send-button"
                onClick={() => setShowYoutubeDropdown(false)}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Upload History Modal */}
      {showHistory && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: darkMode ? '#333' : 'white',
              padding: '20px',
              borderRadius: '8px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ color: darkMode ? 'white' : 'black' }}>Upload History</h3>
            <div style={{ marginTop: '20px' }}>
              {uploadHistory.map(item => (
                <div
                  key={item.id || item._id || item.title}
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #ccc',
                    color: darkMode ? 'white' : 'black',
                  }}
                >
                  <h4>{item.title}</h4>
                  <p>Status: {item.status}</p>
                  <p>Upload Time: {new Date(item.uploadTime).toLocaleString()}</p>
                  {item.scheduledTime && (
                    <p>Scheduled Time: {new Date(item.scheduledTime).toLocaleString()}</p>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              style={{
                marginTop: '20px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="video-preview-container">
        <input type="file" accept="video/*" onChange={handleVideoChange} />
        <input
          type="text"
          placeholder="Video Title"
          value={videoTitle}
          onChange={e => setVideoTitle(e.target.value)}
          style={{ marginTop: 10, width: '100%', padding: 8 }}
        />
        <input
          type="text"
          placeholder="Video Description"
          value={videoDescription}
          onChange={e => setVideoDescription(e.target.value)}
          style={{ marginTop: 10, width: '100%', padding: 8 }}
        />
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={videoTags}
          onChange={e => setVideoTags(e.target.value)}
          style={{ marginTop: 10, width: '100%', padding: 8 }}
        />
        <select
          value={privacyStatus}
          onChange={e => setPrivacyStatus(e.target.value)}
          style={{ marginTop: 10, width: '100%', padding: 8 }}
        >
          <option value="private">Private</option>
          <option value="unlisted">Unlisted</option>
          <option value="public">Public</option>
        </select>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            id="schedule-post"
            type="checkbox"
            checked={isScheduled}
            onChange={e => setIsScheduled(e.target.checked)}
          />
          <label htmlFor="schedule-post">Schedule Post</label>
          {isScheduled && (
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={e => setScheduledTime(e.target.value)}
              style={{ padding: 8 }}
            />
          )}
        </div>
        {videoURL && (
          <div>
            <video width="480" controls aria-label="Video Preview">
              <source src={videoURL} type={videoFile.type} />
              <track kind="captions" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
}

export default YoutubeFeatures;
