import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { toast } from "react-toastify";
import { response } from "msw";


export const checkInstagramAuthStatus = async (setInstagramError) => {
  try {

    const response = await axios.get(ENDPOINTS.GET_INSTAGRAM_AUTH_STATUS);
    console.log("Instagram auth status response:", response.data);
    return response.data;

  } catch (error) {
    const errorMessage = error.response?.data?.message || "Unknown error occurred";
    setInstagramError(errorMessage);
    toast.error(errorMessage);
    return null;
  }
}

const convertToJPG = (file) => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;

          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;

              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              canvas.toBlob((blob) => {
                  if (!blob) {
                      reject(new Error('Failed to convert image to JPG'));
                      return;
                  }

                  const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';

                  const convertedFile = new File(
                      [blob],
                      fileName,
                      { type: 'image/jpeg' }
                  );

                  resolve(convertedFile);
              }, 'image/jpeg');
          };

          img.onerror = (error) => {
              reject(error);
          }
      }

      reader.onerror = (error) => {
          reject(new Error('FileReader error: ' + error.message));
      };
  });
};

export const postToInstagram = async (caption, file, setInstagramError, setCaption, setFile, setImageResetKey) => {
  console.log("postToInstagram called with caption:", caption, "and file:", file);
  try {
    if (!caption) {
      setInstagramError("No caption provided. Please enter a caption for the post.");
      return null;
    }

    if (!file) {
      setInstagramError("No file provided. Please select an image to upload.");
      return null;
    }

    const convertedFile = await convertToJPG(file);
    const imgurFormData = new FormData();
    imgurFormData.append("image", convertedFile);

    // Upload image to Imgur
    const imgurResponse = await axios.post(ENDPOINTS.POST_IMGUR_IMAGE, imgurFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (imgurResponse.data.success != true) {
      setInstagramError("Imgur upload failed. Please try again.");
      return null;
    }
    console.log("Imgur upload response:", imgurResponse.data);
    const imageURL = imgurResponse.data.data.link;
    const deleteHash = imgurResponse.data.data.deletehash;
    console.log("Imgur image URL:", imageURL);
    console.log("Imgur delete hash:", deleteHash);

    // Create Instagram container
    const instagramContainerCreateResponse = await axios.post(ENDPOINTS.CREATE_INSTAGRAM_CONTAINER, {
      imageUrl: imageURL,
      caption: caption,
    });
    if (instagramContainerCreateResponse.data.success != true) {
      setInstagramError("Instagram container creation failed. Please try again.");
      return null;
    }
    console.log("Instagram container response:", instagramContainerCreateResponse.data);

    const containerId = instagramContainerCreateResponse.data.id;

    // Upload the container to Instagram
    const instagramContainerUploadResponse = await axios.post(ENDPOINTS.POST_INSTAGRAM_CONTAINER, {
      containerId: containerId,
    });
    if (instagramContainerUploadResponse.data.success != true) {
      setInstagramError("Instagram container upload failed. Please try again.");
      return null;
    }
    console.log("Instagram container upload response:", instagramContainerUploadResponse.data);

    // Delete the image from Imgur after posting to Instagram
    const deleteImgurResponse = await axios.delete(ENDPOINTS.DELETE_IMGUR_IMAGE, {
      data: { deleteHash: deleteHash },
    });
    if (deleteImgurResponse.data.success != true) {
      setInstagramError("Imgur image deletion failed.");
      return null;
    }
    console.log("Imgur image deletion response:", deleteImgurResponse.data);

    setCaption("");
    setFile(null);
    setImageResetKey(prev => prev + 1);

    return instagramContainerUploadResponse.data;
  } catch (error) {
    console.error("Error in postToInstagram:", error);
    setInstagramError("Error in postToInstagram");
    return null;
  }
}