import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';

/**
 * Checks the authentication status of the Imgur connection
 *
 * @param {function} setImgurError
 * @returns {Promise<Object|null>}
 */
export const checkImgurAuthStatus = async setImgurError => {
  try {
    const response = await axios.get(ENDPOINTS.GET_IMGUR_AUTH_STATUS);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Unknown error occurred';
    setImgurError(errorMessage);
    toast.error(errorMessage);
    return null;
  }
};

/**
 * Disconnects the current Imgur account from the application
 *
 * @param {function} setImgurError - State setter function for error messages
 * @returns {Promise<void>}
 */
export const disconnectFromImgur = async setImgurError => {
  try {
    const response = await axios.delete(ENDPOINTS.DISCONNECT_IMGUR);
    checkImgurAuthStatus(setImgurError);
    if (response.data.success) {
      toast.success('Successfully disconnected from Imgur.');
    } else {
      toast.error('Failed to disconnect from Imgur.');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Unknown error occurred';
    setImgurError(errorMessage);
    toast.error(errorMessage);
  }
};

/**
 * Posts an image to Imgur with the provided caption and file
 *
 * @param {string} caption - The text caption for the Imgur post
 * @param {File} file - The image file to upload
 * @param {function} setImgurError - State setter function for error messages
 * @param {function} setCaption - State setter function to clear caption on success
 * @param {function} setFile - State setter function to clear file on success
 * @param {function} setImageResetKey - State setter function to reset image uploader
 * @param {function} setButtonTextState - State setter function to update button text
 * @returns {Promise<Object|null>} The Imgur API response or null if error
 */
export const postToImgur = async (
  title,
  topic,
  tags,
  caption,
  file,
  setImgurError,
  setTitle,
  setTopic,
  setTags,
  setCaption,
  setFile,
  setImageResetKey,
  setButtonTextState,
) => {
  try {
    if (!title) {
      setImgurError('No title provided. Please enter a title for the post.');
      return null;
    }

    if (!topic) {
      setImgurError('No topic provided. Please enter a topic for the post.');
      return null;
    }

    if (!tags) {
      setImgurError('No tags provided. Please enter tags for the post.');
      return null;
    }

    if (!caption) {
      setImgurError('No caption provided. Please enter a caption for the post.');
      return null;
    }

    if (!file) {
      setImgurError('No file provided. Please select an image to upload.');
      return null;
    }

    // change tags from arrays to strings
    const formattedTags = tags.join(',');

    const imgurFormData = new FormData();
    imgurFormData.append('title', title);
    imgurFormData.append('image', file);
    imgurFormData.append('description', caption);
    

    // Upload image to Imgur
    setButtonTextState('Uploading image to Imgur...');
    const imgurResponse = await axios.post(ENDPOINTS.POST_IMGUR_IMAGE, imgurFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (imgurResponse.data.success !== true) {
      setImgurError('Imgur upload failed. Please try again.');
      return null;
    }
    setButtonTextState('Imgur upload complete');

    setButtonTextState('Adding post to Imgur gallery...');
    const imageHash = imgurResponse.data.data.data.id;

    const imgurGalleryResponse = await axios.post(ENDPOINTS.POST_IMGUR_IMAGE_TO_GALLERY(imageHash), {
      title,
      topic,
      tags: formattedTags,
    })

    if (imgurGalleryResponse.data.success !== true) {
      setImgurError('Imgur gallery post failed. Please try again.');
      return null;
    }
    setButtonTextState('Imgur gallery post complete');

    setTitle('');
    setTopic('');
    setTags(['']);
    setCaption('');
    setFile(null);
    setImageResetKey(prev => prev + 1);
    setButtonTextState('');

    return imgurGalleryResponse.data;
  } catch (error) {
    setImgurError('Error in postToImgur');
    return null;
  }
};