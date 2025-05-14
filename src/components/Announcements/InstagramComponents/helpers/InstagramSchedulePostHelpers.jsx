import { toast } from 'react-toastify';
import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { set } from 'lodash';
import { convertToJPG, validateInstagramImage } from './InstagramHelpers';

export const getInstagramScheduledPosts = async (setScheduledPosts, setScheduledPostsError, setIsLoadingScheduledPosts) => {
  setIsLoadingScheduledPosts(true);
  try {
    const response = await axios.get(ENDPOINTS.GET_INSTAGRAM_SCHEDULED_POSTS);
    console.log("Instagram scheduled posts response:", response.data);
    
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

export const scheduleInstagramPost = async (startDate, caption, file, setScheduledButtonTextState,  setScheduledPostsError) => {
  console.log('startDate:', startDate);
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

  console.log('Scheduled post date:', startDate);

  const formattedDate = startDate.toISOString();
  console.log('Formatted date:', formattedDate);
  console.log('Caption:', caption);
  console.log('File:', file);
  
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
    console.log("Imgur upload form data:", imgurFormData);
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
    console.log("Imgur upload response:", imgurResponse.data);
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