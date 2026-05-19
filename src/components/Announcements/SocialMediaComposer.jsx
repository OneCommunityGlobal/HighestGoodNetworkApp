import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import CharacterCounter from './CharacterCounter';
import ConfirmationModal from './ConfirmationModal';
import styles from './SocialMediaComposer.module.css';

const PREFS_KEY = 'mastodon_composer_prefs';

// Platform API abstraction
// Keeps every handler free of platform conditionals.
// Add new platforms here; the rest of the component stays unchanged.
const platformAPI = {
  mastodon: {
    postNow: (content, image, altText, crossPostTo) => ({
      url: '/api/mastodon/createPin',
      body: {
        title: 'Mastodon Post',
        description: content,
        imgType: image ? 'FILE' : 'URL',
        mediaItems: image ? `data:image/png;base64,${image.base64}` : '',
        mediaAltText: altText || null,
        crossPostTo,
      },
    }),
    schedule: (content, image, altText, scheduledTime, crossPostTo) => ({
      url: '/api/mastodon/schedule',
      body: {
        title: 'Mastodon Scheduled Post',
        description: content,
        imgType: image ? 'FILE' : 'URL',
        mediaItems: image ? `data:image/png;base64,${image.base64}` : '',
        mediaAltText: altText || null,
        scheduledTime,
        crossPostTo,
      },
    }),
    deleteSchedule: id => `/api/mastodon/schedule/${id}`,
    getScheduled: () => '/api/mastodon/schedule',
    getHistory: () => '/api/mastodon/history?limit=20',
    // Mastodon stores post content inside a JSON-encoded postData field
    parseScheduledText: post => {
      try {
        return JSON.parse(post.postData).status || 'No content';
      } catch {
        return 'Invalid post data';
      }
    },
    parseScheduledImage: post => {
      try {
        return JSON.parse(post.postData).local_media_base64 || null;
      } catch {
        return null;
      }
    },
    parseScheduledTime: post => post.scheduledTime,
  },

  x: {
    postNow: content => ({
      url: '/x/post',
      body: { content },
    }),
    schedule: (content, _image, _altText, scheduledTime) => ({
      url: '/x/schedule',
      body: { content, scheduledAt: scheduledTime },
    }),
    deleteSchedule: id => `/x/schedule/${id}`,
    getScheduled: () => '/x/schedule',
    getHistory: () => '/x/history?limit=20',
    // X model stores fields at top level
    parseScheduledText: post => post.content || 'No content',
    parseScheduledImage: () => null, // media support comes later
    parseScheduledTime: post => post.scheduledAt,
  },
};

// Fallback to mastodon shape for any platform not yet wired
const getAPI = platform => platformAPI[platform] || platformAPI.mastodon;

