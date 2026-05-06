import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import CharacterCounter from './CharacterCounter';
import ConfirmationModal from './ConfirmationModal';
import './SocialMediaComposer.module.css';

const PREFS_KEY = 'mastodon_composer_prefs';

export default function SocialMediaComposer({ platform }) {
  const PLATFORM_CHAR_LIMITS = {
    mastodon: 500,
    x: 280,
    facebook: 63206,
    linkedin: 3000,
    instagram: 2200,
    threads: 500,
  };

  const charLimit = PLATFORM_CHAR_LIMITS[platform] || 500;

  const [postContent, setPostContent] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('composer');
  const [isPosting, setIsPosting] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageAltText, setImageAltText] = useState('');
  const [postHistory, setPostHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [crossPostPlatforms, setCrossPostPlatforms] = useState({
    facebook: false,
    linkedin: false,
    instagram: false,
    x: false,
  });
  const [showCrossPost, setShowCrossPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    confirmColor: 'primary',
    showDontShowAgain: false,
    preferenceKey: null,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem(PREFS_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          confirmDeleteScheduled: true,
          confirmPostNow: true,
        };
  });

  const tabOrder = [
    { id: 'composer', label: '📝 Make Post' },
    { id: 'scheduled', label: '⏰ Scheduled Post' },
    { id: 'history', label: '📜 Post History' },
    { id: 'details', label: '🧩 Details' },
  ];

  useEffect(() => {
    if (activeSubTab === 'scheduled' && platform === 'mastodon') {
      loadScheduledPosts();
    } else if (activeSubTab === 'history' && platform === 'mastodon') {
      loadPostHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, platform]);

  const updatePreference = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
  };

  const loadScheduledPosts = async () => {
    setIsLoadingScheduled(true);
    try {
      const response = await fetch('/api/mastodon/schedule');
      if (response.ok) {
        const data = await response.json();
        setScheduledPosts(data || []);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading scheduled posts:', err);
      }
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  const loadPostHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/mastodon/history?limit=20');
      if (response.ok) {
        const data = await response.json();
        setPostHistory(data || []);
      } else {
        toast.error('Failed to load post history');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading post history:', err);
      }
      toast.error('Error loading post history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const showModal = config => {
    setModalConfig(config);
    setModalOpen(true);
  };

  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setUploadedImage({
        base64: base64String,
        preview: reader.result,
        name: file.name,
      });
      toast.success('Image uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageAltText('');
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleCrossPostToggle = platformName => {
    setCrossPostPlatforms(prev => ({
      ...prev,
      [platformName]: !prev[platformName],
    }));
  };

  const handleShowPreview = () => {
    if (!postContent.trim()) {
      toast.error('Post cannot be empty!');
      return;
    }

    const selectedPlatforms = Object.keys(crossPostPlatforms).filter(p => crossPostPlatforms[p]);

    setPreviewData({
      content: postContent,
      image: uploadedImage,
      altText: imageAltText,
      scheduledTime: scheduleDate && scheduleTime ? `${scheduleDate}T${scheduleTime}` : null,
      crossPostTo: selectedPlatforms,
    });
    setPreviewOpen(true);
  };

  const clearComposer = () => {
    setPostContent('');
    setScheduleDate('');
    setScheduleTime('');
    setUploadedImage(null);
    setImageAltText('');
    setCrossPostPlatforms({ facebook: false, linkedin: false, instagram: false, x: false });
    setEditingPostId(null);
    setPreviewOpen(false);
  };

  const handlePostNow = async () => {
    if (!postContent.trim()) {
      toast.error('Post cannot be empty!');
      return;
    }
    if (postContent.length > charLimit) {
      toast.error(`Post exceeds ${charLimit} character limit.`);
      return;
    }

    const selectedPlatforms = Object.keys(crossPostPlatforms).filter(p => crossPostPlatforms[p]);

    setIsPosting(true);
    try {
      const response = await fetch('/api/mastodon/createPin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Mastodon Post',
          description: postContent.trim(),
          imgType: uploadedImage ? 'FILE' : 'URL',
          mediaItems: uploadedImage ? `data:image/png;base64,${uploadedImage.base64}` : '',
          mediaAltText: imageAltText || null,
          crossPostTo: selectedPlatforms,
        }),
      });

      if (response.ok) {
        let message = `Successfully posted to ${platform}!`;
        if (selectedPlatforms.length > 0) {
          message += ` (Selected for: ${selectedPlatforms.join(', ')})`;
        }
        toast.success(message, { autoClose: 5000 });
        clearComposer();
        if (activeSubTab === 'history') {
          loadPostHistory();
        }
      } else {
        toast.error(`Failed to post to ${platform}.`);
      }
    } catch (err) {
      toast.error(`Error while posting to ${platform}.`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!postContent.trim()) {
      toast.error('Post cannot be empty!');
      return;
    }
    if (postContent.length > charLimit) {
      toast.error(`Post exceeds ${charLimit} character limit.`);
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select both date and time.');
      return;
    }

    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error('Scheduled time must be in the future.');
      return;
    }

    const selectedPlatforms = Object.keys(crossPostPlatforms).filter(p => crossPostPlatforms[p]);

    setIsPosting(true);
    try {
      // If editing, delete the old version first
      if (editingPostId) {
        await fetch(`/api/mastodon/schedule/${editingPostId}`, { method: 'DELETE' });
      }

      const response = await fetch('/api/mastodon/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Mastodon Scheduled Post',
          description: postContent.trim(),
          imgType: uploadedImage ? 'FILE' : 'URL',
          mediaItems: uploadedImage ? `data:image/png;base64,${uploadedImage.base64}` : '',
          mediaAltText: imageAltText || null,
          scheduledTime: scheduledDateTime.toISOString(),
          crossPostTo: selectedPlatforms,
        }),
      });

      if (response.ok) {
        toast.success(
          editingPostId ? 'Post updated successfully!' : 'Post scheduled successfully!',
        );
        clearComposer();
        if (activeSubTab === 'scheduled') {
          loadScheduledPosts();
        }
      } else {
        toast.error('Failed to schedule post.');
      }
    } catch (err) {
      toast.error('Error while scheduling post.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleEditScheduled = post => {
    try {
      const postData = JSON.parse(post.postData);

      // Load post content
      setPostContent(postData.status || '');

      // Load image if exists
      if (postData.local_media_base64) {
        setUploadedImage({
          base64: postData.local_media_base64.replace(/^data:image\/\w+;base64,/, ''),
          preview: postData.local_media_base64,
          name: 'scheduled-image.png',
        });
      }

      // Load alt text if exists
      setImageAltText(postData.mediaAltText || '');

      // Load scheduled time
      const scheduledTime = new Date(post.scheduledTime);
      const dateStr = scheduledTime.toISOString().split('T')[0];
      const timeStr = scheduledTime.toTimeString().slice(0, 5);
      setScheduleDate(dateStr);
      setScheduleTime(timeStr);

      // Set editing mode
      setEditingPostId(post._id);

      // Switch to composer tab
      setActiveSubTab('composer');

      toast.info('Editing scheduled post. Modify and click "Schedule Post" to update.');
    } catch (err) {
      toast.error('Failed to load post for editing');
      console.error('Edit error:', err);
    }
  };

  const handleCancelEdit = () => {
    clearComposer();
    toast.info('Edit cancelled');
  };

  const handleDeleteScheduled = async (postId, skipConfirmation = false) => {
    const performDelete = async () => {
      try {
        const response = await fetch(`/api/mastodon/schedule/${postId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast.success('Scheduled post deleted!');
          loadScheduledPosts();
        } else {
          toast.error('Failed to delete post.');
        }
      } catch (err) {
        toast.error('Error deleting post.');
      }
    };

    if (skipConfirmation || !preferences.confirmDeleteScheduled) {
      await performDelete();
    } else {
      showModal({
        title: 'Delete Scheduled Post',
        message: 'Are you sure you want to delete this scheduled post?',
        onConfirm: performDelete,
        confirmText: 'Delete',
        confirmColor: 'danger',
        showDontShowAgain: true,
        preferenceKey: 'confirmDeleteScheduled',
      });
    }
  };

  const handlePostScheduledNow = async post => {
    const performPost = async () => {
      try {
        const postData = JSON.parse(post.postData);
        const response = await fetch('/api/mastodon/createPin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Mastodon Post',
            description: postData.status,
            imgType: postData.local_media_base64 ? 'FILE' : 'URL',
            mediaItems: postData.local_media_base64 || '',
            mediaAltText: postData.mediaAltText || null,
          }),
        });

        if (response.ok) {
          toast.success('Posted successfully!');
          await handleDeleteScheduled(post._id, true);
        } else {
          toast.error('Failed to post.');
        }
      } catch (err) {
        toast.error('Error posting.');
      }
    };

    if (!preferences.confirmPostNow) {
      await performPost();
    } else {
      showModal({
        title: 'Post Immediately',
        message:
          'This will post immediately to Mastodon and remove it from your scheduled posts. Continue?',
        onConfirm: performPost,
        confirmText: 'Post Now',
        confirmColor: 'success',
        showDontShowAgain: true,
        preferenceKey: 'confirmPostNow',
      });
    }
  };

  const handleDontShowAgainChange = preferenceKey => {
    updatePreference(preferenceKey, false);
    toast.info('Preference saved! This confirmation will not show again.', { autoClose: 3000 });
  };

  const formatScheduledTime = isoString => {
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const getScheduledPostImage = post => {
    try {
      const postData = JSON.parse(post.postData);
      return postData.local_media_base64 || null;
    } catch {
      return null;
    }
  };

  const stripHtml = html => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="social-media-composer">
      <h3 className="platform-title">{platform}</h3>

      <div className="tabs-container">
        {tabOrder.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`tab-button ${activeSubTab === id ? 'active' : ''}`}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      {activeSubTab === 'composer' && (
        <div className="composer-content">
          {editingPostId && (
            <div className="edit-banner">
              <span>✏️ Editing scheduled post</span>
              <button type="button" onClick={handleCancelEdit} className="btn-cancel-edit">
                Cancel Edit
              </button>
            </div>
          )}

          <textarea
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
            placeholder={`Write your ${platform} post here...`}
            className="post-textarea"
          />
          <CharacterCounter currentLength={postContent.length} maxLength={charLimit} />

          <div className="upload-section">
            <label htmlFor="image-upload" className="section-label">
              Add Image (optional):
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
            {uploadedImage && (
              <div>
                <div className="image-preview-container">
                  <img src={uploadedImage.preview} alt="Upload preview" className="image-preview" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="remove-image-btn"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
                <div className="alt-text-section">
                  <label htmlFor="alt-text" className="section-label">
                    Alt Text (for accessibility):
                  </label>
                  <input
                    id="alt-text"
                    type="text"
                    value={imageAltText}
                    onChange={e => setImageAltText(e.target.value)}
                    placeholder="Describe the image for screen readers..."
                    className="alt-text-input"
                    maxLength={1500}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                    {imageAltText.length} / 1500 characters
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="schedule-section">
            <label htmlFor="schedule-date" className="section-label">
              Schedule for later (optional):
            </label>
            <div className="datetime-inputs">
              <input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="datetime-input"
              />
              <input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                className="datetime-input"
              />
            </div>
          </div>

          <div className="action-buttons">
            <button
              type="button"
              onClick={handleShowPreview}
              disabled={!postContent.trim()}
              className="btn btn-info"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={handlePostNow}
              disabled={isPosting}
              className="btn btn-primary"
            >
              {isPosting ? 'Posting…' : 'Post Now'}
            </button>
            <button
              type="button"
              onClick={handleSchedulePost}
              disabled={isPosting}
              className="btn btn-success"
            >
              {isPosting
                ? editingPostId
                  ? 'Updating…'
                  : 'Scheduling…'
                : editingPostId
                ? 'Update Post'
                : 'Schedule Post'}
            </button>

            <div className="crosspost-container">
              <button
                type="button"
                onClick={() => setShowCrossPost(!showCrossPost)}
                className="btn btn-secondary"
              >
                Also post to {showCrossPost ? '▴' : '▾'}
              </button>
              {showCrossPost && (
                <div className="crosspost-dropdown">
                  <label className="crosspost-option">
                    <input
                      type="checkbox"
                      checked={crossPostPlatforms.facebook}
                      onChange={() => handleCrossPostToggle('facebook')}
                    />
                    <span>Facebook</span>
                  </label>
                  <label className="crosspost-option">
                    <input
                      type="checkbox"
                      checked={crossPostPlatforms.linkedin}
                      onChange={() => handleCrossPostToggle('linkedin')}
                    />
                    <span>LinkedIn</span>
                  </label>
                  <label className="crosspost-option">
                    <input
                      type="checkbox"
                      checked={crossPostPlatforms.instagram}
                      onChange={() => handleCrossPostToggle('instagram')}
                    />
                    <span>Instagram</span>
                  </label>
                  <label className="crosspost-option">
                    <input
                      type="checkbox"
                      checked={crossPostPlatforms.x}
                      onChange={() => handleCrossPostToggle('x')}
                    />
                    <span>X (Twitter)</span>
                  </label>
                  <p className="crosspost-note">
                    Note: Cross-posting functionality coming soon. Currently shows selection only.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'scheduled' && (
        <div className="scheduled-content">
          <h4>Scheduled Posts for {platform}</h4>
          {isLoadingScheduled && <p>Loading...</p>}
          {!isLoadingScheduled && scheduledPosts.length === 0 && <p>No scheduled posts yet.</p>}
          {!isLoadingScheduled && scheduledPosts.length > 0 && (
            <div className="posts-list">
              {scheduledPosts.map(post => {
                let postText = '';
                try {
                  const postData = JSON.parse(post.postData);
                  postText = postData.status || 'No content';
                } catch {
                  postText = 'Invalid post data';
                }
                const imageBase64 = getScheduledPostImage(post);

                return (
                  <div key={post._id} className="post-card">
                    <div className="post-card-content">
                      <p className="post-text">{postText}</p>
                      <p className="post-meta">📅 {formatScheduledTime(post.scheduledTime)}</p>
                      {imageBase64 && (
                        <img src={imageBase64} alt="Post thumbnail" className="post-thumbnail" />
                      )}
                    </div>
                    <div className="post-card-actions">
                      <button
                        type="button"
                        onClick={() => handleEditScheduled(post)}
                        className="action-btn edit"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePostScheduledNow(post)}
                        className="action-btn success"
                        title="Post now"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduled(post._id)}
                        className="action-btn danger"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="history-content">
          <h4>Post History for {platform}</h4>
          {isLoadingHistory && <p>Loading...</p>}
          {!isLoadingHistory && postHistory.length === 0 && <p>No posts found in history.</p>}
          {!isLoadingHistory && postHistory.length > 0 && (
            <div className="posts-list">
              {postHistory.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-card-full">
                    <p className="post-text">{stripHtml(post.content)}</p>
                    <p className="post-meta">📅 {formatScheduledTime(post.created_at)}</p>
                    <div className="post-stats">
                      <span>❤️ {post.favourites_count}</span>
                      <span>🔄 {post.reblogs_count}</span>
                    </div>
                    {post.media_attachments?.length > 0 && (
                      <div className="post-media">
                        {post.media_attachments.map((media, idx) => (
                          <img
                            key={idx}
                            src={media.preview_url || media.url}
                            alt="Post media"
                            className="post-thumbnail"
                          />
                        ))}
                      </div>
                    )}
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="post-link"
                    >
                      View on Mastodon →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'details' && (
        <div className="details-content">
          <p>
            <strong>{platform}-Specific Details</strong>
          </p>
          <ul>
            <li>Max characters: {charLimit}</li>
            <li>Supports hashtags: Yes</li>
            <li>Image support: Yes</li>
            <li>Alt text support: Yes (up to 1500 characters)</li>
            <li>Recommended dimensions: 1200x675 px</li>
            <li>Max image size: 5MB</li>
          </ul>
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--card-bg, #f8f9fa)',
              borderRadius: '6px',
            }}
          >
            <h5>Confirmation Preferences</h5>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={preferences.confirmDeleteScheduled}
                onChange={e => updatePreference('confirmDeleteScheduled', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Show confirmation when deleting scheduled posts
            </label>
            <label style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={preferences.confirmPostNow}
                onChange={e => updatePreference('confirmPostNow', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Show confirmation when posting scheduled posts immediately
            </label>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={modalOpen}
        toggle={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
        confirmColor={modalConfig.confirmColor}
        showDontShowAgain={modalConfig.showDontShowAgain}
        onDontShowAgainChange={() => handleDontShowAgainChange(modalConfig.preferenceKey)}
      />

      <Modal isOpen={previewOpen} toggle={() => setPreviewOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setPreviewOpen(false)}>Post Preview</ModalHeader>
        <ModalBody>
          {previewData && (
            <div className="preview-container">
              <div className="preview-header">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/6295/6295417.png"
                  alt="Mastodon"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '12px',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Your Account</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {previewData.scheduledTime
                      ? `Scheduled for ${formatScheduledTime(previewData.scheduledTime)}`
                      : 'Posting now'}
                  </div>
                </div>
              </div>
              <div
                className="preview-content"
                style={{
                  marginTop: '1rem',
                  whiteSpace: 'pre-wrap',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                }}
              >
                {previewData.content}
              </div>
              {previewData.image && (
                <div style={{ marginTop: '1rem' }}>
                  <img
                    src={previewData.image.preview}
                    alt={previewData.altText || 'Post preview'}
                    style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #ddd' }}
                  />
                  {previewData.altText && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <strong>Alt text:</strong> {previewData.altText}
                    </div>
                  )}
                </div>
              )}
              {previewData.crossPostTo.length > 0 && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#e7f3ff',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <strong>📤 Will also be selected for:</strong>{' '}
                  {previewData.crossPostTo.join(', ')}
                </div>
              )}
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
                <strong>Character count:</strong> {previewData.content.length} / {charLimit}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
          {previewData?.scheduledTime ? (
            <Button color="success" onClick={handleSchedulePost} disabled={isPosting}>
              {isPosting ? 'Scheduling...' : 'Schedule Post'}
            </Button>
          ) : (
            <Button color="primary" onClick={handlePostNow} disabled={isPosting}>
              {isPosting ? 'Posting...' : 'Post Now'}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
