import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Loader, X } from 'lucide-react';

import {
  TITLE_MIN,
  TITLE_MAX,
  DESCRIPTION_MAX,
  TAGS_MAX,
  MAX_IMAGES,
  formatLocalDate,
  formatLocalTime,
  formatDisplayDateTime,
  clampScheduleDateTime,
  getMinScheduleDate,
  getMinScheduleTime,
  validateTitle,
  validateDescription,
  validateTags,
  validateImageFile,
  postToImgur,
  fetchScheduledPosts,
  deleteScheduledPost,
  buttonStyle,
  fieldContainerStyle,
  fieldLabelStyle,
  fieldInputStyle,
  cardStyle,
  IMGUR_TOPICS,
} from './Imgurhelpers';

// ─── Styles (inline for simplicity) ──────────────────────────────────────────

const tabsStyle = darkMode => ({
  display: 'flex',
  gap: '0.5rem',
  borderBottom: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
  marginBottom: '1.5rem',
});

const tabButtonStyle = (isActive, darkMode) => ({
  padding: '0.75rem 1rem',
  border: 'none',
  background: 'transparent',
  borderBottom: `3px solid ${isActive ? '#3b82f6' : 'transparent'}`,
  color: isActive ? (darkMode ? '#60a5fa' : '#2563eb') : darkMode ? '#9ca3af' : '#6b7280',
  cursor: 'pointer',
  fontWeight: isActive ? '600' : '500',
  fontSize: '0.875rem',
  transition: 'all 0.2s ease',
});

const formContainerStyle = darkMode => ({
  padding: '1.5rem',
  borderRadius: '0.5rem',
  backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
});

const previewContainerStyle = darkMode => ({
  marginTop: '1rem',
  padding: '1rem',
  borderRadius: '0.375rem',
  backgroundColor: darkMode ? '#111827' : '#f3f4f6',
  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
});

const imagePreviewStyle = {
  maxWidth: '100%',
  maxHeight: '300px',
  borderRadius: '0.375rem',
  objectFit: 'cover',
};

const scheduledPostsContainerStyle = darkMode => ({
  marginTop: '2rem',
  padding: '1.5rem',
  borderRadius: '0.5rem',
  backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
});

const scheduledPostItemStyle = darkMode => ({
  padding: '1rem',
  marginBottom: '1rem',
  borderRadius: '0.375rem',
  backgroundColor: darkMode ? '#111827' : '#fff',
  border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
});

// ─── ScheduleField Component ─────────────────────────────────────────────────

function ScheduleField({ id, type, label, value, min, onChange, attemptedSave, errorText }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const isInvalid = attemptedSave && !value;

  return (
    <div style={fieldContainerStyle(darkMode)}>
      <label htmlFor={id} style={fieldLabelStyle(darkMode)}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        onChange={onChange}
        style={fieldInputStyle(darkMode, isInvalid)}
        aria-invalid={isInvalid}
      />
      {isInvalid && <p style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errorText}</p>}
    </div>
  );
}

ScheduleField.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  min: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  attemptedSave: PropTypes.bool.isRequired,
  errorText: PropTypes.string.isRequired,
};

// ─── ImgurAutoPoster Component ───────────────────────────────────────────────

