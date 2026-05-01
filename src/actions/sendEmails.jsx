/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import { toast } from 'react-toastify'; // Import the toast library
// import 'react-toastify/dist/ReactToastify.css'; // Import the toast styles
import { ENDPOINTS } from '~/utils/URL';
import styles from './ToastStyles.module.css'; // Import the CSS module

export const sendEmail = (to, subject, html) => {
  const url = ENDPOINTS.POST_EMAILS;

  return async () => {
    try {
      const response = await axios.post(url, { to, subject, html });
      toast.info('Email sent successfully:', response);

      // Display a success toast
      toast.success('Email successfully sent', {
        position: 'top-right', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      toast.error('Error sending email:', error);

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
      const response = await axios.post(url, { subject, html });
      toast.info('Email sent successfully:', response);

      // Display a success toast
      toast.success('Email successfully sent', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      toast.error('Error sending email:', error);

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
      const response = await axios.post(url, { subscription });
      toast.info('Email sent successfully:', response);

      // Display a success toast
      toast.success('Successfully changed email subcription', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    } catch (error) {
      toast.error('Error sending email:', error);

      // Display an error toast
      toast.error('Error sending request', {
        position: 'top-center', // You can adjust the position as needed
        autoClose: 3000, // Close the toast after 3 seconds (adjust as needed)
      });
    }
  };
};

export const addNonHgnUserEmailSubscription = (email, triggerConfetti) => {
  const url = ENDPOINTS.NON_HGN_EMAIL_SUBSCRIPTION;

  return async () => {
    try {
      await axios.post(url, { email });

      // Display a success toast with a styled close button
      toast.success(
        <div className={styles.toastContent}>
          <p className={styles.toastMessage}>
            A confirmation email has been sent to your email address. Please check your inbox and
            confirm your subscription. Be sure to check your spam folder if you don’t see it.
          </p>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(); // Close the toast
              triggerConfetti(); // Trigger the confetti effect
            }}
            className={styles.closeButton}
          >
            Close
          </button>
        </div>,
        {
          position: 'top-center',
          autoClose: false, 
          closeOnClick: false, 
          closeButton: false, 
        }
      );
    } catch (error) {
      toast.error(
        <div>
          <p>
            Email already exists or is invalid. Please try again.
          </p>
        </div>,
        {
          position: 'top-center',
          autoClose: 3000, // Auto-close after 3 seconds
        }
      );
    }
  };
};

export const confirmNonHgnUserEmailSubscription = async (token = '') => {
  const url = ENDPOINTS.CONFIRM_EMAIL_SUBSCRIPTION;

  try {
    const response = await axios.post(url, { token });

    // Display a success toast
    // toast.success('Successfully confirmed email subscription', {
    //   position: 'top-center',
    //   autoClose: 3000,
    // });

    return { success: true, data: response.data };
  } catch (error) {
    toast.error('Error sending email:', error);

    // Display an error toast
    // toast.error('Error sending request', {
    //   position: 'top-center',
    //   autoClose: 3000,
    // });

    return { success: false, error };
  }
};

export const removeNonHgnUserEmailSubscription = (email = '') => {
  const url = ENDPOINTS.REMOVE_EMAIL_SUBSCRIPTION;

  return async () => {
    try {
      await axios.post(url, { email });
      // Return success result
      return { success: true };
    } catch (error) {
      // Extract error message from the response or use a default message
      const errorMessage =
        error.response?.data?.message || 'Email not found or already unsubscribed.';

      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 3000,
      });

      // Return failure result
      return { success: false, message: errorMessage };
    }
  };
};