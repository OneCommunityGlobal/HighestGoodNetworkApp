import axios from 'axios';
import { toast } from 'react-toastify'; // Import the toast library
import 'react-toastify/dist/ReactToastify.css'; // Import the toast styles
import { ENDPOINTS } from '../utils/URL';

export const postToImgur = (imageFile, emailContent) => {
  const url = ENDPOINTS.POST_IMGUR;

  const filteredContent = emailContent.replace(/<img[^>]+>/g, '').replace(/<[^>]+>/g, ''); // remove image from email content and tags
  const title = 'Weekly Update';

  return async () => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title);
      formData.append('description', filteredContent);

      console.log('imageFile: ', imageFile);
      console.log('title: ', title);
      console.log('description: ', filteredContent);
      console.log('formData: ', formData);
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image posted successfully to Imgur:', response);

      toast.success('Image successfully posted', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (e) {
      console.error('Error posting image to Imgur:', e);

      toast.error('Error posting image', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  }
}