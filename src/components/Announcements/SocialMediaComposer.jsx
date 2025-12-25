/* eslint-disable jsx-a11y/label-has-associated-control, no-console, no-alert */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// --- DEBOUNCE HOOK ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- HTML PARSER ---
const parseContentForEdit = htmlContent => {
  const imgTagMatch = htmlContent.match(/<img\s+[^>]*>/i);
  if (imgTagMatch) {
    const imgTag = imgTagMatch[0];
    const srcMatch = imgTag.match(/src="([^"]+)"/i);
    const altMatch = imgTag.match(/alt="([^"]*)"/i);
    const imageSrc = srcMatch ? srcMatch[1] : null;
    const altText = altMatch ? altMatch[1] : '';
    const textContent = htmlContent
      .replace(/<img\s+[^>]*>/gi, '')
      .replace(/<br\s*\/?>/g, '\n')
      .trim();
    return { hasImage: !!imageSrc, imageSrc, altText, textContent };
  }
  return {
    hasImage: false,
    imageSrc: null,
    altText: '',
    textContent: htmlContent.replace(/<br\s*\/?>/g, '\n'),
  };
};

export default function SocialMediaComposer({ platform, darkMode = false }) {
  // --- STATE ---
  const [localContentValue, setLocalContentValue] = useState('');
  const postContent = useDebounce(localContentValue, 300);
  const [activeSubTab, setActiveSubTab] = useState('composer');
  const [ljUsername, setLjUsername] = useState('');
  const [ljPassword, setLjPassword] = useState('');
  const [ljSubject, setLjSubject] = useState('');
  const [ljSecurity, setLjSecurity] = useState('public');
  const [ljTags, setLjTags] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [postHistory, setPostHistory] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageAltText, setImageAltText] = useState('');
  const [showCrossPostDropdown, setShowCrossPostDropdown] = useState(false);
  const crossPostDropdownRef = useRef(null);
  const [crossPostPlatforms, setCrossPostPlatforms] = useState({
    facebook: false,
    instagram: false,
    linkedin: false,
    pinterest: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPostNowModal, setShowPostNowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editImageData, setEditImageData] = useState({
    hasImage: false,
    imageSrc: null,
    altText: '',
  });

  const isLiveJournal = platform?.toLowerCase() === 'livejournal';
  const charLimit = 60000;
  const charCount = localContentValue.length;

  // --- THEME DEFINITION ---
  const theme = {
    bg: darkMode ? '#121212' : '#ffffff',
    text: darkMode ? '#e0e0e0' : '#212529',
    subText: darkMode ? '#aaaaaa' : '#6c757d',
    border: darkMode ? '#444444' : '#dee2e6',
    inputBg: darkMode ? '#2d2d2d' : '#ffffff',
    panelBg: darkMode ? '#1e1e1e' : '#f8f9fa',
    modalBg: darkMode ? '#252525' : '#ffffff',
    tabActiveBg: darkMode ? '#0d6efd' : '#e7f1ff',
    tabActiveText: darkMode ? '#ffffff' : '#0d6efd',
    tabInactiveBg: darkMode ? '#2d2d2d' : '#f8f9fa',
    tabInactiveText: darkMode ? '#aaaaaa' : '#495057',
    success: '#28a745',
    danger: '#dc3545',
    primary: '#0d6efd',
  };

  // --- EFFECTS ---
  const loadScheduledPosts = async () => {
    try {
      const response = await axios.get('/api/livejournal/scheduled');
      if (response.data.success) setScheduledPosts(response.data.posts || []);
    } catch (error) {
      console.error(error);
    }
  };
  const loadPostHistory = async () => {
    try {
      const response = await axios.get('/api/livejournal/history');
      if (response.data.success) setPostHistory(response.data.posts || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isLiveJournal) {
      const savedUsername = localStorage.getItem('lj_username');
      if (savedUsername) setLjUsername(savedUsername);
      loadScheduledPosts();
      loadPostHistory();
    }
  }, [isLiveJournal]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (crossPostDropdownRef.current && !crossPostDropdownRef.current.contains(event.target)) {
        setShowCrossPostDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };
  const handleImageSelect = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB', 'error');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageAltText('');
  };
  const handleCrossPostToggle = key => {
    setCrossPostPlatforms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePost = async () => {
    if (!isLiveJournal) return;
    if (!ljUsername || !ljPassword) {
      showToast('Please enter credentials', 'error');
      return;
    }
    if (!postContent.trim() && !selectedImage) {
      showToast('Content cannot be empty', 'error');
      return;
    }
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('username', ljUsername);
      formData.append('password', ljPassword);
      formData.append('subject', ljSubject || 'Untitled');
      formData.append('content', postContent);
      formData.append('security', ljSecurity);
      formData.append('tags', ljTags);
      if (selectedImage) {
        formData.append('image', selectedImage);
        formData.append('altText', imageAltText);
      }
      const response = await axios.post('/api/livejournal/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        showToast('Posted successfully!', 'success');
        setLocalContentValue('');
        setLjSubject('');
        setLjTags('');
        removeImage();
        loadPostHistory();
        setCrossPostPlatforms({
          facebook: false,
          instagram: false,
          linkedin: false,
          pinterest: false,
        });
      } else {
        showToast(response.data.message || 'Failed', 'error');
      }
    } catch (error) {
      showToast('Error posting', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (!ljUsername || !ljPassword || !scheduleDate || !scheduleTime) {
      showToast('Missing fields', 'error');
      return;
    }
    const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledDateTime <= new Date()) {
      showToast('Time must be in future', 'error');
      return;
    }
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('username', ljUsername);
      formData.append('password', ljPassword);
      formData.append('subject', ljSubject || 'Untitled');
      formData.append('content', postContent);
      formData.append('security', ljSecurity);
      formData.append('tags', ljTags);
      formData.append('scheduledDateTime', scheduledDateTime.toISOString());
      if (selectedImage) {
        formData.append('image', selectedImage);
        formData.append('altText', imageAltText);
      }
      const response = await axios.post('/api/livejournal/schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        showToast('Scheduled!', 'success');
        setLocalContentValue('');
        setLjSubject('');
        setLjTags('');
        setScheduleDate('');
        setScheduleTime('');
        removeImage();
        loadScheduledPosts();
      }
    } catch (error) {
      showToast('Error scheduling', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const openEditModal = post => {
    const parsed = parseContentForEdit(post.content);
    setEditingPost({
      ...post,
      _id: post._id,
      content: parsed.textContent,
      scheduledFor: new Date(post.scheduledFor),
    });
    setEditImageData({
      hasImage: parsed.hasImage,
      imageSrc: parsed.imageSrc,
      altText: parsed.altText,
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    try {
      let finalContent = editingPost.content.replace(/\n/g, '<br/>');
      if (editImageData.hasImage && editImageData.imageSrc) {
        const alt = editImageData.altText ? editImageData.altText.replace(/"/g, '&quot;') : '';
        const imgHtml = `<img src="${editImageData.imageSrc}" alt="${alt}" title="${alt}" style="max-width:100%;" />`;
        finalContent = finalContent ? `${imgHtml}<br/><br/>${finalContent}` : imgHtml;
      }
      await axios.put(`/api/livejournal/schedule/${editingPost._id}`, {
        subject: editingPost.subject,
        content: finalContent,
        security: editingPost.security,
        tags: editingPost.tags,
        scheduledDateTime: editingPost.scheduledFor.toISOString(),
      });
      showToast('Updated!', 'success');
      loadScheduledPosts();
      setShowEditModal(false);
    } catch (error) {
      console.error(error);
      showToast('Error updating', 'error');
    }
  };

  const formatDate = d =>
    new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  // --- COMMON STYLES ---
  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.inputBg,
    color: theme.text,
  };
  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: theme.text,
  };
  const buttonBase = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  };
  const primaryButton = { ...buttonBase, backgroundColor: theme.primary, color: '#ffffff' };
  const successButton = { ...buttonBase, backgroundColor: theme.success, color: '#ffffff' };
  const dangerButton = {
    ...buttonBase,
    backgroundColor: theme.danger,
    color: '#ffffff',
    padding: '6px 12px',
    fontSize: '14px',
  };
  const secondaryButton = {
    ...buttonBase,
    backgroundColor: theme.inputBg,
    color: theme.text,
    border: `1px solid ${theme.border}`,
    padding: '8px 16px',
  };

  return (
    <div
      style={{ padding: '1rem', color: theme.text, backgroundColor: theme.bg, minHeight: '100%' }}
    >
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: toast.type === 'success' ? theme.success : theme.danger,
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            zIndex: 10000,
          }}
        >
          {toast.message}
        </div>
      )}

      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          <div
            style={{
              backgroundColor: theme.modalBg,
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '400px',
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3 style={{ color: theme.text, marginTop: 0 }}>Delete Scheduled Post</h3>
            <p style={{ color: theme.subText }}>Are you sure?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowDeleteModal(false)} style={secondaryButton}>
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`/api/livejournal/schedule/${selectedPostId}`);
                    showToast('Deleted!', 'success');
                    loadScheduledPosts();
                  } catch {
                    showToast('Error', 'error');
                  } finally {
                    setShowDeleteModal(false);
                  }
                }}
                style={dangerButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showPostNowModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          <div
            style={{
              backgroundColor: theme.modalBg,
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '400px',
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3 style={{ color: theme.text, marginTop: 0 }}>Post Now</h3>
            <p style={{ color: theme.subText }}>Post this immediately?</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowPostNowModal(false)} style={secondaryButton}>
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post(`/api/livejournal/post-scheduled/${selectedPostId}`);
                    showToast('Posted!', 'success');
                    loadScheduledPosts();
                    loadPostHistory();
                  } catch {
                    showToast('Error', 'error');
                  } finally {
                    setShowPostNowModal(false);
                  }
                }}
                style={{ ...successButton, padding: '8px 16px' }}
              >
                Post Now
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingPost && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          <div
            style={{
              backgroundColor: theme.modalBg,
              padding: '24px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              border: `1px solid ${theme.border}`,
            }}
          >
            <h3 style={{ color: theme.text, marginTop: 0 }}>Edit Post</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Subject</label>
              <input
                type="text"
                value={editingPost.subject}
                onChange={e => setEditingPost(prev => ({ ...prev, subject: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Content</label>
              {editImageData.hasImage && (
                <div
                  style={{
                    marginBottom: '12px',
                    padding: '12px',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    backgroundColor: theme.panelBg,
                  }}
                >
                  <img
                    src={editImageData.imageSrc}
                    alt={editImageData.altText}
                    style={{ maxWidth: '100%', marginBottom: '8px' }}
                  />
                  <div style={{ marginBottom: '8px' }}>
                    <label
                      style={{
                        fontSize: '12px',
                        display: 'block',
                        color: theme.subText,
                        marginBottom: '4px',
                      }}
                    >
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={editImageData.altText}
                      onChange={e =>
                        setEditImageData(prev => ({ ...prev, altText: e.target.value }))
                      }
                      style={{ ...inputStyle, padding: '6px', fontSize: '13px' }}
                    />
                  </div>
                  <button
                    onClick={() =>
                      setEditImageData({ hasImage: false, imageSrc: null, altText: '' })
                    }
                    style={dangerButton}
                  >
                    Remove Image
                  </button>
                </div>
              )}
              <textarea
                value={editingPost.content}
                onChange={e => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
                style={{ ...inputStyle, height: '150px', resize: 'vertical' }}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <label style={labelStyle}>Security</label>
                <select
                  value={editingPost.security}
                  onChange={e => setEditingPost(prev => ({ ...prev, security: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tags</label>
                <input
                  type="text"
                  value={editingPost.tags}
                  onChange={e => setEditingPost(prev => ({ ...prev, tags: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowEditModal(false)} style={secondaryButton}>
                Cancel
              </button>
              <button onClick={saveEdit} style={{ ...primaryButton, padding: '8px 16px' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 style={{ color: theme.text, marginTop: 0 }}>{platform}</h3>

      <div
        style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, marginBottom: '1rem' }}
      >
        {['composer', 'scheduled', 'history', 'details'].map(id => (
          <button
            key={id}
            onClick={() => setActiveSubTab(id)}
            style={{
              padding: '10px 16px',
              backgroundColor: activeSubTab === id ? theme.tabActiveBg : theme.tabInactiveBg,
              color: activeSubTab === id ? theme.tabActiveText : theme.tabInactiveText,
              border: 'none',
              borderBottom:
                activeSubTab === id ? `3px solid ${theme.primary}` : `1px solid ${theme.border}`,
              cursor: 'pointer',
              flex: 1,
              fontWeight: '500',
            }}
          >
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
      </div>

      {activeSubTab === 'composer' && (
        <div>
          {isLiveJournal && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <input
                type="text"
                value={ljUsername}
                onChange={e => setLjUsername(e.target.value)}
                placeholder="Username"
                style={inputStyle}
              />
              <input
                type="password"
                value={ljPassword}
                onChange={e => setLjPassword(e.target.value)}
                placeholder="Password"
                style={inputStyle}
              />
            </div>
          )}
          {isLiveJournal && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Subject</label>
              <input
                type="text"
                value={ljSubject}
                onChange={e => setLjSubject(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}
          <textarea
            value={localContentValue}
            onChange={e => setLocalContentValue(e.target.value.slice(0, charLimit))}
            placeholder="Write your post..."
            style={{ ...inputStyle, height: '200px', resize: 'vertical', marginBottom: '8px' }}
          />
          <div
            style={{
              textAlign: 'right',
              fontSize: '12px',
              color: charCount > 55000 ? theme.danger : theme.success,
              marginBottom: '16px',
            }}
          >
            {charCount} / {charLimit}
          </div>
          {isLiveJournal && (
            <div
              style={{
                marginBottom: '16px',
                border: `1px dashed ${theme.border}`,
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: theme.panelBg,
              }}
            >
              <label style={labelStyle}>Image & Alt Text</label>
              {!imagePreview ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'block', marginTop: '8px', color: theme.text }}
                />
              ) : (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '100px',
                        borderRadius: '4px',
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={imageAltText}
                        onChange={e => setImageAltText(e.target.value)}
                        placeholder="Enter Alt Text (Description)"
                        style={{ ...inputStyle, marginBottom: '8px' }}
                      />
                      <button onClick={removeImage} style={dangerButton}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {isLiveJournal && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <label style={labelStyle}>Security</label>
                <select
                  value={ljSecurity}
                  onChange={e => setLjSecurity(e.target.value)}
                  style={inputStyle}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tags</label>
                <input
                  type="text"
                  value={ljTags}
                  onChange={e => setLjTags(e.target.value)}
                  placeholder="comma, separated"
                  style={inputStyle}
                />
              </div>
            </div>
          )}
          {isLiveJournal && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Schedule (Optional)</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handlePost}
              disabled={isPosting}
              style={{ ...primaryButton, opacity: isPosting ? 0.6 : 1 }}
            >
              {isPosting ? 'Posting...' : 'Post Now'}
            </button>
            {isLiveJournal && (
              <button
                onClick={handleSchedule}
                disabled={isPosting}
                style={{ ...successButton, opacity: isPosting ? 0.6 : 1 }}
              >
                Schedule
              </button>
            )}
            <div style={{ position: 'relative' }} ref={crossPostDropdownRef}>
              <button
                onClick={() => setShowCrossPostDropdown(!showCrossPostDropdown)}
                style={{ ...buttonBase, backgroundColor: theme.subText, color: '#ffffff' }}
              >
                Also post to ▾
              </button>
              {showCrossPostDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    marginBottom: '4px',
                    backgroundColor: theme.modalBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '4px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    padding: '8px',
                    width: '150px',
                    zIndex: 10,
                  }}
                >
                  {Object.keys(crossPostPlatforms).map(key => (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px',
                        cursor: 'pointer',
                        color: theme.text,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={crossPostPlatforms[key]}
                        onChange={() => handleCrossPostToggle(key)}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{key}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'scheduled' && (
        <div>
          {scheduledPosts.map(post => (
            <div
              key={post._id}
              style={{
                border: `1px solid ${theme.border}`,
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: theme.panelBg,
              }}
            >
              <div>
                <strong style={{ color: theme.text }}>{post.subject}</strong>
                <div style={{ fontSize: '12px', color: theme.subText }}>
                  {formatDate(post.scheduledFor)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openEditModal(post)}
                  style={{ ...primaryButton, padding: '6px 12px', fontSize: '14px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setSelectedPostId(post._id);
                    setShowPostNowModal(true);
                  }}
                  style={{ ...successButton, padding: '6px 12px', fontSize: '14px' }}
                >
                  Post Now
                </button>
                <button
                  onClick={() => {
                    setSelectedPostId(post._id);
                    setShowDeleteModal(true);
                  }}
                  style={dangerButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'history' && (
        <div>
          {postHistory.map(post => (
            <div
              key={post._id}
              style={{
                border: `1px solid ${theme.border}`,
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '8px',
                backgroundColor: theme.panelBg,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <strong style={{ color: theme.text }}>{post.subject}</strong>
                {post.status === 'failed' && (
                  <span
                    style={{
                      backgroundColor: theme.danger,
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    Failed
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: theme.subText }}>
                {formatDate(post.createdAt)}
              </div>
              {post.ljUrl && (
                <a
                  href={post.ljUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '14px', color: theme.primary, textDecoration: 'none' }}
                >
                  View Post
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'details' && (
        <div>
          {isLiveJournal ? (
            <div>
              <div
                style={{
                  backgroundColor: theme.panelBg,
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <h5 style={{ marginTop: 0, color: theme.text }}>Character Limits</h5>
                <ul style={{ margin: 0, paddingLeft: '20px', color: theme.text }}>
                  <li>Subject: 255 characters</li>
                  <li>Content: 60,000 characters</li>
                  <li>Tags: Unlimited (comma-separated)</li>
                </ul>
              </div>
              <div
                style={{
                  backgroundColor: theme.panelBg,
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.border}`,
                }}
              >
                <h5 style={{ marginTop: 0, color: theme.text }}>Security Options</h5>
                <ul style={{ margin: 0, paddingLeft: '20px', color: theme.text }}>
                  <li>
                    <strong>Public:</strong> Visible to everyone
                  </li>
                  <li>
                    <strong>Private:</strong> Only visible to you
                  </li>
                  <li>
                    <strong>Friends Only:</strong> Visible to your friends list
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <p style={{ color: theme.text }}>Platform details here</p>
          )}
        </div>
      )}
    </div>
  );
}
