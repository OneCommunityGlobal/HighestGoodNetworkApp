/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import { toast } from 'react-toastify'; // Import the toast library
import 'react-toastify/dist/ReactToastify.css'; // Import the toast styles
import { ENDPOINTS } from '../utils/URL';

export const sendTweet = (html) => {
  const url = ENDPOINTS.POST_TWEETS;

  return async () => {
    try {
      const response = await axios.post(url, { "EmailContent": html });
      console.log('Tweet posted successfully:', response);

      // Display a success toast
      toast.success('Tweet successfully posted', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      console.error('Error posting Tweet:', error);

      // Display an error toast
      toast.error('Error posting Tweet', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  };
};

export const fetchPosts = async () => {
  const url = ENDPOINTS.SOCIAL_MEDIA_POSTS; 

  try {
    const response = await axios.get(url);
    
    if (response.data.success) {
      const posts = response.data.posts;
      console.log('Fetched posts:', posts);
      return posts;
    } else {
      console.error('Failed to fetch posts:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const updatePost = async (postId, updatedData) => {
  const url = ENDPOINTS.SOCIAL_MEDIA_POSTS;

  try {
    const response = await axios.put(url, updatedData, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      console.log('Post updated successfully:', response.data);
      return response.data;
    } else {
      console.error('Failed to update post:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
};

export const deletePost = async (postId) => {
  const url = ENDPOINTS.SOCIAL_MEDIA_POSTS;

  try {
    const response = await axios.delete(url, {
      data: { _id: postId },
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 200) {
      console.log('Post deleted successfully:', response.data);
      return response.data;
    } else {
      console.error('Failed to delete post:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    return null;
  }
};

// export const scheduleTweet = (scheduleDate, scheduleTime, html) => {
//   const url = ENDPOINTS.SCHEDULE_TWEETS;

//   return async () => {
//     try {
//       console.log('ScheduleDate', scheduleDate);
//       console.log('ScheduleTime', scheduleTime);
//       const response = await axios.post(url, { "ScheduleDate": scheduleDate, "ScheduleTime": scheduleTime, "EmailContent": html });
//       console.log('Tweet scheduled successfully:', response);

//       // Display a success toast
//       toast.success('Tweet successfully scheduled', {
//         position: 'top-right', // You can adjust the position as needed
//         autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
//       });
//     } catch (error) {
//       console.error('Error scheduling Tweet:', error);

//       // Display an error toast
//       toast.error('Error scheduling Tweet', {
//         position: 'top-right', // You can adjust the position as needed
//         autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
//       });
//     }
//   };
// };

export const scheduleTweet = async (scheduleDate, scheduleTime, html) => {
  const url = ENDPOINTS.SCHEDULE_TWEETS;

  try {
    console.log('ScheduleDate', scheduleDate);
    console.log('ScheduleTime', scheduleTime);
    const response = await axios.post(url, {
      ScheduleDate: scheduleDate,
      ScheduleTime: scheduleTime,
      EmailContent: html,
    });
    console.log('Tweet scheduled successfully:', response);

    toast.success('Tweet successfully scheduled', {
      position: 'top-right',
      autoClose: 3000,
    });
  } catch (error) {
    console.error('Error scheduling Tweet:', error);

    toast.error('Error scheduling Tweet', {
      position: 'top-right',
      autoClose: 3000,
    });
  }
};
