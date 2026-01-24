// import React, { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-toastify';
// import {
//   postToTruthSocial,
//   schedulePost,
//   getScheduledPosts,
//   deleteScheduledPost,
//   updateScheduledPost,
//   postScheduledNow,
//   getPostHistory,
//   saveToken,
//   getCredentials,
//   logout,
// } from '../../services/truthSocialService';
// import styles from './TruthSocialAutoPoster.module.css';

// const TruthSocialAutoPoster = ({ darkMode }) => {
//   const [activeTab, setActiveTab] = useState('compose');
//   const [accessToken, setAccessToken] = useState('');
//   const [showToken, setShowToken] = useState(false);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [content, setContent] = useState('');
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState('');
//   const [altText, setAltText] = useState('');
//   const [isPosting, setIsPosting] = useState(false);
//   const [crossPostPlatforms, setCrossPostPlatforms] = useState([]);
//   const [showCrossPostDropdown, setShowCrossPostDropdown] = useState(false);
//   const [scheduleDate, setScheduleDate] = useState('');
//   const [scheduleTime, setScheduleTime] = useState('');
//   const [scheduledPosts, setScheduledPosts] = useState([]);
//   const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
//   const [editingPost, setEditingPost] = useState(null);
//   const [postHistory, setPostHistory] = useState([]);
//   const [isLoadingHistory, setIsLoadingHistory] = useState(false);

//   const CHAR_LIMIT = 500;
//   const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;
//   const crossPostOptions = [
//     { id: 'instagram', label: 'Instagram' },
//     { id: 'x', label: 'X' },
//     { id: 'facebook', label: 'Facebook' },
//     { id: 'twitter', label: 'Twitter' },
//   ];

//   useEffect(() => {
//     const creds = getCredentials();
//     if (creds && creds.hasToken) {
//       setIsLoggedIn(true);
//     }
//   }, []);

//   const loadScheduledPosts = useCallback(async () => {
//     setIsLoadingScheduled(true);
//     try {
//       const posts = await getScheduledPosts();
//       setScheduledPosts(Array.isArray(posts) ? posts : []);
//     } catch (err) {
//       toast.error('Failed to load scheduled posts');
//     } finally {
//       setIsLoadingScheduled(false);
//     }
//   }, []);

//   const loadPostHistory = useCallback(async () => {
//     setIsLoadingHistory(true);
//     try {
//       const history = await getPostHistory();
//       setPostHistory(Array.isArray(history) ? history : []);
//     } catch (err) {
//       toast.error('Failed to load history');
//     } finally {
//       setIsLoadingHistory(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (activeTab === 'scheduled') loadScheduledPosts();
//     else if (activeTab === 'history') loadPostHistory();
//   }, [activeTab, loadScheduledPosts, loadPostHistory]);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (showCrossPostDropdown && !e.target.closest(`.${styles.crossPostContainer}`)) {
//         setShowCrossPostDropdown(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [showCrossPostDropdown]);

//   const handleSaveToken = () => {
//     if (!accessToken.trim()) return toast.error('Please enter a token');
//     saveToken(accessToken.trim());
//     setIsLoggedIn(true);
//     toast.success('Token saved!');
//   };

//   const handleLogout = () => {
//     logout();
//     setIsLoggedIn(false);
//     setAccessToken('');
//     toast.success('Token removed');
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (file.size > IMAGE_SIZE_LIMIT) return toast.error('Image must be < 5MB');
//     const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//     if (!validTypes.includes(file.type)) return toast.error('Invalid format');
//     setImage(file);
//     const reader = new FileReader();
//     reader.onloadend = () => setImagePreview(reader.result);
//     reader.readAsDataURL(file);
//   };

//   const removeImage = () => { setImage(null); setImagePreview(''); setAltText(''); };

//   const resetForm = () => {
//     setContent(''); setImage(null); setImagePreview(''); setAltText('');
//     setScheduleDate(''); setScheduleTime(''); setEditingPost(null); setCrossPostPlatforms([]);
//   };

//   const handleCrossPostChange = (id) => {
//     setCrossPostPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
//   };

//   const handlePostNow = async () => {
//     if (!content.trim()) return toast.error('Content cannot be empty');
//     if (content.length > CHAR_LIMIT) return toast.error(`Exceeds ${CHAR_LIMIT} characters`);
//     if (!isLoggedIn) { toast.error('Add token in Settings first'); return setActiveTab('settings'); }