function ImgurAutoPoster({ platform }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  // ─── State: Form Inputs ──────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('General');
  const [tags, setTags] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ─── State: Tabs & Scheduling ───────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('immediate');
  const [scheduledDate, setScheduledDate] = useState(() => formatLocalDate(new Date()));
  const [scheduledTime, setScheduledTime] = useState(() => formatLocalTime(new Date()));
  const [scheduleAttemptedSave, setScheduleAttemptedSave] = useState(false);

  // ─── State: Scheduled Posts & Loading ────────────────────────────────────
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Tabs Configuration ──────────────────────────────────────────────────
  const tabs = useMemo(
    () => [
      { id: 'immediate', label: '📤 Post Now' },
      { id: 'schedule', label: '⏰ Schedule Post' },
    ],
    [],
  );

  // ─── Derived State: Validation ───────────────────────────────────────────
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const trimmedTags = tags.trim();

  const titleValidation = validateTitle(trimmedTitle);
  const descriptionValidation = validateDescription(trimmedDescription);
  const tagsValidation = validateTags(trimmedTags);
  const imageValidation = selectedImage ? validateImageFile(selectedImage) : { isValid: false };

  const isFormValid =
    titleValidation.isValid &&
    descriptionValidation.isValid &&
    tagsValidation.isValid &&
    imageValidation.isValid;

  // ─── Effects ────────────────────────────────────────────────────────────

  /**
   * Load scheduled posts on component mount
   */
  useEffect(() => {
    loadScheduledPosts();
  }, []);

  /**
   * Update image preview when image file changes
   */
  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

  // ─── Event Handlers: Form ────────────────────────────────────────────────

  /**
   * Handle image file selection
   */
  const handleImageChange = event => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validation = validateImageFile(file);
      if (validation.isValid) {
        setSelectedImage(file);
      } else {
        toast.error(validation.error);
        setSelectedImage(null);
      }
    }
  };

  /**
   * Clear selected image
   */
  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  /**
   * Reset form to initial state
   */
  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setTopic('General');
    setTags('');
    handleClearImage();
    setScheduledDate(formatLocalDate(new Date()));
    setScheduledTime(formatLocalTime(new Date()));
    setScheduleAttemptedSave(false);
  };

  /**
   * Submit immediate post
   */
  const handleSubmitImmediate = async e => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error('Please fix all validation errors');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await postToImgur({
        title: trimmedTitle,
        description: trimmedDescription,
        topic,
        tags: trimmedTags,
        image: selectedImage,
      });

      if (result.success) {
        toast.success(result.message);
        handleResetForm();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting post:', error);
      toast.error('Failed to submit post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Submit scheduled post
   */
  const handleSubmitScheduled = async e => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error('Please fix all validation errors');
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setScheduleAttemptedSave(true);
      toast.error('Please set schedule date and time');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await postToImgur({
        title: trimmedTitle,
        description: trimmedDescription,
        topic,
        tags: trimmedTags,
        image: selectedImage,
        scheduledDate,
        scheduledTime,
      });

      if (result.success) {
        toast.success(result.message);
        handleResetForm();
        await loadScheduledPosts();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error submitting scheduled post:', error);
      toast.error('Failed to schedule post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Event Handlers: Scheduled Posts ─────────────────────────────────────

  /**
   * Load scheduled posts from API
   */
  const loadScheduledPosts = async () => {
    setIsLoading(true);

    try {
      const result = await fetchScheduledPosts();

      if (result.success) {
        setScheduledPosts(result.data);
      } else {
        toast.error(result.error);
        setScheduledPosts([]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
      setScheduledPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete a scheduled post
   */
  const handleDeletePost = async postId => {
    if (!window.confirm('Are you sure you want to delete this scheduled post?')) {
      return;
    }

    try {
      const result = await deleteScheduledPost(postId);

      if (result.success) {
        toast.success(result.message);
        await loadScheduledPosts();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div style={cardStyle(darkMode)}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: '600' }}>
          🖼️ Imgur Auto-Poster
        </h3>
        <p style={{ fontSize: '0.875rem', color: darkMode ? '#9ca3af' : '#6b7280' }}>
          Upload and share images on Imgur. Post immediately or schedule for later.
        </p>
      </div>

      {/* Tabs */}
      <div style={tabsStyle(darkMode)}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={tabButtonStyle(activeTab === tab.id, darkMode)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div style={formContainerStyle(darkMode)}>
        {activeTab === 'immediate' && (
          <form onSubmit={handleSubmitImmediate}>
            {/* Title Field */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="title-immediate" style={fieldLabelStyle(darkMode)}>
                Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="title-immediate"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter image title"
                style={fieldInputStyle(darkMode, !titleValidation.isValid)}
                maxLength={TITLE_MAX}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginTop: '0.25rem',
                }}
              >
                {trimmedTitle.length} / {TITLE_MAX}
              </div>
              {!titleValidation.isValid && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {titleValidation.error}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="description-immediate" style={fieldLabelStyle(darkMode)}>
                Description (Optional)
              </label>
              <textarea
                id="description-immediate"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter image description"
                style={{
                  ...fieldInputStyle(darkMode, !descriptionValidation.isValid),
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                maxLength={DESCRIPTION_MAX}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginTop: '0.25rem',
                }}
              >
                {trimmedDescription.length} / {DESCRIPTION_MAX}
              </div>
              {!descriptionValidation.isValid && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {descriptionValidation.error}
                </p>
              )}
            </div>

            {/* Topic Field */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="topic-immediate" style={fieldLabelStyle(darkMode)}>
                Topic (Optional)
              </label>
              <select
                id="topic-immediate"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                style={fieldInputStyle(darkMode)}
              >
                {IMGUR_TOPICS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Field */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="tags-immediate" style={fieldLabelStyle(darkMode)}>
                Tags (Optional)
              </label>
              <input
                id="tags-immediate"
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Comma-separated tags"
                style={fieldInputStyle(darkMode, !tagsValidation.isValid)}
                maxLength={TAGS_MAX}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginTop: '0.25rem',
                }}
              >
                {trimmedTags.length} / {TAGS_MAX}
              </div>
              {!tagsValidation.isValid && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {tagsValidation.error}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="image-immediate" style={fieldLabelStyle(darkMode)}>
                Image <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="image-immediate"
                accept="image/*"
                onChange={handleImageChange}
                style={fieldInputStyle(darkMode, !imageValidation.isValid)}
              />
              {!imageValidation.isValid && selectedImage && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {imageValidation.error}
                </p>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div style={previewContainerStyle(darkMode)}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Preview</span>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <img src={imagePreview} alt="Preview" style={imagePreviewStyle} />
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                style={{
                  ...buttonStyle('primary', darkMode),
                  opacity: !isFormValid || isSubmitting ? 0.5 : 1,
                  cursor: !isFormValid || isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {isSubmitting && <Loader size={16} />}
                Post Now
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSubmitting}
                style={buttonStyle('ghost', darkMode)}
              >
                Clear
              </button>
            </div>
          </form>
        )}

        {activeTab === 'schedule' && (
          <form onSubmit={handleSubmitScheduled}>
            {/* Title Field */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="title-schedule" style={fieldLabelStyle(darkMode)}>
                Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="title-schedule"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter image title"
                style={fieldInputStyle(darkMode, !titleValidation.isValid)}
                maxLength={TITLE_MAX}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginTop: '0.25rem',
                }}
              >
                {trimmedTitle.length} / {TITLE_MAX}
              </div>
              {!titleValidation.isValid && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {titleValidation.error}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="description-schedule" style={fieldLabelStyle(darkMode)}>
                Description (Optional)
              </label>
              <textarea
                id="description-schedule"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter image description"
                style={{
                  ...fieldInputStyle(darkMode, !descriptionValidation.isValid),
                  minHeight: '100px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                maxLength={DESCRIPTION_MAX}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  marginTop: '0.25rem',
                }}
              >
                {trimmedDescription.length} / {DESCRIPTION_MAX}
              </div>
            </div>

            {/* Topic Field */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="topic-schedule" style={fieldLabelStyle(darkMode)}>
                Topic (Optional)
              </label>
              <select
                id="topic-schedule"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                style={fieldInputStyle(darkMode)}
              >
                {IMGUR_TOPICS.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Field */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="tags-schedule" style={fieldLabelStyle(darkMode)}>
                Tags (Optional)
              </label>
              <input
                id="tags-schedule"
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Comma-separated tags"
                style={fieldInputStyle(darkMode, !tagsValidation.isValid)}
                maxLength={TAGS_MAX}
              />
            </div>

            {/* Image Upload */}
            <div style={fieldContainerStyle(darkMode)}>
              <label htmlFor="image-schedule" style={fieldLabelStyle(darkMode)}>
                Image <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="image-schedule"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={fieldInputStyle(darkMode, !imageValidation.isValid)}
              />
              {!imageValidation.isValid && selectedImage && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {imageValidation.error}
                </p>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div style={previewContainerStyle(darkMode)}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Preview</span>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <img src={imagePreview} alt="Preview" style={imagePreviewStyle} />
              </div>
            )}

            {/* Schedule Date & Time */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <ScheduleField
                id="schedule-date"
                type="date"
                label="Schedule Date"
                value={scheduledDate}
                min={getMinScheduleDate()}
                onChange={e => setScheduledDate(e.target.value)}
                attemptedSave={scheduleAttemptedSave}
                errorText="Date is required"
              />
              <ScheduleField
                id="schedule-time"
                type="time"
                label="Schedule Time"
                value={scheduledTime}
                min={getMinScheduleTime()}
                onChange={e => setScheduledTime(e.target.value)}
                attemptedSave={scheduleAttemptedSave}
                errorText="Time is required"
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                style={{
                  ...buttonStyle('primary', darkMode),
                  opacity: !isFormValid || isSubmitting ? 0.5 : 1,
                  cursor: !isFormValid || isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {isSubmitting && <Loader size={16} />}
                Schedule Post
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSubmitting}
                style={buttonStyle('ghost', darkMode)}
              >
                Clear
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Scheduled Posts Section */}
      {activeTab === 'schedule' && (
        <div style={scheduledPostsContainerStyle(darkMode)}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
            📋 Scheduled Posts
            {scheduledPosts.length > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: '400' }}>
                ({scheduledPosts.length})
              </span>
            )}
          </h4>

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {!isLoading && scheduledPosts.length === 0 && (
            <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', textAlign: 'center' }}>
              No scheduled posts yet
            </p>
          )}

          {!isLoading &&
            scheduledPosts.map(post => (
              <div key={post._id} style={scheduledPostItemStyle(darkMode)}>
                <div style={{ flex: 1 }}>
                  <h5 style={{ marginBottom: '0.25rem', fontWeight: '600' }}>{post.title}</h5>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: darkMode ? '#9ca3af' : '#6b7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {formatDisplayDateTime(post.scheduledDate, post.scheduledTime)}
                  </p>
                  {post.tags && (
                    <div style={{ fontSize: '0.75rem', color: darkMode ? '#4b5563' : '#b3b5b8' }}>
                      Tags: {post.tags}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeletePost(post._id)}
                  style={{
                    ...buttonStyle('danger', darkMode),
                    padding: '0.5rem',
                    minWidth: '100px',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

ImgurAutoPoster.propTypes = {
  platform: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
};

ImgurAutoPoster.defaultProps = {
  platform: {
    id: 'imgur',
    name: 'Imgur',
  },
};

export default ImgurAutoPoster;
