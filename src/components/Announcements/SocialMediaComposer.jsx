import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import {
  postFacebookContent,
  scheduleFacebookPost,
  fetchScheduledPosts,
  fetchPostHistory,
  cancelScheduledPost,
  updateScheduledPost,
} from '~/actions/facebookActions';

const PST_TZ = 'America/Los_Angeles';

export default function SocialMediaComposer({ platform }) {
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth?.user);

  // Memoize requestor to prevent infinite loops in useCallback dependencies
  const requestor = useMemo(() => {
    if (!authUser?.userid) return null;
    return {
      requestorId: authUser.userid,
      role: authUser.role,
      permissions: authUser.permissions,
    };
  }, [authUser?.userid, authUser?.role, authUser?.permissions]);

  // Composer state
  const [postContent, setPostContent] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Scheduling state
  const [scheduledContent, setScheduledContent] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [scheduledLink, setScheduledLink] = useState('');
  const [scheduledImageUrl, setScheduledImageUrl] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Scheduled posts list state
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  // Post history state
  const [postHistory, setPostHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySource, setHistorySource] = useState('mongodb');
  const [historyStatus, setHistoryStatus] = useState('all');
  const [historyPostMethod, setHistoryPostMethod] = useState('all');
  const [facebookApiError, setFacebookApiError] = useState(null);

  // Edit modal state
  const [editingPost, setEditingPost] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [editDateTime, setEditDateTime] = useState('');

  const [activeSubTab, setActiveSubTab] = useState('composer');

  const tabOrder = [
    { id: 'composer', label: '📝 Make Post' },
    { id: 'scheduled', label: '⏰ Scheduled' },
    { id: 'history', label: '📜 History' },
    { id: 'details', label: '🧩 Details' },
  ];

  const tabStyle = tabId => ({
    padding: '10px 16px',
    cursor: 'pointer',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: activeSubTab === tabId ? '3px solid #007bff' : '3px solid transparent',
    backgroundColor: activeSubTab === tabId ? '#dbeeff' : '#dedede',
    color: activeSubTab === tabId ? '#007bff' : '#333',
    fontSize: '14px',
    fontWeight: activeSubTab === tabId ? 'bold' : 'normal',
    flex: 1,
    textAlign: 'center',
    outline: 'none',
  });

  // Fetch scheduled posts
  const loadScheduledPosts = useCallback(async () => {
    if (platform !== 'facebook' || !requestor) return;
    setLoadingScheduled(true);
    try {
      const result = await dispatch(fetchScheduledPosts({ requestor }));
      setScheduledPosts(result.scheduledPosts || []);
    } catch {
      setScheduledPosts([]);
    } finally {
      setLoadingScheduled(false);
    }
  }, [dispatch, platform, requestor]);

  // Fetch post history
  const loadPostHistory = useCallback(async () => {
    if (platform !== 'facebook' || !requestor) return;
    setLoadingHistory(true);
    setFacebookApiError(null);
    try {
      const result = await dispatch(
        fetchPostHistory({
          requestor,
          source: historySource,
          status: historyStatus !== 'all' ? historyStatus : undefined,
          postMethod: historyPostMethod !== 'all' ? historyPostMethod : undefined,
        }),
      );
      setPostHistory(result.posts || []);
      if (result.facebookApiError) {
        setFacebookApiError(result.facebookApiError);
      }
    } catch {
      setPostHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [dispatch, platform, requestor, historySource, historyStatus, historyPostMethod]);

  useEffect(() => {
    if (activeSubTab === 'scheduled') loadScheduledPosts();
    if (activeSubTab === 'history') loadPostHistory();
  }, [activeSubTab, loadScheduledPosts, loadPostHistory]);

  const handlePost = async () => {
    if (platform !== 'facebook') {
      toast.info(`Posting for ${platform} is not wired yet.`);
      return;
    }
    if (!postContent.trim()) {
      toast.error('Please enter content for your post.');
      return;
    }
    if (!requestor) {
      toast.error('User information is missing; please re-login.');
      return;
    }

    setIsPosting(true);
    try {
      await dispatch(
        postFacebookContent({
          message: postContent.trim(),
          link: link.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          requestor,
        }),
      );
      setPostContent('');
      setLink('');
      setImageUrl('');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (platform !== 'facebook') {
      toast.info('Scheduling is only available for Facebook right now.');
      return;
    }
    if (!scheduledContent.trim()) {
      toast.error('Please enter content for your scheduled post.');
      return;
    }
    if (!scheduledDateTime) {
      toast.error('Please pick a date and time.');
      return;
    }

    const m = moment.tz(scheduledDateTime, 'YYYY-MM-DDTHH:mm', PST_TZ);
    if (!m.isValid() || m.isBefore(moment.tz(PST_TZ))) {
      toast.error('Scheduled time must be a valid future date/time (PST).');
      return;
    }
    if (!requestor) {
      toast.error('User information is missing; please re-login.');
      return;
    }

    setIsScheduling(true);
    try {
      await dispatch(
        scheduleFacebookPost({
          message: scheduledContent.trim(),
          scheduledFor: scheduledDateTime,
          timezone: PST_TZ,
          link: scheduledLink.trim() || undefined,
          imageUrl: scheduledImageUrl.trim() || undefined,
          requestor,
        }),
      );
      setScheduledContent('');
      setScheduledDateTime('');
      setScheduledLink('');
      setScheduledImageUrl('');
      loadScheduledPosts();
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelPost = async postId => {
    if (!window.confirm('Are you sure you want to cancel this scheduled post?')) return;
    try {
      await dispatch(cancelScheduledPost({ postId, requestor }));
      loadScheduledPosts();
    } catch {
      /* toast shown in action */
    }
  };

  const openEditModal = post => {
    setEditingPost(post);
    setEditMessage(post.message);
    setEditDateTime(
      moment(post.scheduledFor)
        .tz(PST_TZ)
        .format('YYYY-MM-DDTHH:mm'),
    );
  };

  const handleSaveEdit = async () => {
    if (!editMessage.trim()) {
      toast.error('Message cannot be empty.');
      return;
    }
    const m = moment.tz(editDateTime, 'YYYY-MM-DDTHH:mm', PST_TZ);
    if (!m.isValid() || m.isBefore(moment.tz(PST_TZ))) {
      toast.error('Scheduled time must be in the future (PST).');
      return;
    }
    try {
      await dispatch(
        updateScheduledPost({
          postId: editingPost._id,
          message: editMessage.trim(),
          scheduledFor: editDateTime,
          timezone: PST_TZ,
          requestor,
        }),
      );
      setEditingPost(null);
      loadScheduledPosts();
    } catch {
      /* toast shown in action */
    }
  };

  const formatDate = dateStr =>
    moment(dateStr)
      .tz(PST_TZ)
      .format('MMM D, YYYY h:mm A');

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
    backgroundColor: '#fafafa',
  };

  const btnPrimary = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '8px 14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '8px',
  };

  const btnDanger = {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '8px 14px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  };

  const btnSuccess = {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>{platform}</h3>
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
        {tabOrder.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => setActiveSubTab(id)} style={tabStyle(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* COMPOSER TAB */}
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
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <input
                type="text"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="Optional link"
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Optional image URL"
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          )}
          <button
            type="button"
            onClick={handlePost}
            disabled={isPosting}
            style={{ ...btnPrimary, marginTop: '1rem', opacity: isPosting ? 0.6 : 1 }}
          >
            {isPosting ? 'Posting...' : `Post to ${platform}`}
          </button>
        </div>
      )}

      {/* SCHEDULED TAB */}
      {activeSubTab === 'scheduled' && (
        <div>
          <h4>Schedule a New Post</h4>
          <textarea
            value={scheduledContent}
            onChange={e => setScheduledContent(e.target.value)}
            placeholder="Write the message to post later..."
            style={{
              width: '100%',
              height: '100px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              marginBottom: '1rem',
            }}
          />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <input
              type="text"
              value={scheduledLink}
              onChange={e => setScheduledLink(e.target.value)}
              placeholder="Optional link"
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                flex: 1,
              }}
            />
            <input
              type="text"
              value={scheduledImageUrl}
              onChange={e => setScheduledImageUrl(e.target.value)}
              placeholder="Optional image URL"
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                flex: 1,
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-end',
              marginBottom: '1.5rem',
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
              Date & Time (PST)
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
              style={{ ...btnSuccess, opacity: isScheduling ? 0.6 : 1 }}
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Post'}
            </button>
          </div>

          <hr />
          <h4>Upcoming Scheduled Posts</h4>
          {loadingScheduled ? (
            <p>Loading...</p>
          ) : scheduledPosts.length === 0 ? (
            <p style={{ color: '#666' }}>No scheduled posts.</p>
          ) : (
            scheduledPosts.map(post => (
              <div key={post._id} style={cardStyle}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>
                  {formatDate(post.scheduledFor)} (PST)
                </p>
                <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{post.message}</p>
                {post.link && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>Link: {post.link}</p>
                )}
                {post.imageUrl && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                    Image: {post.imageUrl}
                  </p>
                )}
                <p
                  style={{
                    margin: '4px 0 8px',
                    fontSize: '12px',
                    color: post.status === 'pending' ? '#28a745' : '#ffc107',
                  }}
                >
                  Status: {post.status}
                </p>
                <button type="button" onClick={() => openEditModal(post)} style={btnPrimary}>
                  Edit
                </button>
                <button type="button" onClick={() => handleCancelPost(post._id)} style={btnDanger}>
                  Cancel
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeSubTab === 'history' && (
        <div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Status:
              <select
                value={historyStatus}
                onChange={e => setHistoryStatus(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px' }}
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Type:
              <select
                value={historyPostMethod}
                onChange={e => setHistoryPostMethod(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px' }}
              >
                <option value="all">All</option>
                <option value="direct">Direct Posts</option>
                <option value="scheduled">Scheduled Posts</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Source:
              <select
                value={historySource}
                onChange={e => setHistorySource(e.target.value)}
                style={{ padding: '6px', borderRadius: '4px' }}
              >
                <option value="mongodb">Database</option>
                <option value="all">Database + Facebook API</option>
                <option value="facebook">Facebook API only</option>
              </select>
            </label>
            <button type="button" onClick={loadPostHistory} style={btnPrimary}>
              Refresh
            </button>
          </div>

          {facebookApiError && (
            <div
              style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '1rem',
                color: '#856404',
              }}
            >
              <strong>Note:</strong> {facebookApiError}
            </div>
          )}

          {loadingHistory ? (
            <p>Loading...</p>
          ) : postHistory.length === 0 ? (
            <p style={{ color: '#666' }}>No post history found.</p>
          ) : (
            postHistory.map((post, idx) => (
              <div key={post.postId || post._id || idx} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{formatDate(post.createdTime)}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {post.postMethod && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: post.postMethod === 'direct' ? '#e3f2fd' : '#f3e5f5',
                          color: post.postMethod === 'direct' ? '#1565c0' : '#7b1fa2',
                        }}
                      >
                        {post.postMethod === 'direct' ? '⚡ Direct' : '📅 Scheduled'}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: post.status === 'sent' ? '#e8f5e9' : '#ffebee',
                        color: post.status === 'sent' ? '#2e7d32' : '#c62828',
                      }}
                    >
                      {post.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                    </span>
                  </div>
                </div>
                <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{post.message}</p>
                {post.lastError && (
                  <p
                    style={{
                      margin: '4px 0',
                      fontSize: '13px',
                      color: '#c62828',
                      backgroundColor: '#ffebee',
                      padding: '8px',
                      borderRadius: '4px',
                    }}
                  >
                    Error: {post.lastError}
                  </p>
                )}
                {post.permalinkUrl && (
                  <a
                    href={post.permalinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '13px' }}
                  >
                    View on Facebook ↗
                  </a>
                )}
                {post.fullPicture && (
                  <img
                    src={post.fullPicture}
                    alt=""
                    style={{ maxWidth: '200px', marginTop: '8px', borderRadius: '4px' }}
                  />
                )}
                {post.source === 'facebook' && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>
                    {post.reactions !== undefined && `👍 ${post.reactions} `}
                    {post.comments !== undefined && `💬 ${post.comments}`}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* DETAILS TAB */}
      {activeSubTab === 'details' && (
        <div>
          <h4>{platform} Details</h4>
          <p>
            <strong>Max characters:</strong> No hard limit (Facebook recommends &lt;500 for
            engagement)
          </p>
          <p>
            <strong>Supports hashtags:</strong> Yes
          </p>
          <p>
            <strong>Image support:</strong> Yes (via URL)
          </p>
          <p>
            <strong>Recommended image dimensions:</strong> 1200×630 px
          </p>
          <p>
            <strong>Scheduling timezone:</strong> Pacific Time (PST/PDT)
          </p>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingPost && (
        <div
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
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
            }}
          >
            <h4>Edit Scheduled Post</h4>
            <textarea
              value={editMessage}
              onChange={e => setEditMessage(e.target.value)}
              style={{
                width: '100%',
                height: '100px',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                marginBottom: '1rem',
              }}
            />
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Scheduled Time (PST)
              <input
                type="datetime-local"
                value={editDateTime}
                onChange={e => setEditDateTime(e.target.value)}
                style={{
                  display: 'block',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  width: '100%',
                  marginTop: '4px',
                }}
              />
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleSaveEdit} style={btnSuccess}>
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                style={{ ...btnDanger, backgroundColor: '#6c757d' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
