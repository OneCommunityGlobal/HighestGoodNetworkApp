import React, { useState } from 'react';

export default function SocialMediaComposer({ platform }) {
  const [postContent, setPostContent] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('composer');
  const [isPostingPlurk, setIsPostingPlurk] = useState(false); // NEW

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
      backgroundColor: isActive ? '#dbeeff' : '#dedede',
      color: isActive ? '#007bff' : '#333',
      fontWeight: isActive ? 'bold' : 'normal',
      flex: 1,
      textAlign: 'center',
      transition: 'all 0.2s ease-in-out',
    };
  };

  // 🔁 NEW: Handler for Plurk posting
  const handlePlurkPost = async () => {
    if (!postContent.trim()) {
      alert('Plurk content cannot be empty.');
      return;
    }
    if (postContent.length > 360) {
      alert('Plurk content must be 360 characters or less.');
      return;
    }

    setIsPostingPlurk(true);
    try {
      const res = await fetch('/api/postToPlurk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: postContent.trim() }),
      });

      // Log the response details for debugging
      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      // Only try to parse JSON if the response is ok
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!data || typeof data.plurk_id === 'undefined') {
        alert('Invalid response from Plurk API.');
      } else {
        alert(`Plurk posted successfully! ID: ${data.plurk_id}`);
        setPostContent('');
      }
    } catch (err) {
      console.error('Plurk post failed:', err);
      // Show the actual error message from the server if available
      const errorMessage =
        err.message === 'HTTP error! status: 401'
          ? 'Authentication failed.'
          : 'Failed to post to Plurk.';
      alert(errorMessage);
    } finally {
      setIsPostingPlurk(false);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>{platform}</h3>
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
            maxLength={platform === 'plurk' ? 360 : undefined}
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
            {platform === 'plurk' ? (
              <button
                onClick={handlePlurkPost}
                disabled={isPostingPlurk}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                }}
              >
                {isPostingPlurk ? 'Posting…' : 'Post to Plurk'}
              </button>
            ) : (
              <button
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                }}
              >
                Post to {platform}
              </button>
            )}

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
            <li>Aug 5 at 3:00 PM — “New product alert!”</li>
            <li>Aug 12 at 12:00 PM — “Weekly roundup”</li>
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
            <li>Max characters: {platform === 'plurk' ? '360' : '280'}</li>
            <li>Supports hashtags: Yes</li>
            <li>Image support: Yes</li>
            <li>Recommended dimensions: 1200x675 px</li>
          </ul>
        </div>
      )}
    </div>
  );
}