//     setIsPosting(true);
//     try {
//       let imageData = null;
//       if (image) {
//         imageData = await new Promise(resolve => {
//           const reader = new FileReader();
//           reader.onloadend = () => resolve(reader.result);
//           reader.readAsDataURL(image);
//         });
//       }
//       await postToTruthSocial({ content: content.trim(), image: imageData, altText: altText.trim() });
//       toast.success('Posted to Truth Social!');
//       if (crossPostPlatforms.length > 0) toast.info(`Cross-posting: ${crossPostPlatforms.join(', ')} (coming soon)`);
//       resetForm();
//     } catch (err) {
//       toast.error(err.message || 'Failed to post');
//     } finally {
//       setIsPosting(false);
//     }
//   };

//   const handleSchedulePost = async () => {
//     if (!content.trim()) return toast.error('Content cannot be empty');
//     if (content.length > CHAR_LIMIT) return toast.error(`Exceeds ${CHAR_LIMIT} characters`);
//     if (!scheduleDate) return toast.error('Select a date');

//     const time = scheduleTime || new Date().toTimeString().slice(0, 5);
//     const scheduledDateTime = new Date(`${scheduleDate}T${time}`);
//     if (scheduledDateTime <= new Date()) return toast.error('Time must be in the future');

//     setIsPosting(true);
//     try {
//       let imageData = null;
//       if (image) {
//         imageData = await new Promise(resolve => {
//           const reader = new FileReader();
//           reader.onloadend = () => resolve(reader.result);
//           reader.readAsDataURL(image);
//         });
//       }
//       if (editingPost) {
//         await updateScheduledPost(editingPost._id, {
//           content: content.trim(), image: imageData, altText: altText.trim(),
//           scheduledTime: scheduledDateTime.toISOString(),
//         });
//         toast.success('Updated!');
//       } else {
//         await schedulePost({
//           content: content.trim(), image: imageData, altText: altText.trim(),
//           scheduledTime: scheduledDateTime.toISOString(),
//         });
//         toast.success('Scheduled!');
//       }
//       resetForm();
//       loadScheduledPosts();
//     } catch (err) {
//       toast.error(err.message || 'Failed to schedule');
//     } finally {
//       setIsPosting(false);
//     }
//   };

//   const handleDeleteScheduled = async (id) => {
//     if (!window.confirm('Delete?')) return;
//     try { await deleteScheduledPost(id); toast.success('Deleted'); loadScheduledPosts(); }
//     catch (err) { toast.error('Failed'); }
//   };

//   const handlePostScheduledNow = async (id) => {
//     if (!window.confirm('Post now?')) return;
//     if (!isLoggedIn) { toast.error('Add token first'); return setActiveTab('settings'); }
//     try { await postScheduledNow(id); toast.success('Posted!'); loadScheduledPosts(); }
//     catch (err) { toast.error(err.message || 'Failed'); }
//   };

//   const handleEditScheduled = (post) => {
//     setContent(post.content);
//     if (post.image) setImagePreview(post.image);
//     setAltText(post.altText || '');
//     const d = new Date(post.scheduledTime);
//     setScheduleDate(d.toISOString().split('T')[0]);
//     setScheduleTime(d.toTimeString().slice(0, 5));
//     setEditingPost(post);
//     setActiveTab('compose');
//   };

//   const getCharCountColor = () => {
//     const pct = (content.length / CHAR_LIMIT) * 100;
//     if (pct >= 100) return styles.charCountOver;
//     if (pct >= 90) return styles.charCountWarning;
//     return styles.charCountNormal;
//   };

//   const getMinDate = () => new Date().toISOString().split('T')[0];
//   const formatDate = (d) => new Date(d).toLocaleString();

//   return (
//     <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
//       <div className={styles.header}>
//         <h2 className={styles.title}>Truth Social Auto-Poster</h2>
//         <p className={styles.subtitle}>Compose, schedule, and post to Truth Social</p>
//       </div>

//       <div className={styles.tabContainer}>
//         {['compose', 'scheduled', 'history', 'settings'].map(tab => (
//           <button key={tab} type="button" className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`} onClick={() => setActiveTab(tab)}>
//             {tab === 'compose' && '📝 Make Post'}
//             {tab === 'scheduled' && '⏰ Scheduled'}
//             {tab === 'history' && '📜 History'}
//             {tab === 'settings' && '⚙️ Settings'}
//           </button>
//         ))}
//       </div>

