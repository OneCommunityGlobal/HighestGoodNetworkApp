import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';

async function convertImageToBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Immediate Post
export async function handleImmediatePost({
  platform,
  title,
  description,
  imageUrl,
  imageFile,
  imgType,
}) {
  let postValue;

  if (imgType === 'URL') {
    postValue = {
      title,
      description,
      imgType,
      mediaItems: { url: imageUrl },
    };
  } else {
    const base64Image = await convertImageToBase64(imageFile);
    postValue = {
      title,
      description,
      imgType,
      mediaItems: base64Image,
    };
  }

  try {
    await axios.post(ENDPOINTS[`POST_${platform.toUpperCase()}`], postValue);
    toast.success(`Post to ${platform} successful!`);
  } catch (err) {
    toast.error(err.response?.data?.error || `Failed to post to ${platform}!`, {
      autoClose: false,
    });
  }
}

//  Schedule Post
export async function handleSchedulePost({
  platform,
  title,
  description,
  imageUrl,
  imageFile,
  imgType,
  scheduledTime,
}) {
  let postValue;

  if (imgType === 'URL') {
    postValue = {
      title,
      description,
      imgType,
      mediaItems: { url: imageUrl },
    };
  } else {
    const base64Image = await convertImageToBase64(imageFile);
    postValue = {
      title,
      description,
      imgType,
      mediaItems: base64Image,
    };
  }

  try {
    await axios.post(ENDPOINTS[`SCHEDULE_${platform.toUpperCase()}`], {
      ...postValue,
      scheduledTime,
    });
    toast.success(`Schedule for ${platform} successful!`);
  } catch (err) {
    toast.error(err.response?.data?.error || `Failed to schedule post on ${platform}!`, {
      autoClose: false,
    });
  }
}

//  Delete Scheduled
export async function handleDeleteScheduled({ platform, id }) {
  try {
    await axios.delete(`${ENDPOINTS[`SCHEDULE_${platform.toUpperCase()}`]}/${id}`);
    toast.success('Scheduled post deleted successfully!');
  } catch (err) {
    toast.error(err.response?.data?.error || `Failed to delete scheduled post on ${platform}!`, {
      autoClose: false,
    });
  }
}

export default function SocialMediaComposer({ platform }) {
  const [postContent, setPostContent] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('composer');

  const tabOrder = [
    { id: 'composer', label: '📝 Make Post' },
    { id: 'scheduled', label: '⏰ Scheduled Post' },
    { id: 'history', label: '📜 Post History' },
    { id: 'details', label: '🧩 Details' },
  ];

  const tabStyle = tabId => {
    const isActive = activeSubTab === tabId;

    return {
      padding: '10px 16px',
      cursor: 'pointer',
      borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
      backgroundColor: isActive ? '#dbeeff' : '#dedede', // ACTIVE vs INACTIVE
      color: isActive ? '#007bff' : '#333',
      fontWeight: isActive ? 'bold' : 'normal',
      flex: 1,
      textAlign: 'center',
      transition: 'all 0.2s ease-in-out',
    };
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>{platform} </h3>
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
        {tabOrder.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveSubTab(id)}
            style={{
              ...tabStyle(id),
              border: 'none',
              outline: 'none',
              font: 'inherit',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeSubTab === 'composer' && (
        <div>
          <textarea
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
            placeholder={`Write your ${platform} post here...`}
            style={{
              width: '100%',
              height: '150px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginBottom: '1rem',
            }}
          />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
              }}
              onClick={() =>
                handleImmediatePost({
                  platform,
                  title: 'Sample Title',
                  description: postContent,
                  imageUrl: 'https://example.com/test.png',
                  imageFile: null,
                  imgType: 'URL',
                })
              }
            >
              Post to {platform}
            </button>

            <div style={{ position: 'relative' }}>
              <details style={{ position: 'relative' }}>
                <summary
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    listStyle: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Also post to ▾
                </summary>
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 100,
                  }}
                >
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    <input type="checkbox" /> Facebook
                  </label>
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    <input type="checkbox" /> LinkedIn
                  </label>
                  <label style={{ display: 'block', marginBottom: '4px' }}>
                    <input type="checkbox" /> Instagram
                  </label>
                  <label style={{ display: 'block' }}>
                    <input type="checkbox" /> Pinterest
                  </label>
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
      {activeSubTab === 'scheduled' && (
        <div>
          <p>
            <strong>Scheduled Posts for {platform}</strong>
          </p>
          <ul>
            <li> Aug 5 at 3:00 PM — “New product alert!”</li>
            <li> Aug 12 at 12:00 PM — “Weekly roundup”</li>
          </ul>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div>
          <p>
            <strong>Post History for {platform}</strong>
          </p>
          <ul>
            <li>July 20 — “Thanks for 10k followers!”</li>
            <li>July 15 — “Introducing our summer series…”</li>
          </ul>
        </div>
      )}

      {activeSubTab === 'details' && (
        <div>
          <p>
            <strong>{platform}-Specific Details</strong>
          </p>
          <ul>
            <li>Max characters: 280</li>
            <li>Supports hashtags: Yes</li>
            <li>Image support: Yes</li>
            <li>Recommended dimensions: 1200x675 px</li>
          </ul>
        </div>
      )}
    </div>
  );
}
