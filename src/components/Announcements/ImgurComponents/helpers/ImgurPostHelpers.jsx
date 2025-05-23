import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { toast } from 'react-toastify';
import { convertToJPG, validateImgurImage } from './ImgurHelpers';

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
  caption,
  file,
  setImgurError,
  setCaption,
  setFile,
  setImageResetKey,
  setButtonTextState,
) => {
  try {
    if (!caption) {
      setImgurError('No caption provided. Please enter a caption for the post.');
      return null;
    }

    if (!file) {
      setImgurError('No file provided. Please select an image to upload.');
      return null;
    }

    setButtonTextState('Validating image...');
    const validationResponse = await validateImgurImage(file);
    setButtonTextState('Validation complete');
    if (!validationResponse.isValid) {
      setImgurError(validationResponse.message);
      return null;
    }

    const convertedFile = await convertToJPG(file);
    const imgurFormData = new FormData();
    imgurFormData.append('image', convertedFile);

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

    const imageURL = imgurResponse.data.data.link;
    const deleteHash = imgurResponse.data.data.deletehash;

    // Create Imgur container
    setButtonTextState('Creating Imgur container...');
    const imgurContainerCreateResponse = await axios.post(
      ENDPOINTS.CREATE_IMGUR_CONTAINER,
      {
        imageUrl: imageURL,
        caption,
      },
    );
    if (imgurContainerCreateResponse.data.success !== true) {
      setImgurError('Imgur container creation failed. Please try again.');
      return null;
    }
    setButtonTextState('Imgur container created');

    const containerId = imgurContainerCreateResponse.data.id;

    // Upload the container to Imgur
    setButtonTextState('Uploading Imgur container...');
    const imgurContainerUploadResponse = await axios.post(ENDPOINTS.POST_IMGUR_CONTAINER, {
      containerId,
    });
    if (imgurContainerUploadResponse.data.success !== true) {
      setImgurError('Imgur container upload failed. Please try again.');
      return null;
    }
    setButtonTextState('Imgur container uploaded');

    // Delete the image from Imgur after posting to Imgur
    setButtonTextState('Deleting image from Imgur...');
    const deleteImgurResponse = await axios.delete(ENDPOINTS.DELETE_IMGUR_IMAGE, {
      data: { deleteHash },
    });
    if (deleteImgurResponse.data.success !== true) {
      setImgurError('Imgur image deletion failed.');
      return null;
    }
    setButtonTextState('Imgur image deleted');

    setCaption('');
    setFile(null);
    setImageResetKey(prev => prev + 1);
    setButtonTextState('');

    return imgurContainerUploadResponse.data;
  } catch (error) {
    setImgurError('Error in postToImgur');
    return null;
  }
};