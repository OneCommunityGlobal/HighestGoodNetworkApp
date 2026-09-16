import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import { SET_FB_CONNECTION_LOADING, SET_FB_CONNECTION_STATUS } from '~/reducers/facebookReducer';

export const loadFacebookSDK = () =>
  new Promise((resolve, reject) => {
    if (window.FB && window.fbSDKInitialized) {
      resolve(window.FB);
      return;
    }

    if (document.getElementById('facebook-jssdk')) {
      const checkFB = setInterval(() => {
        if (window.FB && window.fbSDKInitialized) {
          clearInterval(checkFB);
          resolve(window.FB);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkFB);
        reject(new Error('Facebook SDK initialization timeout'));
      }, 10000);
      return;
    }

    window.fbAsyncInit = function initializeFacebookSDK() {
      window.FB.init({
        appId: process.env.REACT_APP_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v19.0',
      });
      window.fbSDKInitialized = true;
      resolve(window.FB);
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript?.parentNode) firstScript.parentNode.insertBefore(script, firstScript);
    else document.head.appendChild(script);
  });

export const getFacebookConnectionStatus = () => async dispatch => {
  dispatch({ type: SET_FB_CONNECTION_LOADING, payload: true });
  try {
    const { data } = await axios.get(ENDPOINTS.FACEBOOK_AUTH_STATUS);
    dispatch({ type: SET_FB_CONNECTION_STATUS, payload: data });
    return data;
  } catch (error) {
    const fallback = { error: error.message };
    dispatch({ type: SET_FB_CONNECTION_STATUS, payload: fallback });
    return fallback;
  }
};

export const initiateFacebookLogin = () => async () => {
    try {
      const FB = await loadFacebookSDK();

      return new Promise((resolve, reject) => {
        FB.login(
          response => {
            if (!response.authResponse) {
              toast.info('Facebook login was cancelled.');
              reject(new Error('Login cancelled'));
              return;
            }

            const { accessToken, userID, grantedScopes } = response.authResponse;
            axios
              .post(ENDPOINTS.FACEBOOK_AUTH_CALLBACK, {
                accessToken,
                userID,
                grantedScopes,
              })
              .then(({ data }) => {
                if (data.success && data.pages?.length > 0) {
                  resolve({
                    success: true,
                    pages: data.pages,
                    selectionNonce: data.selectionNonce,
                  });
                } else if (data.pages?.length === 0) {
                  toast.error('No Facebook Pages found. Make sure you have admin access to a Page.');
                  reject(new Error('No pages found'));
                } else {
                  reject(new Error(data.error || 'Failed to authenticate'));
                }
              })
              .catch(error => {
                const detail =
                  error.response?.data?.details || error.response?.data?.error || error.message;
                toast.error(`Facebook authentication failed: ${detail}`);
                reject(error);
              });
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
  ({ pageId, pageName, selectionNonce }) =>
  async dispatch => {
    try {
      const { data } = await axios.post(ENDPOINTS.FACEBOOK_AUTH_CONNECT, {
        pageId,
        pageName,
        selectionNonce,
      });
      if (!data.success) throw new Error(data.error || 'Failed to connect page');
      toast.success(`Connected to ${pageName || 'Facebook Page'}`);
      await dispatch(getFacebookConnectionStatus());
      return data;
    } catch (error) {
      const detail = error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to connect Facebook Page: ${detail}`);
      throw error;
    }
  };

export const disconnectFacebookPage = () => async dispatch => {
    try {
      const { data } = await axios.post(ENDPOINTS.FACEBOOK_AUTH_DISCONNECT, {});
      if (!data.success) throw new Error(data.error || 'Failed to disconnect');
      toast.success('Facebook Page disconnected');
      await dispatch(getFacebookConnectionStatus());
      return data;
    } catch (error) {
      const detail = error.response?.data?.details || error.response?.data?.error || error.message;
      toast.error(`Failed to disconnect Facebook: ${detail}`);
      throw error;
    }
};
