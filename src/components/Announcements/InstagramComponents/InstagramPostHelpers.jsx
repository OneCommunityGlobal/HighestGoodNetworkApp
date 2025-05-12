import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { toast } from "react-toastify";
import { response } from "msw";
import { convertToJPG, validateInstagramImage } from "./InstagramHelpers";

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

// const convertToJPG = (file) => {
//   return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);

//       reader.onload = (event) => {
//           const img = new Image();
//           img.src = event.target.result;

//           img.onload = () => {
//               const canvas = document.createElement('canvas');
//               canvas.width = img.width;
//               canvas.height = img.height;

//               const ctx = canvas.getContext('2d');
//               ctx.drawImage(img, 0, 0);

//               canvas.toBlob((blob) => {
//                   if (!blob) {
//                       reject(new Error('Failed to convert image to JPG'));
//                       return;
//                   }

//                   const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';

//                   const convertedFile = new File(
//                       [blob],
//                       fileName,
//                       { type: 'image/jpeg' }
//                   );

//                   resolve(convertedFile);
//               }, 'image/jpeg');
//           };

//           img.onerror = (error) => {
//               reject(error);
//           }
//       }

//       reader.onerror = (error) => {
//           reject(new Error('FileReader error: ' + error.message));
//       };
//   });
// };

// const validateInstagramImage = (file) => {
//   const INSTAGRAM_MIN_SIZE = 320; // px (minimum dimension)
//   const INSTAGRAM_MAX_SIZE = 1080; // px (Instagram will resize larger images)
//   const INSTAGRAM_ASPECT_RATIO_MIN = 4/5; // Portrait minimum (0.8)
//   const INSTAGRAM_ASPECT_RATIO_MAX = 1.91/1; // Landscape maximum (1.91)
//   const INSTAGRAM_MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

//   return new Promise((resolve, reject) => {
//     if (file.size > INSTAGRAM_MAX_FILE_SIZE) {
//       resolve({
//         isValid: false,
//         file: null,
//         message: "File size exceeds 8MB limit.",
//         dimensions: null,
//       });
//       return;
//     }

//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = (event) => {
//       const img = new Image();
//       img.src = event.target.result;

//       img.onload = () => {
//         const width = img.width;
//         const height = img.height;
//         const aspectRatio = width / height;

//         const dimensions = { width, height };

//         if (width < INSTAGRAM_MIN_SIZE || height < INSTAGRAM_MIN_SIZE) {
//           resolve({
//             isValid: false,
//             file: null,
//             message: `Image is too small. Minimum dimension is ${INSTAGRAM_MIN_SIZE}px`,
//             dimensions
//           });
//           return;
//         }

//         if (width > INSTAGRAM_MAX_SIZE || height > INSTAGRAM_MAX_SIZE) {
//           resolve({
//             isValid: false,
//             file: null,
//             message: `Image is too large. Maximum dimension is ${INSTAGRAM_MAX_SIZE}px`,
//             dimensions
//           });
//           return;
//         }

//         if (aspectRatio < INSTAGRAM_ASPECT_RATIO_MIN || aspectRatio > INSTAGRAM_ASPECT_RATIO_MAX) {
//           resolve({
//             isValid: false,
//             file: null,
//             message: `Image aspect ratio (${aspectRatio.toFixed(2)}) is outside Instagram's allowed range (${INSTAGRAM_ASPECT_RATIO_MIN} to ${INSTAGRAM_ASPECT_RATIO_MAX})`,
//             dimensions
//           });
//           return;
        
//         }

//       }
//       resolve({
//         isValid: true,
//         file: file,
//         message: "Image validation successful",
//       });
//     }

//     reader.onerror = (error) => {
//       reject(new Error('FileReader error: ' + error.message));
//     };
//   })

  
// }

export const postToInstagram = async (caption, file, setInstagramError, setCaption, setFile, setImageResetKey, setButtonTextState) => {
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

    setButtonTextState("Validating image...");
    const validationResponse = await validateInstagramImage(file);
    setButtonTextState("Validation complete");
    if (!validationResponse.isValid) {
      setInstagramError(validationResponse.message);
      return null;
    }
    console.log("Image validation response:", validationResponse);

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
    console.log("Imgur upload response:", imgurResponse.data);
    const imageURL = imgurResponse.data.data.link;
    const deleteHash = imgurResponse.data.data.deletehash;
    console.log("Imgur image URL:", imageURL);
    console.log("Imgur delete hash:", deleteHash);

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
    console.log("Instagram container response:", instagramContainerCreateResponse.data);

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
    setButtonTextState("");

    return instagramContainerUploadResponse.data;
  } catch (error) {
    console.error("Error in postToInstagram:", error);
    setInstagramError("Error in postToInstagram");
    return null;
  }
}