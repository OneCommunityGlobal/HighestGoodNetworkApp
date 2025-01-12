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

export const scheduleTweet = (scheduleDate, html) => {
  const url = ENDPOINTS.SCHEDULE_TWEETS;

  return async () => {
    try {
      console.log('ScheduleDate',scheduleDate);
      const response = await axios.post(url, { "ScheduleDate": scheduleDate,"EmailContent": html });
      console.log('Tweet scheduled successfully:', response);

      // Display a success toast
      toast.success('Tweet successfully scheduled', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      console.error('Error scheduling Tweet:', error);

      // Display an error toast
      toast.error('Error scheduling Tweet', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  };
};