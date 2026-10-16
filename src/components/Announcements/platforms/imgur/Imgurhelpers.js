import axios from 'axios';

// ─── Constants ───────────────────────────────────────────────────────────────

export const TITLE_MIN = 3;
export const TITLE_MAX = 200;
export const DESCRIPTION_MAX = 500;
export const TAGS_MAX = 100;
export const MAX_IMAGES = 10;
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image

// ─── API Endpoints ───────────────────────────────────────────────────────────

const APIEndpoint = process.env.REACT_APP_APIENDPOINT || 'http://localhost:4500/api';

export const IMGUR_ENDPOINTS = {
  POST_IMAGE: `${APIEndpoint}/imgur/post`,
  GET_SCHEDULED_POSTS: `${APIEndpoint}/imgur/posts`,
  DELETE_SCHEDULED_POST: postId => `${APIEndpoint}/imgur/posts/${postId}`,
  UPDATE_SCHEDULED_POST: postId => `${APIEndpoint}/imgur/posts/${postId}`,
};

// ─── Validation Helpers ──────────────────────────────────────────────────────

/**
 * Validates image file against size and type constraints
 * @param {File} file - Image file to validate
 * @returns {Object} { isValid, error }
 */
export const validateImageFile = file => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates title field
 * @param {string} title - Title text
 * @returns {Object} { isValid, error }
 */
export const validateTitle = title => {
  const trimmed = (title || '').trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Title is required' };
  }

  if (trimmed.length < TITLE_MIN) {
    return { isValid: false, error: `Title must be at least ${TITLE_MIN} characters` };
  }

  if (trimmed.length > TITLE_MAX) {
    return { isValid: false, error: `Title must not exceed ${TITLE_MAX} characters` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates description field
 * @param {string} description - Description text
 * @returns {Object} { isValid, error }
 */
export const validateDescription = description => {
  const trimmed = (description || '').trim();

  if (trimmed.length > DESCRIPTION_MAX) {
    return {
      isValid: false,
      error: `Description must not exceed ${DESCRIPTION_MAX} characters`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates tags field
 * @param {string} tags - Comma-separated tags
 * @returns {Object} { isValid, error }
 */
export const validateTags = tags => {
  const trimmed = (tags || '').trim();

  if (trimmed.length > TAGS_MAX) {
    return { isValid: false, error: `Tags must not exceed ${TAGS_MAX} characters` };
  }

  return { isValid: true, error: null };
};

// ─── API Helper Functions ────────────────────────────────────────────────────

/**
 * Get Bearer token from localStorage
 * @returns {string|null} Bearer token or null
 */
export const getAuthToken = () => {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    return token;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Get axios config with Bearer token authorization
 * @returns {Object} Axios config object
 */
export const getAuthConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
};

/**
 * Post image to Imgur (immediate or scheduled)
 * @param {Object} payload - Post data
 * @param {string} payload.title - Post title
 * @param {string} payload.description - Post description
 * @param {string} payload.topic - Topic/category
 * @param {string} payload.tags - Comma-separated tags
 * @param {File|string} payload.image - Image file or base64 string
 * @param {string} payload.scheduledDate - ISO date for scheduled posts (optional)
 * @param {string} payload.scheduledTime - HH:mm for scheduled posts (optional)
 * @returns {Promise<Object>} Response from API
 */
export const postToImgur = async payload => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description || '');
    formData.append('topic', payload.topic || '');
    formData.append('tags', payload.tags || '');

    // Handle both File and base64 string
    if (payload.image instanceof File) {
      formData.append('image', payload.image);
    } else if (typeof payload.image === 'string') {
      formData.append('imageBase64', payload.image);
    }

    if (payload.scheduledDate) {
      formData.append('scheduledDate', payload.scheduledDate);
    }

    if (payload.scheduledTime) {
      formData.append('scheduledTime', payload.scheduledTime);
    }

    const token = getAuthToken();
    const headers = {
      Authorization: token ? `Bearer ${token}` : '',
    };

    const response = await axios.post(IMGUR_ENDPOINTS.POST_IMAGE, formData, { headers });

    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Post created successfully',
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to post to Imgur. Please try again.';

    // eslint-disable-next-line no-console
    console.error('Error posting to Imgur:', error);

    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status,
    };
  }
};

/**
 * Fetch scheduled posts from Imgur
 * @returns {Promise<Object>} Response with scheduled posts
 */
export const fetchScheduledPosts = async () => {
  try {
    const config = getAuthConfig();
    const response = await axios.get(IMGUR_ENDPOINTS.GET_SCHEDULED_POSTS, config);

    return {
      success: true,
      data: response.data.scheduledPosts || [],
      message: response.data.message || 'Posts fetched successfully',
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Failed to fetch scheduled posts';

    // eslint-disable-next-line no-console
    console.error('Error fetching scheduled posts:', error);

    return {
      success: false,
      error: errorMessage,
      data: [],
      statusCode: error.response?.status,
    };
  }
};

/**
 * Delete a scheduled post
 * @param {string} postId - Post ID to delete
 * @returns {Promise<Object>} Response from API
 */
export const deleteScheduledPost = async postId => {
  try {
    const config = getAuthConfig();
    const response = await axios.delete(IMGUR_ENDPOINTS.DELETE_SCHEDULED_POST(postId), config);

    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Post deleted successfully',
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete post';

    // eslint-disable-next-line no-console
    console.error('Error deleting post:', error);

    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status,
    };
  }
};

/**
 * Update a scheduled post
 * @param {string} postId - Post ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Response from API
 */
export const updateScheduledPost = async (postId, updates) => {
  try {
    const config = getAuthConfig();
    const response = await axios.put(
      IMGUR_ENDPOINTS.UPDATE_SCHEDULED_POST(postId),
      updates,
      config,
    );

    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Post updated successfully',
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update post';

    // eslint-disable-next-line no-console
    console.error('Error updating post:', error);

    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status,
    };
  }
};

