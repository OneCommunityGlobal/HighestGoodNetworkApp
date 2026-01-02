import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';

/**
 * Loads the Facebook SDK dynamically
 */
export const loadFacebookSDK = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded AND initialized
    if (window.FB && window.fbSDKInitialized) {
      resolve(window.FB);
      return;
    }

    // Check if script is already being loaded
    if (document.getElementById('facebook-jssdk')) {
      // Wait for it to initialize
      const checkFB = setInterval(() => {
        if (window.FB && window.fbSDKInitialized) {
          clearInterval(checkFB);
          resolve(window.FB);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkFB);
        reject(new Error('Facebook SDK initialization timeout'));
      }, 10000);
      return;
    }

    // Set up the async init callback BEFORE loading script
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.REACT_APP_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v19.0',
      });
      window.fbSDKInitialized = true;
      console.log('[FacebookSDK] Initialized successfully');
      resolve(window.FB);
    };

    // Load the SDK
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));

    // Insert before first script tag (Facebook's recommended approach)
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  });
};

export const getFacebookConnectionStatus = () => async () => {
  try {
    const { data } = await axios.get(ENDPOINTS.FACEBOOK_AUTH_STATUS);
    return data;
  } catch (error) {
    console.error('[FacebookAuth] Failed to get connection status:', error.message);
    return { connected: false, error: error.message };
  }
};

export const initiateFacebookLogin =
  ({ requestor }) =>
  async () => {
    try {
      const FB = await loadFacebookSDK();

      return new Promise((resolve, reject) => {
        FB.login(
          response => {
            if (response.authResponse) {
              const { accessToken, userID, grantedScopes } = response.authResponse;

              axios
                .post(ENDPOINTS.FACEBOOK_AUTH_CALLBACK, {
                  accessToken,
                  userID,
                  grantedScopes,
                  requestor,
                })
                .then(({ data }) => {
                  if (data.success && data.pages?.length > 0) {
                    resolve({
                      success: true,
                      pages: data.pages,
                      userToken: data.userToken,
                      grantedScopes: data.grantedScopes,
                    });
                  } else if (data.pages?.length === 0) {
                    toast.error(
                      'No Facebook Pages found. Make sure you have admin access to a Page.',
                    );
                    reject(new Error('No pages found'));
                  } else {
                    reject(new Error(data.error || 'Failed to authenticate'));
                  }
                })
                .catch(err => {
                  const detail =
                    err.response?.data?.details ||
                    err.response?.data?.error ||
                    err.message;
                  toast.error(`Facebook authentication failed: ${detail}`);
                  reject(err);
                });
            } else {
              toast.info('Facebook login was cancelled.');
              reject(new Error('Login cancelled'));
            }
          },
          {
            scope: 'pages_show_list,pages_read_engagement,pages_manage_posts',
            return_scopes: true,
          },
        );
      });
    } catch (error) {
      toast.error(`Failed to initialize Facebook login: ${error.message}`);
      throw error;
    }
  };

export const connectFacebookPage =
  ({ pageId, pageName, pageAccessToken, userToken, grantedScopes, requestor }) =>
  async () => {
    try {
      const { data } = await axios.post(ENDPOINTS.FACEBOOK_AUTH_CONNECT, {
        pageId,
        pageName,
        pageAccessToken,
        userToken,
        grantedScopes,
        requestor,
      });

      if (data.success) {
        toast.success(`Connected to ${pageName || 'Facebook Page'}`);
        return data;
      }
      throw new Error(data.error || 'Failed to connect page');
    } catch (error) {
      const detail =
        error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to connect Facebook Page: ${detail}`);
      throw error;
    }
  };

export const disconnectFacebookPage =
  ({ requestor }) =>
  async () => {
    try {
      const { data } = await axios.post(ENDPOINTS.FACEBOOK_AUTH_DISCONNECT, { requestor });

      if (data.success) {
        toast.success('Facebook Page disconnected');
        return data;
      }
      throw new Error(data.error || 'Failed to disconnect');
    } catch (error) {
      const detail =
        error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to disconnect Facebook: ${detail}`);
      throw error;
    }
  };

export const verifyFacebookConnection = () => async () => {
  try {
    const { data } = await axios.post(ENDPOINTS.FACEBOOK_AUTH_VERIFY);
    return data;
  } catch (error) {
    console.error('[FacebookAuth] Verify failed:', error.message);
    return { valid: false, error: error.message };
  }
};