//       <div className={styles.tabContent}>
//         {activeTab === 'compose' && (
//           <div className={styles.composeSection}>
//             {!isLoggedIn && (
//               <div className={styles.warningBanner}>
//                 <span>⚠️ Add your access token in Settings to post.</span>
//                 <button type="button" onClick={() => setActiveTab('settings')} className={styles.goToSettingsBtn}>Go to Settings</button>
//               </div>
//             )}
//             {isLoggedIn && <div className={styles.loggedInBanner}>✅ Token configured - Ready to post!</div>}
//             {editingPost && (
//               <div className={styles.editingBanner}>
//                 <span>✏️ Editing scheduled post</span>
//                 <button type="button" onClick={resetForm} className={styles.cancelEditBtn}>Cancel</button>
//               </div>
//             )}

//             <textarea className={styles.textarea} placeholder="What's happening? (500 chars max)" value={content} onChange={e => setContent(e.target.value)} maxLength={CHAR_LIMIT + 50} rows={6} />
//             <div className={`${styles.charCount} ${getCharCountColor()}`}>{content.length} / {CHAR_LIMIT}</div>

//             <div className={styles.fieldGroup}>
//               <label className={styles.fieldLabel}>Image (optional)</label>
//               {!imagePreview ? (
//                 <div className={styles.imageUploadWrapper}>
//                   <label className={styles.imageUploadLabel}>
//                     <input type="file" accept="image/*" onChange={handleImageChange} className={styles.imageInput} />
//                     <span>📷 Choose Image</span>
//                   </label>
//                   <span className={styles.imageSizeHint}>Max 5MB</span>
//                 </div>
//               ) : (
//                 <div className={styles.imagePreviewContainer}>
//                   <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
//                   <button type="button" onClick={removeImage} className={styles.removeImageBtn}>✕</button>
//                   <input type="text" placeholder="Alt text..." value={altText} onChange={e => setAltText(e.target.value)} className={styles.altTextInput} />
//                 </div>
//               )}
//             </div>

//             <div className={styles.fieldGroup}>
//               <label className={styles.fieldLabel}>Schedule (optional)</label>
//               <div className={styles.scheduleRow}>
//                 <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} min={getMinDate()} className={styles.dateInput} />
//                 <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className={styles.timeInput} />
//               </div>
//             </div>

//             <div className={styles.actionButtonsRow}>
//               <button type="button" onClick={handlePostNow} disabled={isPosting || !content.trim()} className={styles.postNowBtn}>
//                 {isPosting ? 'Posting...' : 'Post to Truth Social'}
//               </button>
//               <button type="button" onClick={handleSchedulePost} disabled={isPosting || !content.trim() || !scheduleDate} className={styles.scheduleBtn}>
//                 {editingPost ? 'Update' : 'Schedule'}
//               </button>
//               <div className={styles.crossPostContainer}>
//                 <button type="button" onClick={() => setShowCrossPostDropdown(!showCrossPostDropdown)} className={styles.alsoPostToBtn}>Also post to ▼</button>
//                 {showCrossPostDropdown && (
//                   <div className={styles.crossPostDropdown}>
//                     {crossPostOptions.map(opt => (
//                       <label key={opt.id} className={styles.crossPostOption}>
//                         <input type="checkbox" checked={crossPostPlatforms.includes(opt.id)} onChange={() => handleCrossPostChange(opt.id)} />
//                         <span>{opt.label}</span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'scheduled' && (
//           <div className={styles.scheduledSection}>
//             {isLoadingScheduled ? <div className={styles.loading}>Loading...</div> : scheduledPosts.length === 0 ? (
//               <div className={styles.emptyState}><span className={styles.emptyIcon}>📭</span><p>No scheduled posts</p></div>
//             ) : (
//               <div className={styles.scheduledList}>
//                 {scheduledPosts.map(post => (
//                   <div key={post._id} className={styles.scheduledItem}>
//                     <div className={styles.scheduledContent}>
//                       <p className={styles.scheduledText}>{post.content}</p>
//                       {post.image && <img src={post.image} alt="" className={styles.scheduledImage} />}
//                       <p className={styles.scheduledTime}>📅 {formatDate(post.scheduledTime)}</p>
//                     </div>
//                     <div className={styles.scheduledActions}>
//                       <button type="button" onClick={() => handlePostScheduledNow(post._id)} className={styles.postNowSmallBtn}>✅</button>
//                       <button type="button" onClick={() => handleEditScheduled(post)} className={styles.editBtn}>✏️</button>
//                       <button type="button" onClick={() => handleDeleteScheduled(post._id)} className={styles.deleteBtn}>❌</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//             <button type="button" onClick={loadScheduledPosts} className={styles.refreshBtn}>🔄 Refresh</button>
//           </div>
//         )}

