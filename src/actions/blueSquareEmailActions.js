import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../utils/URL';

/**
 * Trigger resend of Blue Square infringement emails
 * @returns {Promise} Promise that resolves with the API response
 */
export const resendBlueSquareEmails = () => {
  return async () => {
    try {
      const response = await axios.post(ENDPOINTS.BLUE_SQUARE_RESEND_INFRINGEMENT_EMAILS());
      
      // Show success message
      toast.success('✅ Email resend triggered. Check server logs for delivery confirmation.', {
        position: 'top-right',
        autoClose: 5000,
      });
      
      return response;
    } catch (error) {
      // Handle different types of errors
      let errorMessage = 'Failed to trigger email resend.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to trigger email resends.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred while triggering email resend.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      
      throw error;
    }
  };
};

/**
 * Trigger resend of weekly summary emails
 * @returns {Promise} Promise that resolves with the API response
 */
export const resendWeeklySummaryEmails = () => {
  return async () => {
    try {
      const response = await axios.post(ENDPOINTS.BLUE_SQUARE_RESEND_WEEKLY_SUMMARY_EMAILS());
      
      // Show success message
      toast.success('✅ Weekly summary resend triggered. Check server logs to verify.', {
        position: 'top-right',
        autoClose: 5000,
      });
      
      return response;
    } catch (error) {
      // Handle different types of errors
      let errorMessage = 'Failed to trigger weekly summary resend.';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to trigger weekly summary resends.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred while triggering weekly summary resend.';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      
      throw error;
    }
  };
}; 