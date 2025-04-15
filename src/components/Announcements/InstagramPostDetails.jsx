import { toast } from 'react-toastify';

// import axios from 'axios';
// import { ENDPOINTS } from '../../utils/URL';

const loadFacebookSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      window.fbAsyncInit = function fbAsyncInit() {
        window.FB.init({
          appId: '698146469446483',
          cookie: true,
          xfbml: true,
          version: 'v15.0',
        });

        resolve(window.FB);
      };
    };

    script.onerror = error => {
      reject(error);
    };

    document.head.appendChild(script);
  });
};

const logInToFB = setFacebookUserAccessToken => () => {
  if (!window.FB) {
    toast.error('Facebook SDK not loaded yet. Please wait or refresh the page.');
    return;
  }
  window.FB.login(
    response => {
      setFacebookUserAccessToken(response.authResponse?.accessToken);
    },
    {
      scope: 'instagram_basic,pages_show_list',
    },
  );
};

const logOutFromFB = setFacebookUserAccessToken => () => {
  if (!window.FB) {
    toast.error('Facebook SDK not loaded yet. Please wait or refresh the page.');
    return;
  }

  window.FB.logout(() => {
    setFacebookUserAccessToken(undefined);
  });
};

export { loadFacebookSDK, logInToFB, logOutFromFB };
