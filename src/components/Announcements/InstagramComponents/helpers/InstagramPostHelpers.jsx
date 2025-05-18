import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { toast } from "react-toastify";
import { response } from "msw";
import { convertToJPG, validateInstagramImage } from "./InstagramHelpers";

/**
 * Checks the authentication status of the Instagram connection
 * 
 * @param {function} setInstagramError
 * @returns {Promise<Object|null>}
 */
export const checkInstagramAuthStatus = async (setInstagramError) => {
  try {

    const response = await axios.get(ENDPOINTS.GET_INSTAGRAM_AUTH_STATUS);
    return response.data;

  } catch (error) {
    const errorMessage = error.response?.data?.message || "Unknown error occurred";
    setInstagramError(errorMessage);
    toast.error(errorMessage);
    return null;
  }
}

/**
 * Disconnects the current Instagram account from the application
 * 
 * @param {function} setInstagramError - State setter function for error messages
 * @returns {Promise<void>}
 */
export const disconnectFromInstagram = async (setInstagramError) => {
  try {
    const response = await axios.delete(ENDPOINTS.DISCONNECT_INSTAGRAM);
    checkInstagramAuthStatus(setInstagramError);
    if (response.data.success) {
      toast.success("Successfully disconnected from Instagram.");
    } else {
      toast.error("Failed to disconnect from Instagram.");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Unknown error occurred";
    setInstagramError(errorMessage);
    toast.error(errorMessage);
  }
}

/**
 * Posts an image to Instagram with the provided caption and file
 * 
 * @param {string} caption - The text caption for the Instagram post
 * @param {File} file - The image file to upload
 * @param {function} setInstagramError - State setter function for error messages
 * @param {function} setCaption - State setter function to clear caption on success
 * @param {function} setFile - State setter function to clear file on success
 * @param {function} setImageResetKey - State setter function to reset image uploader
 * @param {function} setButtonTextState - State setter function to update button text
 * @returns {Promise<Object|null>} The Instagram API response or null if error
 */
export const postToInstagram = async (caption, file, setInstagramError, setCaption, setFile, setImageResetKey, setButtonTextState) => {
  try {
    if (!caption) {
      setInstagramError("No caption provided. Please enter a caption for the post.");
      return null;
    }

    if (!file) {
      setInstagramError("No file provided. Please select an image to upload.");
      return null;
    }

    setButtonTextState("Validating image...");
    const validationResponse = await validateInstagramImage(file);
    setButtonTextState("Validation complete");
    if (!validationResponse.isValid) {
      setInstagramError(validationResponse.message);
      return null;
    }

    const convertedFile = await convertToJPG(file);
    const imgurFormData = new FormData();
    imgurFormData.append("image", convertedFile);

    
    // Upload image to Imgur
    setButtonTextState("Uploading image to Imgur...");
    const imgurResponse = await axios.post(ENDPOINTS.POST_IMGUR_IMAGE, imgurFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (imgurResponse.data.success != true) {
      setInstagramError("Imgur upload failed. Please try again.");
      return null;
    }
    setButtonTextState("Imgur upload complete");

    const imageURL = imgurResponse.data.data.link;
    const deleteHash = imgurResponse.data.data.deletehash;

    // Create Instagram container
    setButtonTextState("Creating Instagram container...");
    const instagramContainerCreateResponse = await axios.post(ENDPOINTS.CREATE_INSTAGRAM_CONTAINER, {
      imageUrl: imageURL,
      caption: caption,
    });
    if (instagramContainerCreateResponse.data.success != true) {
      setInstagramError("Instagram container creation failed. Please try again.");
      return null;
    }
    setButtonTextState("Instagram container created");

    const containerId = instagramContainerCreateResponse.data.id;

    // Upload the container to Instagram
    setButtonTextState("Uploading Instagram container...");
    const instagramContainerUploadResponse = await axios.post(ENDPOINTS.POST_INSTAGRAM_CONTAINER, {
      containerId: containerId,
    });
    if (instagramContainerUploadResponse.data.success != true) {
      setInstagramError("Instagram container upload failed. Please try again.");
      return null;
    }
    setButtonTextState("Instagram container uploaded");

    // Delete the image from Imgur after posting to Instagram
    setButtonTextState("Deleting image from Imgur...");
    const deleteImgurResponse = await axios.delete(ENDPOINTS.DELETE_IMGUR_IMAGE, {
      data: { deleteHash: deleteHash },
    });
    if (deleteImgurResponse.data.success != true) {
      setInstagramError("Imgur image deletion failed.");
      return null;
    }
    setButtonTextState("Imgur image deleted");

    setCaption("");
    setFile(null);
    setImageResetKey(prev => prev + 1);
    setButtonTextState("");

    return instagramContainerUploadResponse.data;
  } catch (error) {
    console.error("Error in postToInstagram:", error);
    setInstagramError("Error in postToInstagram");
    return null;
  }
}