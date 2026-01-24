import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import axios from 'axios';
import styles from './TruthSocialAutoPoster.module.css';

// API Base for backend
const API_BASE = process.env.REACT_APP_APIENDPOINT || 'http://localhost:4500/api';

// LocalStorage key for token
const TOKEN_KEY = 'truthSocialAccessToken';

// Custom Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmStyle,
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    if (confirmStyle === 'danger') return styles.confirmBtnDanger;
    if (confirmStyle === 'success') return styles.confirmBtnSuccess;
    return styles.confirmBtnPrimary;
  };

  return (
    <dialog open className={styles.modalOverlay} onClose={onCancel}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`${styles.modalConfirmBtn} ${getConfirmButtonClass()}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmStyle: PropTypes.string,
};

ConfirmationModal.defaultProps = {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmStyle: 'primary',
};

// Edit Scheduled Post Modal
const EditScheduledModal = ({ isOpen, post, onSave, onCancel, darkMode }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (post) {
      setSubject(post.subject || '');
      setContent(post.content || '');
      setVisibility(post.visibility || 'public');
      setTags(post.tags || '');
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleSave = () => {
    onSave({
      ...post,
      subject,
      content,
      visibility,
      tags,
    });
  };

  const darkModeClass = darkMode ? styles.darkMode : '';

  return (
    <dialog open className={styles.modalOverlay} onClose={onCancel}>
      <div className={`${styles.editModalContent} ${darkModeClass}`}>
        <h3 className={styles.editModalTitle}>Edit Scheduled Post</h3>

        <div className={styles.editFieldGroup}>
          <label htmlFor="edit-subject" className={styles.editFieldLabel}>
            Subject
          </label>
          <input
            id="edit-subject"
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className={styles.editInput}
            maxLength={255}
          />
        </div>

        <div className={styles.editFieldGroup}>
          <label htmlFor="edit-content" className={styles.editFieldLabel}>
            Content
          </label>
          <textarea
            id="edit-content"
            value={content}
            onChange={e => setContent(e.target.value)}
            className={styles.editTextarea}
            rows={5}
          />
        </div>

        <div className={styles.editRow}>
          <div className={styles.editFieldGroup}>
            <label htmlFor="edit-visibility" className={styles.editFieldLabel}>
              Security
            </label>
            <select
              id="edit-visibility"
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
              className={styles.editSelect}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>

          <div className={styles.editFieldGroup}>
            <label htmlFor="edit-tags" className={styles.editFieldLabel}>
              Tags
            </label>
            <input
              id="edit-tags"
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className={styles.editInput}
              placeholder="comma-separated"
            />
          </div>
        </div>

        <div className={styles.editModalActions}>
          <button type="button" className={styles.editCancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.editSaveBtn} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </dialog>
  );
};

EditScheduledModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  post: PropTypes.shape({
    subject: PropTypes.string,
    content: PropTypes.string,
    visibility: PropTypes.string,
    tags: PropTypes.string,
    _id: PropTypes.string,
    scheduledTime: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

EditScheduledModal.defaultProps = {
  post: null,
  darkMode: false,
};

const TruthSocialAutoPoster = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [darkMode, setDarkMode] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    confirmStyle: 'primary',
  });

  // Edit modal state
  const [editModal, setEditModal] = useState({
    isOpen: false,
    post: null,
  });

  // Settings state
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Compose state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Schedule state
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Cross-post dropdown
  const [showCrossPost, setShowCrossPost] = useState(false);
  const [crossPostPlatforms, setCrossPostPlatforms] = useState([]);

  // Scheduled posts state
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);

  // Post history state
  const [postHistory, setPostHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Character limits
  const SUBJECT_LIMIT = 255;
  const CONTENT_LIMIT = 60000;

  // Cross-post options
  const crossPostOptions = [
    { id: 'instagram', label: 'Instagram' },
    { id: 'x', label: 'X' },
    { id: 'facebook', label: 'Facebook' },
  ];

  // Helper function to show confirmation modal
  const showConfirmation = (
    title,
    message,
    onConfirm,
    confirmText = 'Confirm',
    confirmStyle = 'primary',
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      confirmText,
      confirmStyle,
    });
  };

  const closeConfirmation = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Get stored token
  const getStoredToken = () => localStorage.getItem(TOKEN_KEY) || '';

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark =
        document.body.classList.contains('dark-mode') ||
        document.documentElement.dataset.theme === 'dark' ||
        globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  // Load saved token on mount
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAccessToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  // Post to Truth Social via backend proxy (avoids CORS)
  const postToTruthSocial = async (postContent, vis = 'public') => {
    const token = getStoredToken();
    if (!token) throw new Error('No access token');

    const response = await axios.post(`${API_BASE}/truthsocial/post`, {
      content: postContent,
      visibility: vis,
      accessToken: token,
    });

    return response.data;
  };

  // Save to history
  const saveToHistory = async (postSubject, postContent, postId) => {
    try {
      await axios.post(`${API_BASE}/truthsocial/history`, {
        subject: postSubject,
        content: postContent,
        truthSocialPostId: postId,
      });
    } catch (err) {
      // History save failed - non-critical error, continue silently
      toast.warn('Could not save to history');
    }
  };

  // Load scheduled posts
  const loadScheduledPosts = useCallback(async () => {
    setIsLoadingScheduled(true);
    try {
      const response = await axios.get(`${API_BASE}/truthsocial/schedule`);
      setScheduledPosts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to load scheduled posts');
    } finally {
      setIsLoadingScheduled(false);
    }
  }, []);

  // Load post history
  const loadPostHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(`${API_BASE}/truthsocial/history`);
      setPostHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to load post history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'scheduled') {
      loadScheduledPosts();
    } else if (activeTab === 'history') {
      loadPostHistory();
    }
  }, [activeTab, loadScheduledPosts, loadPostHistory]);

  // Save token to localStorage only
  const handleSaveToken = () => {
    if (!accessToken.trim()) {
      toast.error('Please enter an access token');
      return;
    }

    localStorage.setItem(TOKEN_KEY, accessToken.trim());
    setIsLoggedIn(true);
    toast.success('Token saved!');
  };

  // Logout - clear from localStorage only
  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken('');
    setIsLoggedIn(false);
    toast.success('Logged out');
  };

  // Reset form
  const resetForm = () => {
    setSubject('');
    setContent('');
    setVisibility('public');
    setTags('');
    setScheduleDate('');
    setScheduleTime('');
    setCrossPostPlatforms([]);
  };

  // Get min date
  const getMinDate = () => new Date().toISOString().split('T')[0];

  // Build full post content with subject and tags
  const buildPostContent = (subj, cont, tagStr) => {
    let fullContent = '';
    if (subj) fullContent += `${subj}\n\n`;
    fullContent += cont;
    if (tagStr) {
      const hashtags = tagStr
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .map(t => (t.startsWith('#') ? t : `#${t}`))
        .join(' ');
      fullContent += `\n\n${hashtags}`;
    }
    return fullContent;
  };

  // Post now
  const handlePostNow = () => {
    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }
    if (!isLoggedIn) {
      toast.error('Please add your token in Settings first');
      setActiveTab('settings');
      return;
    }

    showConfirmation(
      'Post to Truth Social',
      'Are you sure you want to post this now?',
      async () => {
        setIsPosting(true);
        try {
          const fullContent = buildPostContent(subject, content, tags);
          const result = await postToTruthSocial(fullContent, visibility);

          await saveToHistory(subject, content, result.id);

          toast.success('Posted to Truth Social!');
          resetForm();
        } catch (err) {
          const errorMessage = err.response?.data?.error || err.message || 'Failed to post';
          toast.error(errorMessage);
        } finally {
          setIsPosting(false);
        }
      },
      'Post Now',
      'success',
    );
  };

  // Schedule post
  const handleSchedulePost = async () => {
    if (!content.trim()) {
      toast.error('Content cannot be empty');
      return;
    }
    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select date and time');
      return;
    }

    const [year, month, day] = scheduleDate.split('-').map(Number);
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    const scheduledDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    if (scheduledDateTime <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    setIsPosting(true);
    try {
      await axios.post(`${API_BASE}/truthsocial/schedule`, {
        subject: subject.trim(),
        content: content.trim(),
        visibility,
        tags: tags.trim(),
        scheduledTime: scheduledDateTime.toISOString(),
      });
      toast.success('Post scheduled!');
      resetForm();
      loadScheduledPosts();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to schedule';
      toast.error(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  // Delete scheduled
  const handleDeleteScheduled = id => {
    showConfirmation(
      'Delete Scheduled Post',
      'Are you sure you want to delete this post?',
      async () => {
        try {
          await axios.delete(`${API_BASE}/truthsocial/schedule/${id}`);
          toast.success('Deleted');
          loadScheduledPosts();
        } catch (err) {
          const errorMessage = err.response?.data?.error || 'Failed to delete';
          toast.error(errorMessage);
        }
      },
      'Delete',
      'danger',
    );
  };

  // Post scheduled now
  const handlePostScheduledNow = post => {
    showConfirmation(
      'Post Now',
      'Post this to Truth Social immediately?',
      async () => {
        if (!isLoggedIn) {
          toast.error('Please add your token in Settings');
          return;
        }
        setIsPosting(true);
        try {
          const fullContent = buildPostContent(post.subject, post.content, post.tags);
          const result = await postToTruthSocial(fullContent, post.visibility);

          await saveToHistory(post.subject, post.content, result.id);
          await axios.delete(`${API_BASE}/truthsocial/schedule/${post._id}`);

          toast.success('Posted!');
          loadScheduledPosts();
        } catch (err) {
          const errorMessage = err.response?.data?.error || 'Failed to post';
          toast.error(errorMessage);
        } finally {
          setIsPosting(false);
        }
      },
      'Post Now',
      'success',
    );
  };

  // Edit scheduled
  const handleEditScheduled = post => {
    setEditModal({ isOpen: true, post });
  };

  const handleSaveEdit = async updatedPost => {
    try {
      await axios.put(`${API_BASE}/truthsocial/schedule/${updatedPost._id}`, {
        subject: updatedPost.subject,
        content: updatedPost.content,
        visibility: updatedPost.visibility,
        tags: updatedPost.tags,
        scheduledTime: updatedPost.scheduledTime,
      });
      toast.success('Updated!');
      setEditModal({ isOpen: false, post: null });
      loadScheduledPosts();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update';
      toast.error(errorMessage);
    }
  };

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Toggle cross-post
  const toggleCrossPost = id => {
    setCrossPostPlatforms(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  };
  const darkModeClass = darkMode ? styles.darkMode : '';

  return (
    <div className={`${styles.container} ${darkModeClass}`}>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmation}
        confirmText={confirmModal.confirmText}
        confirmStyle={confirmModal.confirmStyle}
      />

      {/* Edit Modal */}
      <EditScheduledModal
        isOpen={editModal.isOpen}
        post={editModal.post}
        onSave={handleSaveEdit}
        onCancel={() => setEditModal({ isOpen: false, post: null })}
        darkMode={darkMode}
      />

      <div className={styles.header}>
        <h2 className={styles.title}>Truth Social</h2>
        <div className={styles.connectionBadge}>
          <span className={`${styles.statusDot} ${isLoggedIn ? styles.success : ''}`} />
          {isLoggedIn ? 'Connected' : 'Not Connected'}
        </div>
      </div>

      <div className={styles.tabs}>
        {['compose', 'scheduled', 'history', 'settings'].map(tab => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className={styles.composeSection}>
            {/* Subject */}
            <div className={styles.fieldGroup}>
              <label htmlFor="compose-subject" className={styles.fieldLabel}>
                Subject ({subject.length}/{SUBJECT_LIMIT})
              </label>
              <input
                id="compose-subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className={styles.textInput}
                maxLength={SUBJECT_LIMIT}
                placeholder="Optional title/subject"
              />
            </div>

            {/* Content */}
            <div className={styles.fieldGroup}>
              <label htmlFor="compose-content" className={styles.visuallyHidden}>
                Content
              </label>
              <textarea
                id="compose-content"
                className={styles.contentInput}
                placeholder="What's happening?"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
              />
              <div className={styles.charCount}>
                {content.length} / {CONTENT_LIMIT}
              </div>
            </div>

            {/* Security & Tags Row */}
            <div className={styles.rowGroup}>
              <div className={styles.fieldGroup}>
                <label htmlFor="compose-visibility" className={styles.fieldLabel}>
                  Security
                </label>
                <select
                  id="compose-visibility"
                  value={visibility}
                  onChange={e => setVisibility(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label htmlFor="compose-tags" className={styles.fieldLabel}>
                  Tags
                </label>
                <input
                  id="compose-tags"
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  className={styles.textInput}
                  placeholder="comma-separated"
                />
              </div>
            </div>

            {/* Schedule Row */}
            <div className={styles.fieldGroup}>
              <label htmlFor="compose-schedule-date" className={styles.fieldLabel}>
                Schedule (optional)
              </label>
              <div className={styles.scheduleRow}>
                <input
                  id="compose-schedule-date"
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={getMinDate()}
                  className={styles.dateInput}
                />
                <label htmlFor="compose-schedule-time" className={styles.visuallyHidden}>
                  Schedule Time
                </label>
                <input
                  id="compose-schedule-time"
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className={styles.timeInput}
                />
              </div>
              <p className={styles.scheduleNote}>
                ⚠️ <strong>Limitations:</strong>
                <br />
                • Auto-posting is not supported - scheduled posts must be manually posted from the
                Scheduled tab.
                <br />• Image uploads are not supported due to Truth Social API restrictions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtonsRow}>
              <button
                type="button"
                onClick={handlePostNow}
                disabled={isPosting || !content.trim()}
                className={styles.postNowBtn}
              >
                {isPosting ? 'Posting...' : 'Post Now'}
              </button>
              <button
                type="button"
                onClick={handleSchedulePost}
                disabled={isPosting || !content.trim()}
                className={styles.scheduleBtn}
              >
                Schedule
              </button>
              <div className={styles.crossPostWrapper}>
                <button
                  type="button"
                  onClick={() => setShowCrossPost(!showCrossPost)}
                  className={styles.crossPostBtn}
                >
                  Also post to ▼
                </button>
                {showCrossPost && (
                  <div className={styles.crossPostDropdown}>
                    {crossPostOptions.map(opt => (
                      <label
                        key={opt.id}
                        htmlFor={`crosspost-${opt.id}`}
                        className={styles.crossPostOption}
                      >
                        
                        <input
                          id={`crosspost-${opt.id}`}
                          type="checkbox"
                          checked={crossPostPlatforms.includes(opt.id)}
                          onChange={() => toggleCrossPost(opt.id)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Tab */}
        {activeTab === 'scheduled' && (
          <div className={styles.scheduledSection}>
            <div className={styles.scheduledNote}>
              ⚠️ Auto-posting is not available due to Truth Social API restrictions. Please click
              &quot;Post Now&quot; to manually post when ready.
            </div>
            {isLoadingScheduled ? (
              <div className={styles.loading}>Loading...</div>
            ) : scheduledPosts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📅</div>
                <p>No scheduled posts</p>
              </div>
            ) : (
              <div className={styles.postsList}>
                {scheduledPosts.map(post => (
                  <div key={post._id} className={styles.postCard}>
                    {post.subject && <div className={styles.postSubject}>{post.subject}</div>}
                    <div className={styles.postContent}>{post.content}</div>
                    <div className={styles.postMeta}>
                      <span>📅 {formatDate(post.scheduledTime)}</span>
                      {post.visibility && (
                        <span className={styles.visibilityBadge}>{post.visibility}</span>
                      )}
                    </div>
                    <div className={styles.postActions}>
                      <button
                        type="button"
                        onClick={() => handlePostScheduledNow(post)}
                        className={styles.postNowSmallBtn}
                        disabled={isPosting}
                      >
                        Post Now
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditScheduled(post)}
                        className={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduled(post._id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={styles.historySection}>
            {isLoadingHistory ? (
              <div className={styles.loading}>Loading...</div>
            ) : postHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📜</div>
                <p>No posts yet</p>
              </div>
            ) : (
              <div className={styles.postsList}>
                {postHistory.map(post => (
                  <div key={post._id} className={styles.postCard}>
                    {post.subject && <div className={styles.postSubject}>{post.subject}</div>}
                    <div className={styles.postContent}>{post.content}</div>
                    <div className={styles.postMeta}>
                      <span>✅ Posted {formatDate(post.postedAt || post.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={styles.settingsSection}>
            <div className={styles.settingsCard}>
              <h3 className={styles.settingsTitle}>Truth Social API Token</h3>
              <p className={styles.settingsDescription}>
                Enter your access token to enable posting.
              </p>

              {isLoggedIn ? (
                <div className={styles.loggedInState}>
                  <div className={styles.successMessage}>✅ Connected</div>
                  <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="settings-token" className={styles.visuallyHidden}>
                      Access Token
                    </label>
                    <div className={styles.tokenInputWrapper}>
                      <input
                        id="settings-token"
                        type={showToken ? 'text' : 'password'}
                        value={accessToken}
                        onChange={e => setAccessToken(e.target.value)}
                        className={styles.textInput}
                        placeholder="Paste token here"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className={styles.toggleTokenBtn}
                        aria-label={showToken ? 'Hide token' : 'Show token'}
                      >
                        {showToken ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveToken}
                    disabled={!accessToken.trim()}
                    className={styles.saveBtn}
                  >
                    Save Token
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TruthSocialAutoPoster;
