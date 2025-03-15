import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { toast } from 'react-toastify';

export const handlePostToImgur = async ({
  imgurTitle,
  imgurTags,
  imgurFiles,
  imgurScheduleTime,
  imgurFileDescriptions,
  imgurTopic,
  setImgurLoading,
  setImgurError,
  setImgurTitle,
  setImgurTags,
  setImgurFiles,
  setImgurTopic,
  setImgurScheduleTime,
  setImgurFileDescriptions,
}) => {
  console.log('Posting to Imgur...');
  console.log('Title:', imgurTitle);
  console.log('Schedule Time:', imgurScheduleTime);
  
  // input validation
  if (imgurFiles.length == 0) {
    setImgurError('Please upload an image file first');
    return;
  }

  setImgurLoading(true);
  setImgurError('');

   // create form data
  const formData = new FormData();
  formData.append('title', imgurTitle);
  formData.append('topic', imgurTopic);
  formData.append('tags', imgurTags);

  if (imgurScheduleTime != '') {
    formData.append('scheduleTime', new Date(imgurScheduleTime).toISOString());
  }


  imgurFiles.forEach((file, index) => {
    formData.append('image', file);
    formData.append('description', imgurFileDescriptions[index]);
  });


  try {
    const response = await axios.post(
      ENDPOINTS.POST_IMGUR,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    if (response.status === 200) {
      // reset form after successful post
      setImgurTitle('');
      setImgurTags('');
      setImgurFiles([]);
      setImgurFileDescriptions([]);
      setImgurScheduleTime('');
      setImgurTopic('');

      toast.success('Image successfully posted to Imgur', {
        position: 'top-right',
        autoClose: 3000,
      });
    } else {
      setImgurError(response.data.message || 'Failed to post to Imgur');
      throw new Error(response.data.message || 'Failed to post to Imgur');
    }
  } catch (e) {
    console.error('Error posting image to Imgur:', e);
    setImgurError('Error posting image');
    toast.error('Error posting image', {
      position: 'top-right',
      autoClose: 3000,
    });
  } finally {
    setImgurLoading(false);
  }
};

export const handleImgurFileChange = (e, setImgurFiles, setImgurFileDescriptions) => {
  const files = Array.from(e.target.files);
  setImgurFiles(prevFiles => [...prevFiles, ...files]);
  setImgurFileDescriptions(prevDescriptions => [...prevDescriptions, ...files.map(() => '')]);
};

export const handleRemoveImgurFile = (index, setImgurFiles, setImgurFileDescriptions) => {
  setImgurFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  setImgurFileDescriptions(prevDescriptions => prevDescriptions.filter((_, i) => i !== index));
};

// export const deleteScheduledPost = async (jobId, setScheduledPosts, setImgurError) => {
//   try {
//     console.log(`Deleting scheduled Imgur post with jobId: ${jobId}`);
//     const response = await axios.delete(`${ENDPOINTS.DELETE_SCHEDULED_POST}/${jobId}`);
//     if (response.status === 200) {
//       // Fetch the updated list of scheduled posts
//       fetchImgurScheduledPosts(setScheduledPosts, setImgurError);
//       toast.success('Scheduled post deleted successfully', {
//         position: 'top-right',
//         autoClose: 3000,
//       });
//     } else {
//       setImgurError(response.data.message || 'Failed to delete scheduled post');
//       throw new Error(response.data.message || 'Failed to delete scheduled post');
//     }
//   } catch (e) {
//     console.error('Error deleting scheduled Imgur post:', e);
//     setImgurError('Error deleting scheduled Imgur post');
//     toast.error('Error deleting scheduled post', {
//       position: 'top-right',
//       autoClose: 3000,
//     });
//   }
// };

export const fetchImgurScheduledPosts = async (setScheduledPosts, setImgurError) => {
  try {
    console.log('Fetching scheduled Imgur posts...');
    const response = await axios.get(ENDPOINTS.SCHEDULED_POSTS);
    console.log('Scheduled Imgur posts response:', response.data);
    const posts = response.data.scheduledPosts;
    if (response.status === 200) {
      setScheduledPosts(posts);
      console.log('Scheduled Imgur posts:', posts);
    } else {
      setImgurError(response.data.message || 'Failed to fetch scheduled Imgur posts');
      throw new Error(response.data.message || 'Failed to fetch scheduled Imgur posts');
    }
  } catch (e) {
    console.error('Error fetching scheduled Imgur posts:', e);
    setImgurError('Error fetching scheduled Imgur posts');
  }
};