//         {activeTab === 'history' && (
//           <div className={styles.historySection}>
//             {isLoadingHistory ? <div className={styles.loading}>Loading...</div> : postHistory.length === 0 ? (
//               <div className={styles.emptyState}><span className={styles.emptyIcon}>📜</span><p>No post history</p></div>
//             ) : (
//               <div className={styles.historyList}>
//                 {postHistory.map(post => (
//                   <div key={post._id || post.id} className={styles.historyItem}>
//                     <p className={styles.historyText}>{post.content}</p>
//                     {post.image && <img src={post.image} alt="" className={styles.historyImage} />}
//                     <p className={styles.historyTime}>📝 {formatDate(post.postedAt)}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//             <button type="button" onClick={loadPostHistory} className={styles.refreshBtn}>🔄 Refresh</button>
//           </div>
//         )}

//         {activeTab === 'settings' && (
//           <div className={styles.settingsSection}>
//             <h3 className={styles.settingsTitle}>Truth Social Access Token</h3>
//             {isLoggedIn ? (
//               <div className={styles.loggedInSection}>
//                 <div className={styles.loggedInCard}><span className={styles.loggedInStatus}>✅ Token configured and ready!</span></div>
//                 <button type="button" onClick={handleLogout} className={styles.logoutBtn}>🗑️ Remove Token</button>
//               </div>
//             ) : (
//               <>
//                 <div className={styles.instructionsBox}>
//                   <h4>📋 How to get your Access Token:</h4>
//                   <ol>
//                     <li>Open <a href="https://truthsocial.com" target="_blank" rel="noopener noreferrer">truthsocial.com</a> and log in</li>
//                     <li>Press <strong>F12</strong> to open Developer Tools</li>
//                     <li>Go to <strong>Application</strong> tab → <strong>Local Storage</strong> → <strong>https://truthsocial.com</strong></li>
//                     <li>Click on <strong>truth:auth</strong></li>
//                     <li>Find <code>access_token</code> and copy the value</li>
//                     <li>Paste it below and click Save</li>
//                   </ol>
//                 </div>
//                 <div className={styles.tokenForm}>
//                   <label className={styles.fieldLabel}>Access Token</label>
//                   <div className={styles.tokenInputWrapper}>
//                     <input type={showToken ? 'text' : 'password'} value={accessToken} onChange={e => setAccessToken(e.target.value)} placeholder="Paste your access token here" className={styles.textInput} />
//                     <button type="button" onClick={() => setShowToken(!showToken)} className={styles.toggleTokenBtn}>{showToken ? '🙈' : '👁️'}</button>
//                   </div>
//                   <button type="button" onClick={handleSaveToken} disabled={!accessToken.trim()} className={styles.saveTokenBtn}>💾 Save Token</button>
//                 </div>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TruthSocialAutoPoster;
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import styles from './TruthSocialAutoPoster.module.css';

// API Base for backend
const API_BASE = process.env.REACT_APP_APIENDPOINT || 'http://localhost:4500/api';

// LocalStorage key for token
const TOKEN_KEY = 'truthSocialAccessToken';

