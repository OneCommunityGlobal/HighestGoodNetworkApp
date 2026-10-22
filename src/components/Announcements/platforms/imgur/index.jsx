import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Loader, X } from 'lucide-react';

import {
  TITLE_MAX,
  DESCRIPTION_MAX,
  TAGS_MAX,
  formatLocalDate,
  formatLocalTime,
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
  formatDisplayDateTime,
} from './Imgurhelpers';

import {
  tabsStyle,
  tabButtonStyle,
  formContainerStyle,
  previewContainerStyle,
  imagePreviewStyle,
  scheduledPostsContainerStyle,
  scheduledPostItemStyle,
} from './ImgurStyles';

// ─── FormField Component ────────────────────────────────────────────────────

function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  validation,
  isOptional,
  style = {},
  children,
}) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const isInvalid = validation && !validation.isValid;

  return (
    <div style={fieldContainerStyle(darkMode)}>
      <label htmlFor={id} style={fieldLabelStyle(darkMode)}>
        {label} {!isOptional && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{
            ...fieldInputStyle(darkMode, isInvalid),
            minHeight: '100px',
            fontFamily: 'inherit',
            resize: 'vertical',
            ...style,
          }}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          style={fieldInputStyle(darkMode, isInvalid)}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          style={fieldInputStyle(darkMode, isInvalid)}
        />
      )}
      {maxLength && (
        <div
          style={{
            fontSize: '0.75rem',
            color: darkMode ? '#9ca3af' : '#6b7280',
            marginTop: '0.25rem',
          }}
        >
          {value.length} / {maxLength}
        </div>
      )}
      {isInvalid && (
        <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {validation.error}
        </p>
      )}
    </div>
  );
}

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  maxLength: PropTypes.number,
  validation: PropTypes.shape({ isValid: PropTypes.bool, error: PropTypes.string }),
  isOptional: PropTypes.bool,
  style: PropTypes.object,
  children: PropTypes.node,
};

FormField.defaultProps = {
  type: 'text',
  value: '',
  onChange: () => {},
  placeholder: '',
  maxLength: null,
  validation: null,
  isOptional: false,
  style: {},
  children: null,
};

// ─── ImageField Component ───────────────────────────────────────────────────

function ImageField({ id, label, onChange, validation, imagePreview, onClearImage }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const isInvalid = validation && !validation.isValid;

  return (
    <>
      <div style={fieldContainerStyle(darkMode)}>
        <label htmlFor={id} style={fieldLabelStyle(darkMode)}>
          {label} <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          onChange={onChange}
          style={fieldInputStyle(darkMode, isInvalid)}
        />
        {isInvalid && (
          <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            {validation.error}
          </p>
        )}
      </div>
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
              onClick={onClearImage}
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
    </>
  );
}

ImageField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  validation: PropTypes.shape({ isValid: PropTypes.bool, error: PropTypes.string }),
  imagePreview: PropTypes.string,
  onClearImage: PropTypes.func.isRequired,
};

ImageField.defaultProps = {
  validation: null,
  imagePreview: null,
};

// ─── FormActions Component ──────────────────────────────────────────────────

function FormActions({ isSubmitting, isFormValid, primaryLabel, onReset }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
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
        {primaryLabel}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={isSubmitting}
        style={buttonStyle('ghost', darkMode)}
      >
        Clear
      </button>
    </div>
  );
}

FormActions.propTypes = {
  isSubmitting: PropTypes.bool.isRequired,
  isFormValid: PropTypes.bool.isRequired,
  primaryLabel: PropTypes.string.isRequired,
  onReset: PropTypes.func.isRequired,
};

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
    // eslint-disable-next-line no-void
    void loadScheduledPostsData();
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
        await loadScheduledPostsData();
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
  const loadScheduledPostsData = async () => {
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
        await loadScheduledPostsData();
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
            <FormField
              id="title-immediate"
              label="Title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter image title"
              maxLength={TITLE_MAX}
              validation={titleValidation}
            />

            <FormField
              id="description-immediate"
              label="Description (Optional)"
              type="textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter image description"
              maxLength={DESCRIPTION_MAX}
              validation={descriptionValidation}
              isOptional
            />

            <FormField
              id="topic-immediate"
              label="Topic (Optional)"
              type="select"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              validation={null}
              isOptional
            >
              {IMGUR_TOPICS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </FormField>

            <FormField
              id="tags-immediate"
              label="Tags (Optional)"
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Comma-separated tags"
              maxLength={TAGS_MAX}
              validation={tagsValidation}
              isOptional
            />

            <ImageField
              id="image-immediate"
              label="Image"
              onChange={handleImageChange}
              validation={imageValidation}
              imagePreview={imagePreview}
              onClearImage={handleClearImage}
            />

            <FormActions
              isSubmitting={isSubmitting}
              isFormValid={isFormValid}
              primaryLabel="Post Now"
              onReset={handleResetForm}
            />
          </form>
        )}

        {activeTab === 'schedule' && (
          <form onSubmit={handleSubmitScheduled}>
            <FormField
              id="title-schedule"
              label="Title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter image title"
              maxLength={TITLE_MAX}
              validation={titleValidation}
            />

            <FormField
              id="description-schedule"
              label="Description (Optional)"
              type="textarea"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter image description"
              maxLength={DESCRIPTION_MAX}
              validation={descriptionValidation}
              isOptional
            />

            <FormField
              id="topic-schedule"
              label="Topic (Optional)"
              type="select"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              validation={null}
              isOptional
            >
              {IMGUR_TOPICS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </FormField>

            <FormField
              id="tags-schedule"
              label="Tags (Optional)"
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Comma-separated tags"
              maxLength={TAGS_MAX}
              validation={tagsValidation}
              isOptional
            />

            <ImageField
              id="image-schedule"
              label="Image"
              onChange={handleImageChange}
              validation={imageValidation}
              imagePreview={imagePreview}
              onClearImage={handleClearImage}
            />

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

            <FormActions
              isSubmitting={isSubmitting}
              isFormValid={isFormValid}
              primaryLabel="Schedule Post"
              onReset={handleResetForm}
            />
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
