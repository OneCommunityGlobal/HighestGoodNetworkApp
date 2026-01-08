import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import {
  postFacebookContent,
  postFacebookContentWithImage,
  scheduleFacebookPost,
  scheduleFacebookPostWithImage,
  fetchScheduledPosts,
  fetchPostHistory,
  cancelScheduledPost,
  updateScheduledPost,
} from '~/actions/facebookActions';
import { getFacebookConnectionStatus } from '~/actions/facebookAuthActions';
import FacebookConnection from './FacebookConnection';

const PST_TZ = 'America/Los_Angeles';

export default function SocialMediaComposer({ platform }) {
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth?.user);

  const requestor = useMemo(() => {
    if (!authUser?.userid) return null;
    return {
      requestorId: authUser.userid,
      name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
      role: authUser.role,
      permissions: authUser.permissions,
    };
  }, [
    authUser?.userid,
    authUser?.firstName,
    authUser?.lastName,
    authUser?.role,
    authUser?.permissions,
  ]);

  // Connection status for showing warnings
  const [isConnected, setIsConnected] = useState(null);

  // Composer state
  const [postContent, setPostContent] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  // Scheduling state
  const [scheduledContent, setScheduledContent] = useState('');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [scheduledLink, setScheduledLink] = useState('');
  const [scheduledImageUrl, setScheduledImageUrl] = useState('');
  // Scheduled image state
  const [scheduledImageFile, setScheduledImageFile] = useState(null);
  const [scheduledImagePreview, setScheduledImagePreview] = useState(null);
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
    { id: 'settings', label: '⚙️ Settings' },
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

  // Check connection status on mount
  useEffect(() => {
    if (platform === 'facebook') {
      dispatch(getFacebookConnectionStatus()).then(status => {
        setIsConnected(status?.connected || false);
      });
    }
  }, [dispatch, platform]);

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

  const handleImageFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a JPEG, PNG, GIF, or WebP image');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be under 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl('');
    }
  };

  const clearImageFile = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  // Handle scheduled image file selection
  const handleScheduledImageFileChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a JPEG, PNG, GIF, or WebP image');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be under 10MB');
        return;
      }
      setScheduledImageFile(file);
      setScheduledImagePreview(URL.createObjectURL(file));
      setScheduledImageUrl('');
    }
  };

  const clearScheduledImageFile = () => {
    setScheduledImageFile(null);
    if (scheduledImagePreview) {
      URL.revokeObjectURL(scheduledImagePreview);
    }
    setScheduledImagePreview(null);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      if (scheduledImagePreview) {
        URL.revokeObjectURL(scheduledImagePreview);
      }
    };
  }, [imagePreview, scheduledImagePreview]);

  const handlePost = async () => {
    if (platform !== 'facebook') {
      toast.info(`Posting for ${platform} is not wired yet.`);
      return;
    }
    if (!postContent.trim() && !imageFile && !imageUrl.trim()) {
      toast.error('Please enter content or add an image for your post.');
      return;
    }
    if (!requestor) {
      toast.error('User information is missing; please re-login.');
      return;
    }

    setIsPosting(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        if (postContent.trim()) formData.append('message', postContent.trim());
        if (link.trim()) formData.append('link', link.trim());
        formData.append('image', imageFile);
        formData.append('requestor', JSON.stringify(requestor));

        await dispatch(postFacebookContentWithImage(formData));
      } else {
        await dispatch(
          postFacebookContent({
            message: postContent.trim() || undefined,
            link: link.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
            requestor,
          }),
        );
      }
      setPostContent('');
      setLink('');
      setImageUrl('');
      clearImageFile();
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (platform !== 'facebook') {
      toast.info('Scheduling is only available for Facebook right now.');
      return;
    }
    // Updated validation: require either content or image
    if (!scheduledContent.trim() && !scheduledImageFile && !scheduledImageUrl.trim()) {
      toast.error('Please enter content or add an image for your scheduled post.');
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
      if (scheduledImageFile) {
        // Use FormData for direct file upload
        const formData = new FormData();
        if (scheduledContent.trim()) formData.append('message', scheduledContent.trim());
        formData.append('scheduledFor', scheduledDateTime);
        formData.append('timezone', PST_TZ);
        if (scheduledLink.trim()) formData.append('link', scheduledLink.trim());
        formData.append('image', scheduledImageFile);
        formData.append('requestor', JSON.stringify(requestor));

        await dispatch(scheduleFacebookPostWithImage(formData));
      } else {
        // Use regular JSON post
        await dispatch(
          scheduleFacebookPost({
            message: scheduledContent.trim() || undefined,
            scheduledFor: scheduledDateTime,
            timezone: PST_TZ,
            link: scheduledLink.trim() || undefined,
            imageUrl: scheduledImageUrl.trim() || undefined,
            requestor,
          }),
        );
      }

      setScheduledContent('');
      setScheduledDateTime('');
      setScheduledLink('');
      setScheduledImageUrl('');
      clearScheduledImageFile();
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

  // Shared styles
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

  const warningBanner = {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
    color: '#856404',
  };

  // Connection warning for non-connected state
  const ConnectionWarning = () => {
    if (platform !== 'facebook' || isConnected === null || isConnected) return null;
    return (
      <div style={warningBanner}>
        <strong>⚠️ Facebook Not Connected</strong>
        <p style={{ margin: '8px 0 0' }}>
          Posts and scheduled posts will fail until a Facebook Page is connected. Go to the{' '}
          <button
            type="button"
            onClick={() => setActiveSubTab('settings')}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Settings tab
          </button>{' '}
          to connect.
        </p>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ textTransform: 'capitalize' }}>{platform}</h3>

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
          <ConnectionWarning />
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
            <>
              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <input
                  type="text"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  placeholder="Optional link"
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />

                {/* Image Upload Section */}
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#fafafa',
                  }}
                >
                  <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px' }}>
                    📷 Add Image (optional)
                  </p>

                  {/* File Upload Option */}
                  <div style={{ marginBottom: '12px' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        backgroundColor: imageFile ? '#e8f5e9' : '#f0f0f0',
                        borderRadius: '6px',
                        cursor: imageUrl ? 'not-allowed' : 'pointer',
                        border: imageFile ? '2px solid #4caf50' : '1px solid #ccc',
                        opacity: imageUrl ? 0.6 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      📁 Upload from Device
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageFileChange}
                        style={{ display: 'none' }}
                        disabled={!!imageUrl}
                      />
                    </label>

                    {imageFile && (
                      <span style={{ marginLeft: '12px', fontSize: '14px', color: '#333' }}>
                        ✓ {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                        <button
                          type="button"
                          onClick={clearImageFile}
                          style={{
                            marginLeft: '8px',
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                          }}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div style={{ marginBottom: '12px' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '300px',
                          maxHeight: '200px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  )}

                  {/* Divider */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      margin: '16px 0',
                      opacity: imageFile ? 0.4 : 1,
                    }}
                  >
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ddd' }} />
                    <span
                      style={{
                        padding: '0 16px',
                        color: '#888',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      OR
                    </span>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ddd' }} />
                  </div>

                  {/* URL Input Option */}
                  <div>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={e => {
                        setImageUrl(e.target.value);
                        if (e.target.value) clearImageFile(); // Clear file when URL is entered
                      }}
                      placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
                      disabled={!!imageFile}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        opacity: imageFile ? 0.5 : 1,
                        backgroundColor: imageFile ? '#f5f5f5' : 'white',
                      }}
                    />
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
                {postContent.length} characters (recommended: &lt;500 for best engagement)
              </p>
            </>
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
          <ConnectionWarning />
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

          {/* Link input */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={scheduledLink}
              onChange={e => setScheduledLink(e.target.value)}
              placeholder="Optional link"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          {/* Image Upload Section */}
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '1rem',
              backgroundColor: '#fafafa',
            }}
          >
            <p style={{ margin: '0 0 12px', fontWeight: 'bold', fontSize: '14px' }}>
              📷 Add Image (optional)
            </p>

            {/* File Upload */}
            <div style={{ marginBottom: '12px' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: scheduledImageFile ? '#e8f5e9' : '#f0f0f0',
                  borderRadius: '6px',
                  cursor: scheduledImageUrl ? 'not-allowed' : 'pointer',
                  border: scheduledImageFile ? '2px solid #4caf50' : '1px solid #ccc',
                  opacity: scheduledImageUrl ? 0.6 : 1,
                }}
              >
                📁 Upload from Device
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleScheduledImageFileChange}
                  style={{ display: 'none' }}
                  disabled={!!scheduledImageUrl}
                />
              </label>
              {scheduledImageFile && (
                <span style={{ marginLeft: '12px', fontSize: '14px' }}>
                  ✓ {scheduledImageFile.name} ({(scheduledImageFile.size / 1024 / 1024).toFixed(2)}{' '}
                  MB)
                  <button
                    type="button"
                    onClick={clearScheduledImageFile}
                    style={{
                      marginLeft: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            {/* Preview */}
            {scheduledImagePreview && (
              <div style={{ marginBottom: '12px' }}>
                <img
                  src={scheduledImagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '12px 0',
                opacity: scheduledImageFile ? 0.4 : 1,
              }}
            >
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ddd' }} />
              <span style={{ padding: '0 12px', color: '#888', fontSize: '12px' }}>OR</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ddd' }} />
            </div>

            {/* URL Input */}
            <input
              type="text"
              value={scheduledImageUrl}
              onChange={e => {
                setScheduledImageUrl(e.target.value);
                if (e.target.value) clearScheduledImageFile();
              }}
              placeholder="Paste image URL"
              disabled={!!scheduledImageFile}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                opacity: scheduledImageFile ? 0.5 : 1,
              }}
            />
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#666' }}>
              Supported: JPEG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>

          {/* Date/Time and Schedule Button */}
          <div
            style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}
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
                <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>
                  {post.message || '(Image only)'}
                </p>
                {post.link && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>Link: {post.link}</p>
                )}
                {post.imageUrl && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                    Image: {post.imageUrl}
                  </p>
                )}
                {(post.hasImage || post.imageOriginalName) && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#4caf50' }}>
                    📷 Image attached: {post.imageOriginalName || 'uploaded file'}
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
            <div style={warningBanner}>
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
                      {post.status === 'sent' ? '✔ Sent' : '✗ Failed'}
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
              </div>
            ))
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeSubTab === 'settings' && (
        <div>
          <h4>Facebook Settings</h4>
          <FacebookConnection />

          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
            }}
          >
            <h5 style={{ marginTop: 0 }}>Platform Details</h5>
            <p>
              <strong>Max characters:</strong> No hard limit (recommended &lt;500 for engagement)
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
            <p style={{ marginBottom: 0 }}>
              <strong>Scheduling timezone:</strong> Pacific Time (PST/PDT)
            </p>
          </div>
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
