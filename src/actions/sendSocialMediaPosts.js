
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ENDPOINTS } from '../utils/URL';

export const sendTweet = (html) => {
  const url = ENDPOINTS.POST_TWEETS;

  return async () => {
    try {
      const response = await axios.post(url, { "EmailContent": html });
      console.log('Tweet posted successfully:', response);


      toast.success('Tweet successfully posted', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error posting Tweet:', error);
      toast.error('Error posting Tweet', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
};

export const ssendFbPost = (html, accessToken) => {
  return async () => {
    try {

      const response = axios.post(ENDPOINTS.CREATE_FB_POST(), {
        emailContent: html,
        accessToken,
      });

    } catch (error) {
      console.error('Error posting on Facebook:', error);


      toast.error('Error posting on Facebook', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
};

export const sendFbPost = (html, base64Srcs, accessToken) => {
  const url = ENDPOINTS.POST_FB;
  return async () => {
    try {

      const response = await axios.post(url, { emailContent: html, base64Content: base64Srcs, accessToken });
      toast.success('Successfully posted on Facebook Feed', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error posting on Facebook:', error);
      toast.error('Error posting on Facebook', {
        position: 'top-right',
        autoClose: 3000,
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

export const fetchPosts_separately = async () => {
  const url = ENDPOINTS.SOCIAL_MEDIA_POSTS;

  try {
    const response = await axios.get(url);

    if (response.data.success) {
      const posts = response.data.posts;
      console.log('Fetched posts:', posts);
      const twitterPosts = posts.filter(post => post.platform === 'twitter');
      const facebookPosts = posts.filter(post => post.platform === 'facebook');
      return {
        twitterPosts,
        facebookPosts,
      };
    } else {
      console.error('Failed to fetch posts:', response.data);
      return {
        twitterPosts: [],
        facebookPosts: [],
      };
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      twitterPosts: [],
      facebookPosts: [],
    };
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

export const scheduleTweet = (scheduleDate, scheduleTime, html) => {
  const url = ENDPOINTS.SCHEDULE_TWEETS;

  return async () => {
    try {

      const response = await axios.post(url, { "ScheduleDate": scheduleDate, "ScheduleTime": scheduleTime, "EmailContent": html });
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
};

export const scheduleFbPost = (scheduleDate, scheduleTime, html) => {
  const url = ENDPOINTS.SCHEDULE_FBPOSTS;

  return async () => {
    try {

      const response = await axios.post(url, { "ScheduleDate": scheduleDate, "ScheduleTime": scheduleTime, "EmailContent": html });
      console.log('Facebook Post scheduled successfully:', response);


      toast.success('Facebook Post successfully scheduled', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Error scheduling Facebook Post:', error);
      toast.error('Error scheduling Tweet', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
};
