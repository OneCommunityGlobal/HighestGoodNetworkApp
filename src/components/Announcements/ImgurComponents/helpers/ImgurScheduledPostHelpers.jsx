import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

import { convertToJPG, validateImgurImage } from './ImgurHelpers';

/**
 * Fetches the scheduled posts from the server and updates the state
 *
 * @param {function} setScheduledPosts - State setter for scheduled posts
 * @param {function} setScheduledPostsError - State setter for error messages
 * @param {function} setIsLoadingScheduledPosts - State setter for loading status
 * @returns {Promise<void>}
 */
export const getImgurScheduledPosts = async (
  setScheduledPosts,
  setScheduledPostsError,
  setIsLoadingScheduledPosts,
) => {
  setIsLoadingScheduledPosts(true);
  try {
    const response = await axios.get(ENDPOINTS.GET_IMGUR_SCHEDULED_POSTS);

    if (response.data && response.data.success && Array.isArray(response.data.posts)) {
      setScheduledPosts(response.data.posts);
      setScheduledPostsError('');
    } else {
      setScheduledPosts([]);
      setScheduledPostsError('Failed to fetch scheduled posts. Please try again.');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Unknown error occurred';
    setScheduledPostsError(errorMessage);
    setScheduledPosts([]);
  } finally {
    setIsLoadingScheduledPosts(false);
  }
};

/**
 * Schedules an Imgur post with the provided date, caption, and image
 *
 * @param {Date} startDate - Scheduled date and time for the post
 * @param {string} caption - Caption text for the post
 * @param {File} file - Image file for the post
 * @param {function} setScheduledButtonTextState - State setter for button text
 * @param {function} setScheduledPostsError - State setter for error messages
 * @returns {Promise<Object|null>} Response data or null on error
 */
export const scheduleImgurPost = async (
  startDate,
  title,
  topic,
  tags,
  caption,
  file,
  setScheduledButtonTextState,
  setScheduledPostsError,
) => {
  if (!title) {
    setScheduledPostsError('Please enter a title for the post.');
    return null;
  }
  if (!topic) {
    setScheduledPostsError('Please select a topic for the post.');
    return null;
  }
  if (!tags) {
    setScheduledPostsError('Please enter tags for the post.');
    return null;
  }
  if (!startDate) {
    setScheduledPostsError('Please select a date and time to schedule the post.');
    return null;
  }
  if (!caption) {
    setScheduledPostsError('Please enter a caption for the post.');
    return null;
  }
  if (!file) {
    setScheduledPostsError('Please select an image to upload.');
    return null;
  }

  const formattedDate = startDate.toISOString();

  /**
   * * Validate the image file and convert it to JPG format.
   * * Upload the image to Imgur and get the image URL and delete hash.
   * * Schedule the Imgur post with the image URL and delete hash.
   */
  try {

    const imgurFormData = new FormData();
    imgurFormData.append('title', title);
    imgurFormData.append('image', file);
    imgurFormData.append('description', caption);

    setScheduledButtonTextState('Uploading image to Imgur...');
    const imgurResponse = await axios.post(ENDPOINTS.POST_IMGUR_IMAGE, imgurFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (imgurResponse.data.success !== true) {
      setScheduledPostsError('Imgur upload failed. Please try again.');
      return null;
    }
    setScheduledButtonTextState('Imgur upload complete');
    console.log('Imgur upload response:', imgurResponse.data);
    const deleteHash = imgurResponse.data.data.data.deletehash;
    const imageHash = imgurResponse.data.data.data.id;
    const formattedTags = tags.join(',');

    setScheduledButtonTextState('Scheduling post...');
    const response = await axios.post(ENDPOINTS.POST_IMGUR_SCHEDULED_POST, {
      imageHash: imageHash,
      tags: formattedTags,
      topic: topic,
      deleteHash: deleteHash,
      scheduledTime: formattedDate,
    });
    if (response.data.success !== true) {
      const deleteResponse = await axios.delete(ENDPOINTS.DELETE_IMGUR_IMAGE(deleteHash));
      if (deleteResponse.data.success !== true) {
        setScheduledPostsError('Error deleting image from Imgur. Please try again.');
      }
      console.log('imgur delete response:', deleteResponse.data);
      setScheduledPostsError('Error scheduling Imgur post. Please try again.');
      return null;
    }
    setScheduledButtonTextState('Post scheduled');
    return response.data;
  } catch (error) {
    setScheduledPostsError('Error scheduling Imgur post. Please try again.');
    return null;
  }
};

/**
 * Deletes a scheduled Imgur post with the given post ID
 *
 * @param {string} jobId - ID of the post to delete
 * @param {function} setScheduledPostsError - State setter for error messages
 * @returns {Promise<Object|null>} Response data or null on error
 */
export const deleteImgurScheduledPost = async (jobId, setScheduledPostsError) => {
  if (!jobId) {
    setScheduledPostsError('Cannot delete post: Missing post ID');
    return null;
  }

  try {
    const response = await axios.delete(ENDPOINTS.DELETE_IMGUR_SCHEDULED_POST(jobId));

    return response.data;
  } catch (error) {
    setScheduledPostsError('Error deleting Imgur scheduled post. Please try again.');
    return null;
  }
};