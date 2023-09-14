/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export const sendEmail = (to, subject, html) => {
  const url = ENDPOINTS.POST_EMAILS;

  return async () => {
    try {
      const response = await axios.post(url, { to, subject, html });
      console.log('Email sent successfully:', response.data.message);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
};
