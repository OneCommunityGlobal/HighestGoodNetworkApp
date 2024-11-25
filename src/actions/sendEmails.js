/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import { toast } from 'react-toastify'; // Import the toast library
import 'react-toastify/dist/ReactToastify.css'; // Import the toast styles
import { ENDPOINTS } from '../utils/URL';

export const sendEmail = (to, subject, html) => {
  const url = ENDPOINTS.POST_EMAILS;

  return async () => {
    try {
     await axios.post(url, { to, subject, html });

      // Display a success toast
      toast.success('Email successfully sent', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      // Display an error toast
      toast.error('Error sending email', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  };
};

export const broadcastEmailsToAll = (subject, html) => {
  const url = ENDPOINTS.BROADCAST_EMAILS;

  return async () => {
    try {
      await axios.post(url, { subject, html });

      // Display a success toast
      toast.success('Email successfully sent', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      // Display an error toast
      toast.error('Error sending email', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  };
};

export const updateEmailSubscription = (subscription = true) => {
  const url = ENDPOINTS.UPDATE_EMAIL_SUBSCRIPTION;

  return async () => {
    try {
      await axios.post(url, { subscription });

      // Display a success toast
      toast.success('Successfully changed email subscription', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      // Display an error toast
      toast.error('Error sending request', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  };
};

export const addNonHgnUserEmailSubscription = (email = '') => {
  const url = ENDPOINTS.NON_HGN_EMAIL_SUBSCRIPTION;

  return async () => {
    try {
      await axios.post(url, { email });

      // Display a success toast
      toast.success('Send confirmation to email', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      // Display an error toast
      toast.error('Email already exists or invalid', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  };
};

export const confirmNonHgnUserEmailSubscription = async (token = '') => {
  const url = ENDPOINTS.CONFIRM_EMAIL_SUBSCRIPTION;

  try {
    const response = await axios.post(url, { token });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export const removeNonHgnUserEmailSubscription = async (email = '') => {
  const url = ENDPOINTS.REMOVE_EMAIL_SUBSCRIPTION;

  try {
    const response = await axios.post(url, { email });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};