// Custom Confirmation Modal Component
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', confirmStyle = 'primary' }) => {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    switch (confirmStyle) {
      case 'danger':
        return styles.confirmBtnDanger;
      case 'success':
        return styles.confirmBtnSuccess;
      default:
        return styles.confirmBtnPrimary;
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onCancel}
      onKeyDown={e => e.key === 'Escape' && onCancel()}
      role="button"
      tabIndex={0}
    >
      <div
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className={styles.modalTitle}>{title}</h3>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancelBtn} onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className={`${styles.modalConfirmBtn} ${getConfirmButtonClass()}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
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

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={`${styles.editModalContent} ${darkMode ? styles.darkMode : ''}`} onClick={e => e.stopPropagation()}>
        <h3 className={styles.editModalTitle}>Edit Scheduled Post</h3>

        <div className={styles.editFieldGroup}>
          <label className={styles.editFieldLabel}>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className={styles.editInput}
            maxLength={255}
          />
        </div>

        <div className={styles.editFieldGroup}>
          <label className={styles.editFieldLabel}>Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className={styles.editTextarea}
            rows={5}
          />
        </div>

        <div className={styles.editRow}>
          <div className={styles.editFieldGroup}>
            <label className={styles.editFieldLabel}>Security</label>
            <select
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
            <label className={styles.editFieldLabel}>Tags</label>
            <input
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
    </div>
  );
};

const TruthSocialAutoPoster = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [darkMode, setDarkMode] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
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
  const showConfirmation = (title, message, onConfirm, confirmText = 'Confirm', confirmStyle = 'primary') => {
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
      const isDark = document.body.classList.contains('dark-mode') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDark);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
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
      console.error('Failed to save to history:', err);
    }
  };

  // Load scheduled posts
  const loadScheduledPosts = useCallback(async () => {
    setIsLoadingScheduled(true);
    try {
      const response = await axios.get(`${API_BASE}/truthsocial/schedule`);
      setScheduledPosts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
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
      console.error('Error loading post history:', error);
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
      const hashtags = tagStr.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
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
          console.error('Post error:', err);
          toast.error(err.response?.data?.error || err.message || 'Failed to post');
        } finally {
          setIsPosting(false);
        }
      },
      'Post Now',
      'success'
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
      toast.error(err.response?.data?.error || 'Failed to schedule');
    } finally {
      setIsPosting(false);
    }
  };

  // Delete scheduled
  const handleDeleteScheduled = (id) => {
    showConfirmation(
      'Delete Scheduled Post',
      'Are you sure you want to delete this post?',
      async () => {
        try {
          await axios.delete(`${API_BASE}/truthsocial/schedule/${id}`);
          toast.success('Deleted');
          loadScheduledPosts();
        } catch (err) {
          toast.error('Failed to delete');
        }
      },
      'Delete',
      'danger'
    );
  };

  // Post scheduled now
  const handlePostScheduledNow = (post) => {
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
          toast.error(err.response?.data?.error || 'Failed to post');
        } finally {
          setIsPosting(false);
        }
      },
      'Post Now',
      'success'
    );
  };

  // Edit scheduled
  const handleEditScheduled = (post) => {
    setEditModal({ isOpen: true, post });
  };

  const handleSaveEdit = async (updatedPost) => {
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
      toast.error('Failed to update');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  };

  // Toggle cross-post
  const toggleCrossPost = (id) => {
    setCrossPostPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
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
              <label className={styles.fieldLabel}>Subject ({subject.length}/{SUBJECT_LIMIT})</label>
              <input
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
              <textarea
                className={styles.contentInput}
                placeholder="What's happening?"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
              />
              <div className={styles.charCount}>{content.length} / {CONTENT_LIMIT}</div>
            </div>

            {/* Security & Tags Row */}
            <div className={styles.rowGroup}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Security</label>
                <select value={visibility} onChange={e => setVisibility(e.target.value)} className={styles.selectInput}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Tags</label>
                <input
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
              <label className={styles.fieldLabel}>Schedule (optional)</label>
              <div className={styles.scheduleRow}>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={getMinDate()}
                  className={styles.dateInput}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className={styles.timeInput}
                />
              </div>
              <p className={styles.scheduleNote}>
                ⚠️ <strong>Limitations:</strong><br />
                • Auto-posting is not supported - scheduled posts must be manually posted from the Scheduled tab.<br />
                • Image uploads are not supported due to Truth Social API restrictions.
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
                      <label key={opt.id} className={styles.crossPostOption}>
                        <input
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
              ⚠️ Auto-posting is not available due to Truth Social API restrictions.
              Please click "Post Now" to manually post when ready.
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
                      {post.visibility && <span className={styles.visibilityBadge}>{post.visibility}</span>}
                    </div>
                    <div className={styles.postActions}>
                      <button type="button" onClick={() => handlePostScheduledNow(post)} className={styles.postNowSmallBtn} disabled={isPosting}>
                        Post Now
                      </button>
                      <button type="button" onClick={() => handleEditScheduled(post)} className={styles.editBtn}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteScheduled(post._id)} className={styles.deleteBtn}>
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
                    <div className={styles.tokenInputWrapper}>
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={accessToken}
                        onChange={e => setAccessToken(e.target.value)}
                        className={styles.textInput}
                        placeholder="Paste token here"
                      />
                      <button type="button" onClick={() => setShowToken(!showToken)} className={styles.toggleTokenBtn}>
                        {showToken ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <button type="button" onClick={handleSaveToken} disabled={!accessToken.trim()} className={styles.saveBtn}>
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
