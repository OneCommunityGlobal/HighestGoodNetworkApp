import { toast } from 'react-toastify';
import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { set } from 'lodash';
import { convertToJPG, validateInstagramImage } from './InstagramHelpers';

/**
 * Fetches the scheduled posts from the server and updates the state
 * 
 * @param {function} setScheduledPosts - State setter for scheduled posts
 * @param {function} setScheduledPostsError - State setter for error messages
 * @param {function} setIsLoadingScheduledPosts - State setter for loading status
 * @returns {Promise<void>}
 */
export const getInstagramScheduledPosts = async (setScheduledPosts, setScheduledPostsError, setIsLoadingScheduledPosts) => {
  setIsLoadingScheduledPosts(true);
  try {
    const response = await axios.get(ENDPOINTS.GET_INSTAGRAM_SCHEDULED_POSTS);
    
    if (response.data && response.data.success && Array.isArray(response.data.posts)) {
      setScheduledPosts(response.data.posts);
      setScheduledPostsError('');
    } else {
      console.error("Unexpected response format:", response.data);
      setScheduledPosts([]);
      setScheduledPostsError("Failed to fetch scheduled posts. Please try again.");
    }

  } catch (error) {
    console.error("Error fetching scheduled posts:", error);
    const errorMessage = error.response?.data?.message || "Unknown error occurred";
    setScheduledPostsError(errorMessage);
    setScheduledPosts([]);
  } finally {
    setIsLoadingScheduledPosts(false);
  }
}

/**
 * Schedules an Instagram post with the provided date, caption, and image
 * 
 * @param {Date} startDate - Scheduled date and time for the post
 * @param {string} caption - Caption text for the post
 * @param {File} file - Image file for the post
 * @param {function} setScheduledButtonTextState - State setter for button text
 * @param {function} setScheduledPostsError - State setter for error messages
 * @returns {Promise<Object|null>} Response data or null on error
 */
export const scheduleInstagramPost = async (startDate, caption, file, setScheduledButtonTextState,  setScheduledPostsError) => {
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
   * * Schedule the Instagram post with the image URL and delete hash.
   */
  try {
    setScheduledButtonTextState("Validating image...");
    const imageValidation = await validateInstagramImage(file);
    if (!imageValidation.isValid) {
      setScheduledPostsError(imageValidation.message);
      return null;
    }
    setScheduledButtonTextState("Image validation complete");
    const convertedFile = await convertToJPG(file);

    const imgurFormData = new FormData();
    imgurFormData.append("image", convertedFile);

    setScheduledButtonTextState("Uploading image to Imgur...");
    const imgurResponse = await axios.post(ENDPOINTS.POST_IMGUR_IMAGE, imgurFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (imgurResponse.data.success != true) {
      setScheduledPostsError("Imgur upload failed. Please try again.");
      return null;
    }
    setScheduledButtonTextState("Imgur upload complete");
    const imageURL = imgurResponse.data.data.link;
    const deleteHash = imgurResponse.data.data.deletehash;

    setScheduledButtonTextState("Scheduling post...");
    const response = await axios.post(ENDPOINTS.POST_INSTAGRAM_SCHEDULED_POST, {
      imgurImageUrl: imageURL,
      imgurDeleteHash: deleteHash,
      caption: caption,
      scheduledTime: formattedDate
    });
    if (response.data.success != true) {
      setScheduledPostsError("Instagram post scheduling failed. Please try again.");
      return null;
    }
    setScheduledButtonTextState("Post scheduled");
    return response.data;
    
  } catch (error) {
    console.error("Error scheduling Instagram post:", error);
    setScheduledPostsError("Error scheduling Instagram post. Please try again.");
    return null;
  }
}

/**
 * Deletes a scheduled Instagram post with the given post ID
 * 
 * @param {string} postId - ID of the post to delete
 * @param {function} setScheduledPostsError - State setter for error messages
 * @returns {Promise<Object|null>} Response data or null on error
 */
export const deleteInstagramScheduledPost = async (postId, setScheduledPostsError) => {
  if (!postId) {
    setScheduledPostsError("Cannot delete post: Missing post ID");
    return null;
  }

  try {
    const response = await axios.delete(ENDPOINTS.DELETE_INSTAGRAM_SCHEDULED_POST(postId));

    return response.data;
  } catch (error) {
    console.error("Error deleting Instagram scheduled post:", error);
    setScheduledPostsError("Error deleting Instagram scheduled post. Please try again.");
    return null;
  }
}