// ─── Date/Time Formatting Helpers ────────────────────────────────────────────

/**
 * Format current date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
export const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format current time to HH:mm
 * @param {Date} date - Date object
 * @returns {string} Formatted time
 */
export const formatLocalTime = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format display date/time string
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} time - Time string (HH:mm)
 * @returns {string} Formatted display string
 */
export const formatDisplayDateTime = (date, time) => {
  if (!date || !time) return '';
  try {
    const dateObj = new Date(`${date}T${time}:00`);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    return `${date} ${time}`;
  }
};

/**
 * Clamp scheduled date/time to minimum (now + 1 hour)
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} time - Time string (HH:mm)
 * @returns {Object} { date, time } clamped to valid range
 */
export const clampScheduleDateTime = (date, time) => {
  const now = new Date();
  const minDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

  let scheduleDate = new Date(`${date}T${time}:00`);

  if (scheduleDate < minDate) {
    scheduleDate = minDate;
  }

  return {
    date: formatLocalDate(scheduleDate),
    time: formatLocalTime(scheduleDate),
  };
};

/**
 * Get minimum date for scheduling (today's date)
 * @returns {string} Formatted date (YYYY-MM-DD)
 */
export const getMinScheduleDate = () => formatLocalDate(new Date());

/**
 * Get minimum time for scheduling (current time)
 * @returns {string} Formatted time (HH:mm)
 */
export const getMinScheduleTime = () => formatLocalTime(new Date());

// ─── Image Processing Helpers ────────────────────────────────────────────────

/**
 * Convert File to base64 string
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 encoded image
 */
export const fileToBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * Create image preview URL from File
 * @param {File} file - Image file
 * @returns {string} Object URL for preview
 */
export const createImagePreview = file => {
  return URL.createObjectURL(file);
};

/**
 * Revoke image preview URL
 * @param {string} url - Preview URL to revoke
 */
export const revokeImagePreview = url => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// ─── UI Helper Functions ─────────────────────────────────────────────────────

/**
 * Get button style based on variant and dark mode
 * @param {string} variant - Button variant: 'primary', 'secondary', 'ghost', 'danger'
 * @param {boolean} darkMode - Dark mode enabled
 * @returns {Object} Style object
 */
export const buttonStyle = (variant = 'primary', darkMode = false) => {
  const baseStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  };

  const variants = {
    primary: {
      ...baseStyle,
      background: darkMode ? '#1f4d8f' : '#2563eb',
      color: '#fff',
    },
    secondary: {
      ...baseStyle,
      background: darkMode ? '#374151' : '#d1d5db',
      color: darkMode ? '#fff' : '#111827',
    },
    ghost: {
      ...baseStyle,
      background: 'transparent',
      border: `1px solid ${darkMode ? '#4b5563' : '#d1d5db'}`,
      color: darkMode ? '#e5e7eb' : '#374151',
    },
    danger: {
      ...baseStyle,
      background: darkMode ? '#7f1d1d' : '#fecaca',
      color: darkMode ? '#fca5a5' : '#991b1b',
    },
  };

  return variants[variant] || variants.primary;
};

/**
 * Get field container style
 * @param {boolean} darkMode - Dark mode enabled
 * @returns {Object} Style object
 */
export const fieldContainerStyle = (darkMode = false) => ({
  marginBottom: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
});

/**
 * Get field label style
 * @param {boolean} darkMode - Dark mode enabled
 * @returns {Object} Style object
 */
export const fieldLabelStyle = (darkMode = false) => {
  const textColor = darkMode ? '#e5e7eb' : '#374151';
  return {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: textColor,
  };
};

/**
 * Get field input style
 * @param {boolean} darkMode - Dark mode enabled
 * @param {boolean} hasError - Field has error
 * @returns {Object} Style object
 */
export const fieldInputStyle = (darkMode = false, hasError = false) => {
  const borderColor = hasError ? '#ef4444' : darkMode ? '#4b5563' : '#d1d5db';
  const bgColor = darkMode ? '#1f2937' : '#fff';
  const textColor = darkMode ? '#e5e7eb' : '#111827';
  return {
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    border: `1px solid ${borderColor}`,
    backgroundColor: bgColor,
    color: textColor,
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  };
};

/**
 * Get card container style
 * @param {boolean} darkMode - Dark mode enabled
 * @returns {Object} Style object
 */
export const cardStyle = (darkMode = false) => {
  const borderColor = darkMode ? '#374151' : '#e5e7eb';
  const bgColor = darkMode ? '#111827' : '#f9fafb';
  return {
    padding: '1rem',
    borderRadius: '0.5rem',
    border: `1px solid ${borderColor}`,
    backgroundColor: bgColor,
  };
};

// ─── Topic/Category helpers ──────────────────────────────────────────────────

export const IMGUR_TOPICS = [
  'General',
  'Technology',
  'Science',
  'Art',
  'Photography',
  'Humor',
  'Gaming',
  'Sports',
  'Music',
  'Travel',
  'Food',
  'DIY',
  'Fashion',
  'Education',
  'Other',
];
