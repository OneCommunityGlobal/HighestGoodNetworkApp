import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import './TruthSocialAutoPoster.module.css';
import { truthSocialService } from '../../services/truthSocialService';

const TruthSocialAutoPoster = () => {
  const [activeTab, setActiveTab] = useState('compose');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get dark mode from Redux
  const darkMode = useSelector(state => state.theme.darkMode);

  const [formData, setFormData] = useState({
    content: '',
    mediaUrl: '',
    tags: '',
    visibility: 'public',
    sensitive: false,
  });
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [errors, setErrors] = useState({});
  const [suggestedTags, setSuggestedTags] = useState([]);

  // Stop words for tag suggestion
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'should',
    'could',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'it',
    'its',
    'as',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'under',
    'again',
    'further',
    'then',
    'once',
    'here',
    'there',
    'when',
    'where',
    'why',
    'how',
    'all',
    'both',
    'each',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
  ]);

  useEffect(() => {
    loadApiToken();
    loadScheduledPosts();
  }, []);

  const loadApiToken = async () => {
    try {
      const response = await truthSocialService.getApiToken();
      if (response.success && response.hasToken) {
        setApiToken(response.token); // This will be masked
      }
    } catch (error) {
      console.error('Failed to load API token:', error);
    }
  };

  const loadScheduledPosts = async () => {
    try {
      const response = await truthSocialService.getScheduledPosts();
      if (response.success) {
        setScheduledPosts(response.posts || []);
      }
    } catch (error) {
      console.error('Failed to load scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    }
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (name === 'content' && value.length > 10) {
      suggestTags(value);
    }
  };

  const suggestTags = text => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s#]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word) && !word.startsWith('#'));

    const uniqueWords = [...new Set(words)].slice(0, 6);
    setSuggestedTags(uniqueWords);
  };

  const addSuggestedTag = tag => {
    const currentTags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setFormData(prev => ({ ...prev, tags: newTags }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Post content is required';
    }

    if (formData.content.length > 500) {
      newErrors.content = 'Content must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyToClipboard = () => {
    let copyText = `${formData.content}\n\n`;

    if (formData.tags) {
      const hashTags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .map(tag => (tag.startsWith('#') ? tag : `#${tag}`))
        .join(' ');
      copyText += `${hashTags}\n`;
    }

    if (formData.mediaUrl) {
      copyText += `\nMedia: ${formData.mediaUrl}`;
    }

    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      toast.success('Content copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePost = async () => {
    if (!validateForm()) return;

    if (!apiToken) {
      toast.error('Please enter your Truth Social API token in the Settings tab');
      setActiveTab('settings');
      return;
    }

    try {
      setLoading(true);
      const result = await truthSocialService.createPost({
        content: formData.content,
        tags: formData.tags,
        visibility: formData.visibility,
        sensitive: formData.sensitive,
        mediaUrl: formData.mediaUrl,
      });

      if (result.success) {
        toast.success('Post published successfully to Truth Social!');
        // Reset form
        setFormData({
          content: '',
          mediaUrl: '',
          tags: '',
          visibility: 'public',
          sensitive: false,
        });
        setSuggestedTags([]);
      }
    } catch (error) {
      console.error('Post error:', error);

      // Check if it's an API access issue
      if (error.details && error.details.includes('API access')) {
        toast.warning(
          '⚠️ Truth Social API access not available. Use "Copy to Clipboard" or "Schedule Post" instead.',
          {
            autoClose: 5000,
          },
        );
      } else {
        toast.error(error.error || 'Failed to post to Truth Social');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!validateForm()) return;

    if (!scheduleDate || !scheduleTime) {
      toast.error('Please select both date and time for scheduling');
      return;
    }

    try {
      setLoading(true);
      const scheduledFor = `${scheduleDate}T${scheduleTime}`;

      const result = await truthSocialService.schedulePost({
        content: formData.content,
        tags: formData.tags,
        visibility: formData.visibility,
        sensitive: formData.sensitive,
        mediaUrl: formData.mediaUrl,
        scheduledFor,
      });

      if (result.success) {
        toast.success('Post scheduled successfully!');

        // Reset form
        setFormData({
          content: '',
          mediaUrl: '',
          tags: '',
          visibility: 'public',
          sensitive: false,
        });
        setScheduleDate('');
        setScheduleTime('');
        setSuggestedTags([]);

        // Reload scheduled posts
        loadScheduledPosts();
      }
    } catch (error) {
      console.error('Schedule error:', error);
      toast.error(error.error || 'Failed to schedule post');
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduledPost = async id => {
    if (!window.confirm('Are you sure you want to delete this scheduled post?')) {
      return;
    }

    try {
      const result = await truthSocialService.deleteScheduledPost(id);
      if (result.success) {
        toast.success('Scheduled post deleted');
        loadScheduledPosts();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete scheduled post');
    }
  };

  const handleSaveApiToken = async () => {
    if (!apiToken || apiToken.length < 20) {
      toast.error('Please enter a valid API token');
      return;
    }

    try {
      setLoading(true);
      const result = await truthSocialService.updateApiToken(apiToken);

      if (result.success) {
        toast.success('API token saved successfully!');
        loadApiToken(); // Reload to get masked version
      }
    } catch (error) {
      console.error('Save token error:', error);
      toast.error(error.error || 'Failed to save API token');
    } finally {
      setLoading(false);
    }
  };

  const CharacterCount = () => {
    const count = formData.content.length;
    const max = 500;
    const percentage = (count / max) * 100;

    let className = 'char-counter';
    if (percentage > 90) className += ' danger';
    else if (percentage > 75) className += ' warning';

    return (
      <div className={className}>
        {count} / {max}
      </div>
    );
  };

  return (
    <div className={`truth-social-autoposter ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="ts-header">
        <h1>Truth Social AutoPoster</h1>
        <p>Compose, schedule, and post content to Truth Social</p>
      </div>

      {/* Tabs */}
      <div className="ts-tabs-container">
        <div className="ts-tabs-header">
          <button
            onClick={() => setActiveTab('compose')}
            className={`ts-tab-button ${activeTab === 'compose' ? 'active' : ''}`}
          >
            Compose Post
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`ts-tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          >
            Scheduled Posts ({scheduledPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`ts-tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          >
            API Settings
          </button>
        </div>

        <div className="ts-tab-content">
          {/* Compose Tab */}
          {activeTab === 'compose' && (
            <div className="ts-compose-tab">
              <div className="ts-alert ts-alert-info">
                <strong>Truth Social Auto-Poster</strong>
                <p>
                  <strong>Note:</strong> Truth Social does not currently provide public API access.
                  You can use &quot;Schedule Post&quot; to plan your content and &ldquo;Copy to
                  manual posting. The &ldquo;Post Now&ldquo; feature will be ready when API access
                  available.
                </p>
              </div>

              <div className="ts-form-group">
                <label htmlFor="ts-content" className="ts-label">
                  Post Content *
                </label>
                <textarea
                  id="ts-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="What's happening?"
                  rows="6"
                  className={`ts-textarea ${errors.content ? 'error' : ''}`}
                />
                {errors.content && <div className="ts-error">{errors.content}</div>}
                <CharacterCount />
              </div>

              {suggestedTags.length > 0 && (
                <div className="ts-form-group">
                  <span className="ts-label">Suggested Tags</span>
                  <div className="ts-tag-suggestions">
                    {suggestedTags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => addSuggestedTag(tag)}
                        className="ts-tag-suggestion"
                        type="button"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="ts-form-group">
                <label htmlFor="ts-tags" className="ts-label">
                  Tags (comma-separated)
                </label>
                <input
                  id="ts-tags"
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="politics, news, breaking"
                  className="ts-input"
                />
                <small>Tags will be automatically converted to hashtags</small>
              </div>

              <div className="ts-form-group">
                <label htmlFor="ts-media" className="ts-label">
                  Media URL (optional)
                </label>
                <input
                  id="ts-media"
                  type="url"
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="ts-input"
                />
              </div>

              <div className="ts-form-group">
                <label htmlFor="ts-visibility" className="ts-label">
                  Visibility
                </label>
                <select
                  id="ts-visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="ts-select"
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Followers Only</option>
                </select>
              </div>

              <div className="ts-form-group">
                <label htmlFor="ts-sensitive" className="ts-checkbox-label">
                  <input
                    id="ts-sensitive"
                    type="checkbox"
                    name="sensitive"
                    checked={formData.sensitive}
                    onChange={handleInputChange}
                  />
                  <span>Mark as sensitive content</span>
                </label>
              </div>

              <div className="ts-schedule-section">
                <h3>Schedule Post (Optional)</h3>
                <div className="ts-schedule-inputs">
                  <div className="ts-form-group">
                    <label htmlFor="ts-schedule-date" className="ts-label">
                      Date
                    </label>
                    <input
                      id="ts-schedule-date"
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="ts-input"
                    />
                  </div>
                  <div className="ts-form-group">
                    <label htmlFor="ts-schedule-time" className="ts-label">
                      Time
                    </label>
                    <input
                      id="ts-schedule-time"
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="ts-input"
                    />
                  </div>
                </div>
              </div>

              <div className="ts-actions">
                <button onClick={handlePost} disabled={loading} className="ts-button-primary">
                  {loading ? 'Posting...' : 'Post Now'}
                </button>
                <button
                  onClick={handleSchedulePost}
                  disabled={loading}
                  className="ts-button-secondary"
                >
                  {loading ? 'Scheduling...' : 'Schedule Post'}
                </button>
                <button onClick={handleCopyToClipboard} className="ts-button-copy" type="button">
                  {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </div>
          )}

          {/* Scheduled Posts Tab */}
          {activeTab === 'schedule' && (
            <div className="ts-scheduled-tab">
              <h2>Scheduled Posts</h2>
              {scheduledPosts.length === 0 ? (
                <div className="ts-empty-state">
                  <p>No scheduled posts yet</p>
                  <small>Schedule posts from the Compose tab</small>
                </div>
              ) : (
                <div className="ts-scheduled-list">
                  {scheduledPosts.map(post => (
                    <div key={post._id} className="ts-scheduled-post">
                      <div className="ts-scheduled-post-header">
                        <span className="ts-scheduled-date">
                          📅 {new Date(post.scheduledFor).toLocaleString()}
                        </span>
                        <span className={`ts-status ts-status-${post.status}`}>{post.status}</span>
                        <button
                          onClick={() => deleteScheduledPost(post._id)}
                          className="ts-button-delete"
                          aria-label="Delete scheduled post"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="ts-scheduled-post-content">{post.content}</div>
                      {post.tags && (
                        <div className="ts-scheduled-post-tags">
                          {post.tags.split(',').map((tag, idx) => (
                            <span key={idx} className="ts-tag">
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* API Settings Tab */}
          {activeTab === 'settings' && (
            <div className="ts-settings-tab">
              <h2>API Configuration</h2>
              <p>Configure your Truth Social API credentials</p>

              <div className="ts-alert ts-alert-warning">
                <strong>API Access Note</strong>
                <p>
                  Truth Social does not currently provide public API access. You can still use this
                  tool for composing and scheduling posts, then use &quot;Copy to Clipboard&quot; to
                  post manually.
                </p>
              </div>

              <div className="ts-form-group">
                <label htmlFor="ts-api-token" className="ts-label">
                  API Token *
                </label>
                <input
                  id="ts-api-token"
                  type="password"
                  value={apiToken}
                  onChange={e => setApiToken(e.target.value)}
                  placeholder="Enter your Truth Social API token"
                  className="ts-input"
                />
                <small>Your token is stored securely and never shared</small>
              </div>

              <button onClick={handleSaveApiToken} disabled={loading} className="ts-button-primary">
                {loading ? 'Saving...' : 'Save API Token'}
              </button>

              <div className="ts-api-info">
                <h3>API Information</h3>
                <div className="ts-info-item">
                  <strong>Base URL:</strong> https://truthsocial.com/api/v1
                </div>
                <div className="ts-info-item">
                  <strong>Post Endpoint:</strong> /statuses
                </div>
                <div className="ts-info-item">
                  <strong>Authentication:</strong> Bearer Token
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruthSocialAutoPoster;
