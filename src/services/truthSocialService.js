import axios from 'axios';

const API_BASE = process.env.REACT_APP_APIENDPOINT || 'http://localhost:4500/api';
const TRUTH_SOCIAL_API = 'https://truthsocial.com/api/v1';

// Local storage keys
const TOKEN_KEY = 'truthsocial_access_token';

// Get stored token
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

// Save token to localStorage
export const saveToken = token => {
  localStorage.setItem(TOKEN_KEY, token);
  return { success: true };
};

// Get credentials
export const getCredentials = () => {
  const token = getStoredToken();
  return { hasToken: !!token, accessToken: token ? `${token.substring(0, 8)}...` : '' };
};

// Logout - clear token
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  return { success: true };
};

// Upload media directly to Truth Social (from browser)
const uploadMedia = async (base64Data, altText = '') => {
  const token = getStoredToken();
  if (!base64Data || !token) return null;

  try {
    // Convert base64 to blob
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return null;

    const mimeType = matches[1];
    const byteString = atob(matches[2]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.codePointAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });

    // Create FormData
    const formData = new FormData();
    const mimeTypeExtensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    const ext = mimeTypeExtensions[mimeType] || 'jpg';
    formData.append('file', blob, `image.${ext}`);

    // Upload to Truth Social
    const uploadRes = await axios.post(`${TRUTH_SOCIAL_API}/media`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const mediaId = uploadRes.data.id;

    // Add alt text if provided
    if (altText && mediaId) {
      await axios.put(
        `${TRUTH_SOCIAL_API}/media/${mediaId}`,
        { description: altText },
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        },
      );
    }

    return mediaId;
  } catch (err) {
    // Media upload failed - return null to continue without image
    return null;
  }
};

// Post directly to Truth Social (from browser - bypasses Cloudflare!)
export const postToTruthSocial = async postData => {
  const token = getStoredToken();
  if (!token) throw new Error('No token configured. Please add your token in Settings.');

  try {
    let mediaId = null;
    if (postData.image) {
      mediaId = await uploadMedia(postData.image, postData.altText);
    }

    const payload = { status: postData.content };
    if (mediaId) payload.media_ids = [mediaId];

    const response = await axios.post(`${TRUTH_SOCIAL_API}/statuses`, payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    // Save to backend history (optional - won't fail if backend is down)
    try {
      await axios.post(`${API_BASE}/truthsocial/history`, {
        content: postData.content,
        image: postData.image || null,
        altText: postData.altText || '',
        postedAt: new Date().toISOString(),
        truthSocialPostId: response.data.id,
      });
    } catch (e) {
      // History save failed, but post succeeded - that's okay
    }

    return { success: true, postId: response.data.id, url: response.data.url };
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message || 'Failed to post');
  }
};

// Backend endpoints for scheduling (these don't hit Truth Social directly)
export const schedulePost = async postData => {
  const response = await axios.post(`${API_BASE}/truthsocial/schedule`, postData);
  return response.data;
};

export const getScheduledPosts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/truthsocial/schedule`);
    return response.data || [];
  } catch (err) {
    return [];
  }
};

export const deleteScheduledPost = async id => {
  const response = await axios.delete(`${API_BASE}/truthsocial/schedule/${id}`);
  return response.data;
};

export const updateScheduledPost = async (id, postData) => {
  const response = await axios.put(`${API_BASE}/truthsocial/schedule/${id}`, postData);
  return response.data;
};

// Post scheduled now - needs to go through frontend
export const postScheduledNow = async id => {
  // Get the scheduled post data first
  const posts = await getScheduledPosts();
  const post = posts.find(p => p._id === id);
  if (!post) throw new Error('Post not found');

  // Post it directly from browser
  await postToTruthSocial({
    content: post.content,
    image: post.image,
    altText: post.altText,
  });

  // Delete from scheduled
  await deleteScheduledPost(id);
  return { success: true };
};

export const getPostHistory = async () => {
  try {
    const response = await axios.get(`${API_BASE}/truthsocial/history`);
    return response.data || [];
  } catch (err) {
    return [];
  }
};

export default {
  saveToken,
  getCredentials,
  getStoredToken,
  logout,
  postToTruthSocial,
  schedulePost,
  getScheduledPosts,
  deleteScheduledPost,
  updateScheduledPost,
  postScheduledNow,
  getPostHistory,
};
