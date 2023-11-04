/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import { toast } from 'react-toastify'; // Import the toast library
import 'react-toastify/dist/ReactToastify.css'; // Import the toast styles
import { ENDPOINTS } from '../utils/URL';

export const sendEmail = (to, subject, html) => {
  const url = ENDPOINTS.POST_EMAILS;

  return async () => {
    try {
      const response = await axios.post(url, { to, subject, html });
      console.log('Email sent successfully:', response);

      // Display a success toast
      toast.success('Email successfully sent', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      console.error('Error sending email:', error);

      // Display an error toast
      toast.error('Error sending email', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  };
};
