import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from 'styles';
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

  useEffect(() => {
    fetch('/api/youtubeAccounts')
      .then(res => res.json())
      .then(data => setYoutubeAccounts(data))
      .catch(() => {});
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

  const oauthSignIn = () => {
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = {
      client_id: '79576137807-b7j4fsdm0u9pgorsohcq97gqsaglf7la.apps.googleusercontent.com',
      redirect_uri: 'http://localhost:3000/youtube-features',
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      include_granted_scopes: 'true',
      state: 'pass-through value',
    };
    const form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint);
    Object.keys(params).forEach(p => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
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
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.post('http://localhost:4500/api/uploadYtVideo', formData, {
        headers,
      });
      if (res.status === 200) {
        toast.success('Video uploaded successfully!');
        setShowYoutubeDropdown(false);
        setSelectedYoutubeAccountId('');
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
        <label className={darkMode ? 'text-light' : 'text-dark'}>
          Click on below social media to post
        </label>
        <div
          className="social-buttons-container"
          style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
        >
          <button
            type="button"
            className="send-button"
            onClick={oauthSignIn}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Sign in with Google
          </button>
          <button
            type="button"
            className="send-button"
            onClick={() => setShowYoutubeDropdown(true)}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Post video to YouTube channel
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