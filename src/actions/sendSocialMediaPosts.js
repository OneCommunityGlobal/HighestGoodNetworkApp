
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ENDPOINTS } from '../utils/URL';

export const sendTweet = (html) => {
  const url = ENDPOINTS.POST_TWEETS;

  return async () => {
    try {
      await axios.post(url, { "EmailContent": html });
      toast.success('Tweet successfully posted', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
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
      axios.post(ENDPOINTS.CREATE_FB_POST(), {
        emailContent: html,
        accessToken,
      });

    } catch (error) {
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
      await axios.post(url, { emailContent: html, base64Content: base64Srcs, accessToken });
      toast.success('Successfully posted on Facebook Feed', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
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
      const { posts } = response.data;
      return posts;
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const fetchPostsSeparately = async () => {
  const url = ENDPOINTS.SOCIAL_MEDIA_POSTS;

  try {
    const response = await axios.get(url);

    if (response.data.success) {
      const { posts } = response.data;
      const twitterPosts = posts.filter(post => post.platform === 'twitter');
      const facebookPosts = posts.filter(post => post.platform === 'facebook');
      return {
        twitterPosts,
        facebookPosts,
      };
    } 
      return {
        twitterPosts: [],
        facebookPosts: [],
      };
  } catch (error) {
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
      return response.data;
    }
      return null;
  } catch (error) {
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
      return response.data;
    }
      return null;
  } catch (error) {
    return null;
  }
};

export const scheduleTweet = (scheduleDate, scheduleTime, html) => {
  const url = ENDPOINTS.SCHEDULE_TWEETS;
  console.log(html, "content reached to scheduled tweet");
  return async () => {
    try {
      await axios.post(url, { "ScheduleDate": scheduleDate, "ScheduleTime": scheduleTime, "EmailContent": html });
      toast.success('Tweet successfully scheduled', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Error scheduling Tweet', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
};

export const scheduleFbPost = (scheduleDate, scheduleTime, html) => {
  const url = ENDPOINTS.SCHEDULE_FBPOSTS;

  //console.log(html,"Displayed the content here in action items");

  return async () => {
    try {

      await axios.post(url, { "ScheduleDate": scheduleDate, "ScheduleTime": scheduleTime, "EmailContent": html });

      toast.success('Facebook Post successfully scheduled', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Error scheduling Tweet', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };
};