// Component
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
  const api = getAPI(platform);

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

  // Load data when switching tabs (now works for all wired platforms)
  useEffect(() => {
    if (activeSubTab === 'scheduled' && platformAPI[platform]) {
      loadScheduledPosts();
    } else if (activeSubTab === 'history' && platformAPI[platform]) {
      loadPostHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, platform]);

  const updatePreference = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    localStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
  };

  // API calls (platform-routed)
  const loadScheduledPosts = async () => {
    setIsLoadingScheduled(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(api.getScheduled(), {
        headers: { ...(token && { Authorization: token }) },
      });
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
      const token = localStorage.getItem('token');
      const response = await fetch(api.getHistory(), {
        headers: { ...(token && { Authorization: token }) },
      });
      if (response.ok) {
        const data = await response.json();
        // X wraps results in { posts, total }; Mastodon returns an array
        setPostHistory(data.posts || data || []);
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

  const copyAndOpenX = async content => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // clipboard may fail in non-HTTPS contexts; continue anyway
    }
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(content)}`, '_blank');
    toast.success('Content copied to clipboard! X is opening — paste and post.', {
      autoClose: 5000,
    });
  };

  // Post Now (platform-routed)
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
      const { url, body } = api.postNow(
        postContent.trim(),
        uploadedImage,
        imageAltText,
        selectedPlatforms,
      );

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: token }) },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        if (platform === 'x') {
          await copyAndOpenX(postContent.trim());
        } else {
          let message = `Successfully posted to ${platform}!`;
          if (selectedPlatforms.length > 0) {
            message += ` (Selected for: ${selectedPlatforms.join(', ')})`;
          }
          toast.success(message, { autoClose: 5000 });
        }
        clearComposer();
        if (activeSubTab === 'history') {
          loadPostHistory();
        }
      } else {
        const err = await response.json().catch(() => null);
        toast.error(err?.detail || `Failed to post to ${platform}.`);
      }
    } catch (err) {
      toast.error(`Error while posting to ${platform}.`);
    } finally {
      setIsPosting(false);
    }
  };

  // Schedule Post (platform-routed)
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
      const token = localStorage.getItem('token');

      // If editing, delete the old version first
      if (editingPostId) {
        await fetch(api.deleteSchedule(editingPostId), {
          method: 'DELETE',
          headers: { ...(token && { Authorization: token }) },
        });
      }

      const { url, body } = api.schedule(
        postContent.trim(),
        uploadedImage,
        imageAltText,
        scheduledDateTime.toISOString(),
        selectedPlatforms,
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { Authorization: token }) },
        body: JSON.stringify(body),
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

  // Edit / Delete / Post-Now for scheduled posts
  const handleEditScheduled = post => {
    try {
      const content = api.parseScheduledText(post);
      setPostContent(content);

      // Load image if exists (Mastodon-specific for now)
      const imageBase64 = api.parseScheduledImage(post);
      if (imageBase64) {
        setUploadedImage({
          base64: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          preview: imageBase64,
          name: 'scheduled-image.png',
        });
      }

      // Load alt text if exists
      if (platform === 'mastodon') {
        try {
          const postData = JSON.parse(post.postData);
          setImageAltText(postData.mediaAltText || '');
        } catch {
          // ignore
        }
      }

      // Load scheduled time
      const scheduledTime = new Date(api.parseScheduledTime(post));
      const dateStr = scheduledTime.toISOString().split('T')[0];
      const timeStr = scheduledTime.toTimeString().slice(0, 5);
      setScheduleDate(dateStr);
      setScheduleTime(timeStr);

      setEditingPostId(post._id);
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
        const token = localStorage.getItem('token');
        const response = await fetch(api.deleteSchedule(postId), {
          method: 'DELETE',
          headers: { ...(token && { Authorization: token }) },
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
        const content = api.parseScheduledText(post);

        if (platform === 'x') {
          await copyAndOpenX(content);
          const token = localStorage.getItem('token');
          await fetch(`/api/x/schedule/${post._id}/mark-posted`, {
            method: 'PATCH',
            headers: { ...(token && { Authorization: token }) },
          });
          loadScheduledPosts();
          return;
        }

        // Mastodon path - preserve original image/alt handling
        const postData = JSON.parse(post.postData);
        const req = api.postNow(
          postData.status,
          postData.local_media_base64
            ? { base64: postData.local_media_base64.replace(/^data:image\/\w+;base64,/, '') }
            : null,
          postData.mediaAltText,
          [],
        );

        const token = localStorage.getItem('token');
        const response = await fetch(req.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token && { Authorization: token }) },
          body: JSON.stringify(req.body),
        });

        if (response.ok) {
          toast.success('Posted successfully!');
          await handleDeleteScheduled(post._id, true);
        } else {
          const err = await response.json().catch(() => null);
          toast.error(err?.detail || 'Failed to post.');
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
          platform === 'x'
            ? 'This will copy the content to your clipboard and open X. The post will be marked as completed.'
            : `This will post immediately to ${platform} and remove it from your scheduled posts. Continue?`,
        onConfirm: performPost,
        confirmText: platform === 'x' ? 'Copy & Open X' : 'Post Now',
        confirmColor: 'success',
        showDontShowAgain: true,
        preferenceKey: 'confirmPostNow',
      });
    }
  };

  const handleMarkAsPosted = async postId => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/x/schedule/${postId}/mark-posted`, {
        method: 'PATCH',
        headers: { ...(token && { Authorization: token }) },
      });
      if (response.ok) {
        toast.success('Post marked as posted!');
        loadScheduledPosts();
      } else {
        toast.error('Failed to mark post as posted.');
      }
    } catch (err) {
      toast.error('Error marking post as posted.');
    }
  };

  const handleSkipPost = async postId => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/x/schedule/${postId}/skip`, {
        method: 'PATCH',
        headers: { ...(token && { Authorization: token }) },
      });
      if (response.ok) {
        toast.success('Post skipped.');
        loadScheduledPosts();
      } else {
        toast.error('Failed to skip post.');
      }
    } catch (err) {
      toast.error('Error skipping post.');
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

  const stripHtml = html => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Platform display names / icons
  const platformDisplay = {
    mastodon: { name: 'Mastodon', icon: 'https://cdn-icons-png.flaticon.com/512/6295/6295417.png' },
    x: { name: 'X', icon: 'https://cdn-icons-png.flaticon.com/512/5969/5969020.png' },
  };

  const display = platformDisplay[platform] || { name: platform, icon: null };

  // Render
  return (
    <div className={styles['social-media-composer']}>
      <h3 className={styles['platform-title']}>{platform}</h3>

      <div className={styles['tabs-container']}>
        {tabOrder.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            className={`${styles['tab-button']} ${activeSubTab === id ? styles.active : ''}`}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      {platform === 'x' && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
            color: '#856404',
          }}
        >
          Auto-posting to X is not currently supported. Compose your posts here and post them
          manually with just a few clicks.
        </div>
      )}

      {activeSubTab === 'composer' && (
        <div className={styles['composer-content']}>
          {editingPostId && (
            <div className={styles['edit-banner']}>
              <span>✏️ Editing scheduled post</span>
              <button
                type="button"
                onClick={handleCancelEdit}
                className={styles['btn-cancel-edit']}
              >
                Cancel Edit
              </button>
            </div>
          )}

          <textarea
            value={postContent}
            onChange={e => setPostContent(e.target.value)}
            placeholder={`Write your ${platform} post here...`}
            className={styles['post-textarea']}
          />
          <CharacterCounter currentLength={postContent.length} maxLength={charLimit} />

          {/* Image upload - hide for X until media support is added */}
          {platform !== 'x' && (
            <div className={styles['upload-section']}>
              <label htmlFor="image-upload" className={styles['section-label']}>
                Add Image (optional):
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles['file-input']}
              />
              {uploadedImage && (
                <div>
                  <div className={styles['image-preview-container']}>
                    <img
                      src={uploadedImage.preview}
                      alt="Upload preview"
                      className={styles['image-preview']}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={styles['remove-image-btn']}
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles['alt-text-section']}>
                    <label htmlFor="alt-text" className={styles['section-label']}>
                      Alt Text (for accessibility):
                    </label>
                    <input
                      id="alt-text"
                      type="text"
                      value={imageAltText}
                      onChange={e => setImageAltText(e.target.value)}
                      placeholder="Describe the image for screen readers..."
                      className={styles['alt-text-input']}
                      maxLength={1500}
                    />
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                      {imageAltText.length} / 1500 characters
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles['schedule-section']}>
            <label htmlFor="schedule-date" className={styles['section-label']}>
              Schedule for later (optional):
            </label>
            <div className={styles['datetime-inputs']}>
              <input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className={styles['datetime-input']}
              />
              <input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                className={styles['datetime-input']}
              />
            </div>
          </div>

          <div className={styles['action-buttons']}>
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
              {isPosting ? 'Posting…' : platform === 'x' ? 'Copy & Post to X' : 'Post Now'}
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

            <div className={styles['crosspost-container']}>
              <button
                type="button"
                onClick={() => setShowCrossPost(!showCrossPost)}
                className="btn btn-secondary"
              >
                Also post to {showCrossPost ? '▴' : '▾'}
              </button>
              {showCrossPost && (
                <div className={styles['crosspost-dropdown']}>
                  <label className={styles['crosspost-option']}>
                    <input
                      type="checkbox"
                      checked={crossPostPlatforms.facebook}
                      onChange={() => handleCrossPostToggle('facebook')}
                    />
                    <span>Facebook</span>
                  </label>
                  <label className={styles['crosspost-option']}>
                    <input
                      type="checkbox"
                      checked={crossPostPlatforms.linkedin}
                      onChange={() => handleCrossPostToggle('linkedin')}
                    />
                    <span>LinkedIn</span>
                  </label>
                  <label className={styles['crosspost-option']}>
                    <input
                      type="checkbox"
                      checked={crossPostPlatforms.instagram}
                      onChange={() => handleCrossPostToggle('instagram')}
                    />
                    <span>Instagram</span>
                  </label>
                  <label className={styles['crosspost-option']}>
                    <input
                      type="checkbox"
                      checked={crossPostPlatforms.x}
                      onChange={() => handleCrossPostToggle('x')}
                    />
                    <span>X (Twitter)</span>
                  </label>
                  <p className={styles['crosspost-note']}>
                    Note: Cross-posting functionality coming soon. Currently shows selection only.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'scheduled' && (
        <div className={styles['scheduled-content']}>
          <h4>Scheduled Posts for {platform}</h4>
          {isLoadingScheduled && <p>Loading...</p>}
          {!isLoadingScheduled && scheduledPosts.length === 0 && <p>No scheduled posts yet.</p>}
          {!isLoadingScheduled && scheduledPosts.length > 0 && (
            <div className={styles['posts-list']}>
              {scheduledPosts.map(post => {
                const postText = api.parseScheduledText(post);
                const imageBase64 = api.parseScheduledImage(post);
                const time = api.parseScheduledTime(post);
                const isX = platform === 'x';
                const xStatus = isX ? post.status : null;

                const cardStyle =
                  isX && xStatus === 'ready'
                    ? { border: '2px solid #ffc107', background: '#fff8e1' }
                    : isX && xStatus === 'posted'
                    ? { opacity: 0.7, background: '#e8f5e9' }
                    : isX && xStatus === 'skipped'
                    ? { opacity: 0.5, background: '#f5f5f5' }
                    : {};

                const xStatusBadge =
                  xStatus === 'ready'
                    ? { bg: '#ffc107', color: '#333', text: '⏰ Ready to Post' }
                    : xStatus === 'pending'
                    ? { bg: '#2196f3', color: '#fff', text: '🕐 Pending' }
                    : xStatus === 'posted'
                    ? { bg: '#4caf50', color: '#fff', text: '✓ Posted' }
                    : xStatus === 'skipped'
                    ? { bg: '#9e9e9e', color: '#fff', text: '— Skipped' }
                    : null;

                return (
                  <div key={post._id} className={styles['post-card']} style={cardStyle}>
                    <div className={styles['post-card-content']}>
                      <p className={styles['post-text']}>{postText}</p>
                      <p className={styles['post-meta']}>📅 {formatScheduledTime(time)}</p>
                      {isX && xStatusBadge && (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            marginTop: '0.25rem',
                            background: xStatusBadge.bg,
                            color: xStatusBadge.color,
                          }}
                        >
                          {xStatusBadge.text}
                        </span>
                      )}
                      {imageBase64 && (
                        <img
                          src={imageBase64}
                          alt="Post thumbnail"
                          className={styles['post-thumbnail']}
                        />
                      )}
                    </div>
                    <div className={styles['post-card-actions']}>
                      {(!isX || xStatus === 'pending' || xStatus === 'ready') && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditScheduled(post)}
                            className={`${styles['action-btn']} ${styles.edit}`}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostScheduledNow(post)}
                            className={`${styles['action-btn']} ${styles.success}`}
                            title={isX ? 'Copy & post to X' : 'Post now'}
                          >
                            ✔
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteScheduled(post._id)}
                            className={`${styles['action-btn']} ${styles.danger}`}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      {isX && (xStatus === 'pending' || xStatus === 'ready') && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkAsPosted(post._id)}
                            title="Mark as already posted"
                            style={{ color: '#4caf50' }}
                            className={styles['action-btn']}
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSkipPost(post._id)}
                            title="Skip this post"
                            style={{ color: '#9e9e9e' }}
                            className={styles['action-btn']}
                          >
                            ⊘
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className={styles['history-content']}>
          <h4>Post History for {platform}</h4>
          {isLoadingHistory && <p>Loading...</p>}
          {!isLoadingHistory && postHistory.length === 0 && <p>No posts found in history.</p>}
          {!isLoadingHistory && postHistory.length > 0 && (
            <div className={styles['posts-list']}>
              {postHistory.map(post => {
                // Normalize fields across platforms
                const key = post.id || post._id;
                const content = post.content || '';
                const timestamp = post.created_at || post.postedAt || post.createdAt;
                const isMastodon = platform === 'mastodon';

                return (
                  <div key={key} className={styles['post-card']}>
                    <div className={styles['post-card-full']}>
                      <p className={styles['post-text']}>{stripHtml(content)}</p>
                      <p className={styles['post-meta']}>📅 {formatScheduledTime(timestamp)}</p>

                      {/* Mastodon stats */}
                      {isMastodon && (
                        <div className={styles['post-stats']}>
                          <span>❤️ {post.favourites_count}</span>
                          <span>🔄 {post.reblogs_count}</span>
                        </div>
                      )}

                      {/* X stats */}
                      {platform === 'x' && (
                        <div className={styles['post-stats']}>
                          <span className={`${styles['status-badge']} ${styles.success}`}>
                            ✓ Posted
                          </span>
                          {post.postedAt && (
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                              Posted {formatScheduledTime(post.postedAt)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Mastodon media */}
                      {isMastodon && post.media_attachments?.length > 0 && (
                        <div className={styles['post-media']}>
                          {post.media_attachments.map((media, idx) => (
                            <img
                              key={idx}
                              src={media.preview_url || media.url}
                              alt="Post media"
                              className={styles['post-thumbnail']}
                            />
                          ))}
                        </div>
                      )}

                      {/* Platform-specific link */}
                      {isMastodon && post.url && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles['post-link']}
                        >
                          View on Mastodon →
                        </a>
                      )}
                      {/* No direct link to X post — content was posted manually */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'details' && (
        <div className={styles['details-content']}>
          <p>
            <strong>{platform}-Specific Details</strong>
          </p>
          <ul>
            <li>Max characters: {charLimit}</li>
            <li>Supports hashtags: Yes</li>
            <li>Image support: {platform === 'x' ? 'Coming soon' : 'Yes'}</li>
            <li>
              Alt text support: {platform === 'x' ? 'Coming soon' : 'Yes (up to 1500 characters)'}
            </li>
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
            <div className={styles['preview-container']}>
              <div className={styles['preview-header']}>
                {display.icon && (
                  <img
                    src={display.icon}
                    alt={display.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      marginRight: '12px',
                    }}
                  />
                )}
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
                className={styles['preview-content']}
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
              {isPosting ? 'Posting...' : platform === 'x' ? 'Copy & Post to X' : 'Post Now'}
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  );
}
