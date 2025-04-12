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

const loginToInstagram = () => {
  const authURL =
    'https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1867021637446444&redirect_uri=https://hgn-rest-beta.azurewebsites.net/api/Announcements&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights';

  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const popup = window.open(
    authURL,
    'instagram-auth-popup',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,scrollbars=1`,
  );

  if (!popup) {
    toast.error('Failed to open Instagram login popup');
  }

  // const redirectUri = 'https://localhost:3000/Announcements';
  // const urlParams = new URLSearchParams(popup.location.search);
  // console.log('URL params:', urlParams.toString());

  // Poll the popup location to detect redirect
  // const popupTimer = setInterval(() => {
  //   // console.log('Checking popup location, current URL:', popup.location.href);
  //   try {
  //     // When popup redirects to our redirect_uri
  //     if (popup.location.href.includes(redirectUri)) {
  //       clearInterval(popupTimer);

  //       // Extract code from URL
  //       const urlParams = new URLSearchParams(popup.location.search);
  //       const code = urlParams.get('code');

  //       if (code) {
  //         console.log('Got Instagram authorization code:', code);

  //         // Call your token exchange function
  //         // exchangeCodeForToken(code, setInstagramUserAccessToken);

  //         // Close the popup
  //         popup.close();
  //       } else {
  //         toast.error('Failed to get authorization code');
  //         popup.close();
  //       }
  //     }
  //   } catch (error) {
  //     // Cross-origin errors will occur until the redirect happens
  //     // Just ignore them
  //   }
  // }, 500);
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

export { loadFacebookSDK, logInToFB, logOutFromFB, loginToInstagram };
