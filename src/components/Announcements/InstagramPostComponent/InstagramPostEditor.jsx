import { useState, useEffect } from 'react';
import InstagramLoginButton from './InstagramLoginButton';
import './InstagramPostEditor.css';
import { postToInstagram, checkInstagramAuthStatus } from '../InstagramPostDetails';
import ImageUploader from '../ImageUploadComponent/ImageUploader';
import { set } from 'lodash';
import { check } from 'prettier';
import { timestamp } from 'joi/lib/types/date';
import { toast } from 'react-toastify';

const MAX_CAPTION_CHARACTERS = 2200; 
function InstagramPostEditor({instagramConnectionStatus, setInstagramConnectionStatus}) {
  const [instagramError, setInstagramError] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isExceedingLimit, setIsExceedingLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageResetKey, setImageResetKey] = useState(0);

  const [instagramAuthInfo, setInstagramAuthInfo] = useState({
    hasValidToken: false,
    tokenExpires: null,
    userId: null,
    timestamp: null,
  });

  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);

  const handleInstagramLoginSuccess = async () => {
    const status = await checkInstagramAuthStatus(setInstagramError);
    console.log('status from handleInstagramLoginSuccess:', status);

    if (status && status.success === true) {
      console.log('Instagram login successful');
      setInstagramConnectionStatus(true);
      setInstagramError('');
      setInstagramAuthInfo({
        hasValidToken: status.data.hasValidToken,
        tokenExpires: status.data.tokenExpires,
        userId: status.data.userId,
        timestamp: status.timestamp,
      });
    } else {
      setInstagramError('Failed to retrieve access token. Please try again.');
      setInstagramConnectionStatus(false);
    }
  }

  const handlePostToInstagram = async (caption, file) => {
    setIsLoading(true);
    const response = await postToInstagram(caption, file, setInstagramError, setCaption, setFile, setImageResetKey);

    if (response && response.success) {
      toast.success('Post created successfully!');
    } else {
      toast.error('Error creating post');
    }
    setIsLoading(false);
  }

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    console.log('File selected:', selectedFile);
  };

  const getCharacterCount = (text) => {
    return [...text].length; 
  };

  const handleCaptionChange = (e) => {
    const newCaption = e.target.value;
    const characterCount = getCharacterCount(newCaption);

    setCharacterCount(characterCount);
    setIsExceedingLimit(characterCount > MAX_CAPTION_CHARACTERS);

    setCaption(e.target.value);
  }

  return (
    <div className='instagram-post-editor'>
      <h2>Connection Status: {instagramConnectionStatus ? (
        <div className="connected-status">
          Connected
          <span className="connected-icon">✔️</span>
          <div className="connected-status-token-expiry">
            Token Expiry: {instagramAuthInfo.tokenExpires ?
              new Date(instagramAuthInfo.tokenExpires).toLocaleString() : 'N/A'}
          </div>
        </div>
        ) : 'Not Connected'}
      </h2>
      {!instagramConnectionStatus ? (
        <div className="instagram-login-container">
          <InstagramLoginButton
            className="instagram-login-button"
            buttonText="Connect Instagram Account"
            appId={process.env.REACT_APP_INSTAGRAM_CLIENT_ID}
            redirectUri={process.env.REACT_APP_INSTAGRAM_REDIRECT_URI}
            scope={process.env.REACT_APP_INSTAGRAM_SCOPE}
            onLoginSuccess={() => {
              handleInstagramLoginSuccess();
            }}
          />

          {instagramError && <p className="error">{instagramError}</p>}
        </div>
      ) : (
        <div className="instagram-editor-container">
          <div className="instagram-post-preview-container">
            <h4>Instagram Post Preview</h4>
            <div className="instagram-post-preview">

              {/* upload image */ }
              <ImageUploader 
                onImageSelect={handleFileSelect} 
                resetKey={imageResetKey} 
              />
              
              {/* caption textarea */}
              <textarea 
                className="instagram-caption-textarea"
                placeholder='Write a caption...'
                onChange={(e) => handleCaptionChange(e)}
                value={caption}
              />
              {/* character count */}
              <div className="caption-character-count">
                <span className={isExceedingLimit ? 'exceeding-limit' : ''}>
                  {characterCount}/{MAX_CAPTION_CHARACTERS} characters
                </span>
                {isExceedingLimit && 
                  <span className="limit-warning">
                    Character limit exceeded!
                  </span>
                }
              </div>
            </div>

            {/* post button */}
            <button 
              type="button"
              className="send-button"
              disabled={isExceedingLimit || !file || isLoading}
              onClick={() => {
                console.log('Caption:', caption);
                console.log('File:', file);
                handlePostToInstagram(caption, file);
              }}
            >
              Post to Instagram
            </button>
          </div>
          
          {/* scheduled post section */ }
          <div className="instagram-scheduled-posts-container">
            <h4>Scheduled Posts</h4>
          </div>
        </div> 
      )}
    </div>
  );
}

export default InstagramPostEditor;