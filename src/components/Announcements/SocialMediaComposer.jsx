import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import { postFacebookContent, scheduleFacebookPost } from '~/actions/facebookActions';

export default function SocialMediaComposer({ platform }) {
  const [postContent, setPostContent] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('composer');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [scheduledContent, setScheduledContent] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth?.user);
  const frontPermissions = authUser?.permissions?.frontPermissions || [];

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
      borderTop: '1px solid transparent',
      borderLeft: '1px solid transparent',
      borderRight: '1px solid transparent',
      borderBottom: isActive ? '3px solid #007bff' : '3px solid transparent',
      backgroundColor: isActive ? '#dbeeff' : '#dedede', // ACTIVE vs INACTIVE
      color: isActive ? '#007bff' : '#333',
      fontSize: '14px',
      fontFamily: 'inherit',
      fontWeight: isActive ? 'bold' : 'normal',
      flex: 1,
      textAlign: 'center',
      transition: 'all 0.2s ease-in-out',
    };
  };

  const handlePost = async () => {
    if (platform !== 'facebook') {
      toast.info(`Posting for ${platform} is not wired yet.`);
      return;
    }

    if (!postContent.trim()) {
      toast.error('Please enter content for your post.');
      return;
    }

    if (!authUser?.userid) {
      toast.error('User information is missing; please re-login and try again.');
      return;
    }

    setIsPosting(true);
    try {
      await dispatch(
        postFacebookContent({
          message: postContent.trim(),
          link: link.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          requestor: {
            requestorId: authUser.userid,
            role: authUser.role,
            permissions: authUser.permissions,
          },
        }),
      );
      setPostContent('');
      setLink('');
      setImageUrl('');
    } catch (error) {
      // Toast already shown in action
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (platform !== 'facebook') {
      toast.info('Scheduling is only available for facebook right now.');
      return;
    }

    if (!scheduledContent.trim()) {
      toast.error('Please enter content for your scheduled post.');
      return;
    }

    if (!scheduledDateTime) {
      toast.error('Please pick a PST date and time for your scheduled post.');
      return;
    }

    const scheduledMoment = moment.tz(scheduledDateTime, 'YYYY-MM-DDTHH:mm', 'America/Los_Angeles');

    if (!scheduledMoment.isValid()) {
      toast.error('Please provide a valid date/time in PST.');
      return;
    }

    if (scheduledMoment.isBefore(moment.tz('America/Los_Angeles'))) {
      toast.error('Scheduled time must be in the future (PST).');
      return;
    }

    if (!authUser?.userid) {
      toast.error('User information is missing; please re-login and try again.');
      return;
    }

    setIsScheduling(true);
    try {
      await dispatch(
        scheduleFacebookPost({
          message: scheduledContent.trim(),
          scheduledFor: scheduledDateTime,
          timezone: 'America/Los_Angeles',
          requestor: {
            requestorId: authUser.userid,
            role: authUser.role,
            permissions: authUser.permissions,
          },
        }),
      );
      setScheduledContent('');
      setScheduledDateTime('');
    } catch (error) {
      // Toast already shown in action
    } finally {
      setIsScheduling(false);
    }
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
              outline: 'none',
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
          {platform === 'facebook' && (
            <div
              style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginTop: '1rem' }}
            >
              <input
                type="text"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="Optional link (will be attached to the post)"
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Optional image URL for a photo post"
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={handlePost}
              disabled={isPosting}
              style={{
                backgroundColor: isPosting ? '#6c757d' : '#007bff',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: isPosting ? 'not-allowed' : 'pointer',
              }}
            >
              {isPosting ? 'Posting...' : `Post to ${platform}`}
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
            <strong>Schedule a {platform} post (PST)</strong>
          </p>
          <textarea
            value={scheduledContent}
            onChange={e => setScheduledContent(e.target.value)}
            placeholder="Write the message to post later..."
            style={{
              width: '100%',
              height: '120px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginBottom: '1rem',
            }}
          />
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
              Date & time (PST)
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={e => setScheduledDateTime(e.target.value)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  minWidth: '240px',
                }}
              />
            </label>
            <button
              type="button"
              onClick={handleSchedule}
              disabled={isScheduling}
              style={{
                backgroundColor: isScheduling ? '#6c757d' : '#28a745',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: isScheduling ? 'not-allowed' : 'pointer',
                height: 'fit-content',
                marginTop: '1.6rem',
              }}
            >
              {isScheduling ? 'Scheduling...' : 'Schedule post'}
            </button>
          </div>
          <p style={{ marginTop: '0.5rem', color: '#555', fontSize: '14px' }}>
            Times are saved in Pacific Time. Scheduled posts will automatically publish at the
            chosen time.
          </p>
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
