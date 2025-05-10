import { toast } from 'react-toastify';
import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { set } from 'lodash';

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

export const scheduleInstagramPost = async (startDate, caption, file, setScheduledButtonTextState,  setScheduledPostsError) => {
  console.log('startDate:', startDate);
  if (!startDate) {
    setScheduledPostsError('Please select a date and time to schedule the post.');
    return null;
  }

  console.log('Scheduled post date:', startDate);

  const formattedDate = startDate.toISOString();
  console.log('Formatted date:', formattedDate);
  console.log('Caption:', caption);
  console.log('File:', file);
  
  try {
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

    console.log("Imgur upload response:", imgurResponse.data);
    const imageURL = imgurResponse.data.data.link;
    const deleteHash = imgurResponse.data.data.deletehash;

    const response = await axios.post(ENDPOINTS.POST_INSTAGRAM_SCHEDULED_POST, {
      imgurImageUrl: imageURL,
      imgurDeleteHash: deleteHash,
      caption: caption,
      scheduledTime: formattedDate
    });

    return response.data;
    
  } catch (error) {
    console.error("Error scheduling Instagram post:", error);
    setScheduledPostsError("Error scheduling Instagram post. Please try again.");
    return null;
  }
}