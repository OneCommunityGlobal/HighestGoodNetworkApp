import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { toast } from "react-toastify";


export const getInstagramShortLivedAccessToken = async (url, setInstagramError) => {
  console.log("URL to generate access token:", url);

  try {
    const cleanUrl = url.split("#")[0];

    const urlParts = cleanUrl.split("?");

    if (urlParts.length < 2) {
      setInstagramError("Invalid URL format: No query parameters found");
      return;
    }

    const urlParams = new URLSearchParams(urlParts[1]);
    const code = urlParams.get('code');

    if (!code) {
      setInstagramError("No code parameter found in URL");
      return;
    }

    console.log("Extracted code:", code);

    const response = await axios.post(ENDPOINTS.GET_INSTAGRAM_SHORT_LIVED_ACCESS_TOKEN, {
      code: code,
      grant_type: 'authorization_code'
    });


    if (response.data && response.data.success) {

      console.log("Short-lived access token response:", response.data);
      const { access_token, user_id } = response.data;

      return access_token;

    } else {
      const errorMessage = response.data?.message || "Unknown error occurred";
      setInstagramError(errorMessage);
      toast.error(errorMessage);
      return null;
    }

  } catch (error) {
    console.error("Error generating Instagram access token:", error);
    setInstagramError("Error generating Instagram access token");
  }
}

export const getInstagramLongLivedAccessToken = async (shortLivedToken, setInstagramError) => {
  console.log("received short-lived token:", shortLivedToken);
  try {
    if (!shortLivedToken) {
      setInstagramError("Short-lived token is required to generate long-lived token");
      return null;
    }

    const response = await axios.post(ENDPOINTS.GET_INSTAGRAM_LONG_LIVED_ACCESS_TOKEN, {
      shortLivedToken: shortLivedToken,
    });

    if (response.data && response.data.success) {

      console.log(response.data.message);
      const { access_token, token_type, expires_in } = response.data;
      toast.success(response.data.message);
      return access_token;

    } else {

      const errorMessage = response.data?.message || "Unknown error occurred";
      setInstagramError(errorMessage);
      toast.error(errorMessage);
      return null;

    }

  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Error generating long-lived Instagram access token";
    
    setInstagramError(errorMessage);
    toast.error(errorMessage);
    return null;
  }
}

const convertToJPG = (file) => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
          const img = new Image();
          img.src = event.target.result;

          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;

              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              canvas.toBlob((blob) => {
                  if (!blob) {
                      reject(new Error('Failed to convert image to JPG'));
                      return;
                  }

                  const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';

                  const convertedFile = new File(
                      [blob],
                      fileName,
                      { type: 'image/jpeg' }
                  );

                  resolve(convertedFile);
              }, 'image/jpeg');
          };

          img.onerror = (error) => {
              reject(error);
          }
      }

      reader.onerror = (error) => {
          reject(new Error('FileReader error: ' + error.message));
      };
  });
};

export const postToInstagram = async (caption, file, setInstagramError) => {
  try {
    if (!caption) {
      setInstagramError("No caption provided. Please enter a caption for the post.");
      return null;
    }

    if (!file) {
      setInstagramError("No file provided. Please select an image to upload.");
      return null;
    }


  } catch (error) {
    console.error("Error in postToInstagram:", error);
    setInstagramError("Error in postToInstagram");
    return null;
  }
}