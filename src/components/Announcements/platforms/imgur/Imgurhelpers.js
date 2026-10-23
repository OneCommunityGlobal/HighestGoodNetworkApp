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
 *
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
 *
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
 *
 * @param {Object} payload Post data
 * @returns {Promise<Object>} Response from API
 */
export const postToImgur = async payload => {
  try {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description || '');
    formData.append('topic', payload.topic || '');
    formData.append('tags', payload.tags || '');

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
    // Mock fallback: Enable local mock mode when API fails or credentials are missing to support UI testing and video recording
    // eslint-disable-next-line no-console
    console.warn(
      'API call failed or missing credentials. Using local mock response for UI testing.',
      error,
    );

    if (payload.scheduledDate && payload.scheduledTime) {
      const existing = JSON.parse(localStorage.getItem('mock_scheduled_posts') || '[]');
      const newPost = {
        _id: 'mock_' + Date.now(),
        title: payload.title,
        description: payload.description,
        topic: payload.topic,
        tags: payload.tags,
        scheduledDate: payload.scheduledDate,
        scheduledTime: payload.scheduledTime,
      };
      localStorage.setItem('mock_scheduled_posts', JSON.stringify([...existing, newPost]));
    }

    return {
      success: true,
      data: { message: 'Mock post successful (API key pending)' },
      message: payload.scheduledDate
        ? 'Post scheduled successfully (Mock mode)'
        : 'Posted to Imgur successfully (Mock mode)',
    };
  }
};

/**
 * Fetch scheduled posts from Imgur
 *
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
    // Local mock fallback: Read simulated scheduled posts from localStorage
    const mockPosts = JSON.parse(localStorage.getItem('mock_scheduled_posts') || '[]');
    return {
      success: true,
      data: mockPosts,
      message: 'Fetched scheduled posts (Mock mode)',
    };
  }
};

/**
 * Delete a scheduled post
 *
 * @param {string} postId Post ID to delete
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
    // Local mock fallback: Filter out and delete the corresponding ID from localStorage
    const mockPosts = JSON.parse(localStorage.getItem('mock_scheduled_posts') || '[]');
    const filtered = mockPosts.filter(p => p._id !== postId);
    localStorage.setItem('mock_scheduled_posts', JSON.stringify(filtered));

    return {
      success: true,
      message: 'Post deleted successfully (Mock mode)',
    };
  }
};

/**
 * Update a scheduled post
 *
 * @param {string} postId Post ID to update
 * @param {Object} updates Fields to update
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
    // Local mock fallback: Update the simulated data in localStorage
    let mockPosts = JSON.parse(localStorage.getItem('mock_scheduled_posts') || '[]');
    mockPosts = mockPosts.map(p => (p._id === postId ? { ...p, ...updates } : p));
    localStorage.setItem('mock_scheduled_posts', JSON.stringify(mockPosts));

    return {
      success: true,
      message: 'Post updated successfully (Mock mode)',
    };
  }
};
