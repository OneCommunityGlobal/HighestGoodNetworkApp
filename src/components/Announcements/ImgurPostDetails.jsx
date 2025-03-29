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
  setImgurError,
}) => {
  console.log('Posting to Imgur...');
  console.log('Title:', imgurTitle);
  console.log('Schedule Time:', imgurScheduleTime);
  console.log('Tags:', imgurTags);
  console.log('Files:', imgurFiles);
  console.log('Descriptions:', imgurFileDescriptions);
  // input validation
  if (imgurFiles.length == 0) {
    setImgurError('Please upload an image file first');
    return;
  }

  if (imgurFiles.length !== imgurFileDescriptions.length) {
    setImgurError('Mismatch between files and descriptions');
    return;
  }

  // setImgurLoading(true);
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

  console.log('Form data:', formData);
  console.log('Form data entries:', Array.from(formData.entries()));
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

export const handleRemoveScheduledPost = async (postId, setScheduledPosts, setImgurError) => {
  console.log('Removing scheduled post:', postId);
  try {
    const response = await axios.delete(`${ENDPOINTS.SCHEDULED_POSTS}/${postId}`);
    if (response.status === 200) {
      // const posts = response.data.scheduledPosts;
      // setScheduledPosts(posts);
      toast.success('Scheduled post successfully removed', {
        position: 'top-right',
        autoClose: 3000,
      });
    } else {
      setImgurError(response.data.message || 'Failed to remove scheduled post');
      throw new Error(response.data.message || 'Failed to remove scheduled post');
    }
  } catch (e) {
    console.error('Error removing scheduled post:', e);
    setImgurError('Error removing scheduled post');
    toast.error('Error removing scheduled post', {
      position: 'top-right',
      autoClose: 3000,
    });
  }
}

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

