import { useState, useEffect } from 'react';
import InstagramLoginButton from './InstagramLoginButton';
import './InstagramPostEditor.css';
import { getInstagramShortLivedAccessToken, getInstagramLongLivedAccessToken, postToInstagram } from '../InstagramPostDetails';
import ImageUploader from '../ImageUploadComponent/ImageUploader';
import { set } from 'lodash';

const MAX_CAPTION_CHARACTERS = 2200; 
function InstagramPostEditor({instagramAccessToken, setInstagramAccessToken}) {
  const [urlButtonVisibility, setUrlButtonVisibility] = useState(false);
  const [instagramError, setInstagramError] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [isExceedingLimit, setIsExceedingLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [urlValue, setUrlValue] = useState('');

  const handleGenerateAccessToken = async (url) => {
    console.log('Generating access token with URL:', url);

    const shortLivedToken = await getInstagramShortLivedAccessToken(url, setInstagramError);
    console.log('Short-lived access token:', shortLivedToken);

    const longLivedToken = await getInstagramLongLivedAccessToken(shortLivedToken, setInstagramError);
    console.log('Long-lived access token:', longLivedToken);

    if (longLivedToken) {
      setInstagramAccessToken(longLivedToken);
      setUrlButtonVisibility(false);
      setUrlValue('');
      setInstagramError('');
    } else {
      setUrlButtonVisibility(false);
      setUrlValue('');
    }
  }

  const handlePostToInstagram = async (caption, file) => {
    setIsLoading(true);
    const response = await postToInstagram(caption, file);

    if (response && response.success) {
      toast.success('Post created successfully!');
    } else {
      toast.error('Error creating post');
    }
    
    setCaption('');
    setFile(null);
    setIsLoading(false);
  }

  const handleUrlChange = (e) => {
    setUrlValue(e.target.value);
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
      <h2>Connection Status: {instagramAccessToken ? 'Connected' : 'Not Connected'}</h2>
      {!instagramAccessToken ? (
        <>
          <InstagramLoginButton
            className=""
            buttonText="Connect Instagram Account"
            appId={process.env.REACT_APP_INSTAGRAM_CLIENT_ID}
            redirectUri={process.env.REACT_APP_INSTAGRAM_REDIRECT_URI}
            scope={process.env.REACT_APP_INSTAGRAM_SCOPE}
            setUrlButtonVisibility={setUrlButtonVisibility}
            onLoginSuccess={() => {
              console.log('Instagram login successful!');
            }}
          />
  
          {urlButtonVisibility && (
            <div>
              <textarea 
                className=""
                placeholder='Enter URL here'
                id="url" 
                value={urlValue} 
                onChange={handleUrlChange}
              />
              <button 
                className=""
                onClick={() => {
                  handleGenerateAccessToken(urlValue);
                }}
              >
                Generate Access Token
              </button>
            </div>
          )}

          {instagramError && <p className="error">{instagramError}</p>}
        </>
      ) : (
        <div className="instagram-editor-container">
          <div className="instagram-post-preview-container">
            <h4>Instagram Post Preview</h4>
            <div className="instagram-post-preview">

              {/* upload image */ }
              <ImageUploader onImageSelect={handleFileSelect} />
              
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
              disabled={isExceedingLimit || !file}
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