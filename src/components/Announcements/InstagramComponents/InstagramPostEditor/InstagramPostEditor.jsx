import { useState, useEffect } from 'react';
import InstagramLoginButton from '../InstagramLoginButton';
import './InstagramPostEditor.css';
import { postToInstagram, checkInstagramAuthStatus, disconnectFromInstagram } from '../helpers/InstagramPostHelpers';
import ImageUploader from '../ImageUploader';
import InstagramScheduledPostsEditor from '../InstagramScheduledPostEditor/InstagramScheduledPostsEditor';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getInstagramScheduledPosts, scheduleInstagramPost, deleteInstagramScheduledPost } from '../helpers/InstagramSchedulePostHelpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faClock, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const MAX_CAPTION_CHARACTERS = 2200; 
function InstagramPostEditor({instagramConnectionStatus, setInstagramConnectionStatus}) {
  const [characterCount, setCharacterCount] = useState(0);
  const [isExceedingLimit, setIsExceedingLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [imageResetKey, setImageResetKey] = useState(0);

  const [instagramAuthInfo, setInstagramAuthInfo] = useState({
    hasValidToken: false,
    tokenExpires: null,
    userId: null,
    timestamp: null,
  });
  const [buttonTextState, setButtonTextState] = useState("");
  const [scheduledButtonTextState, setScheduledButtonTextState] = useState("");

  const [instagramError, setInstagramError] = useState('');
  const [scheduledPostsError, setScheduledPostsError] = useState('');

  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoadingScheduledPosts, setIsLoadingScheduledPosts] = useState(false);

  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [minTime, setMinTime] = useState(new Date());

  // check connection status when component mounts
  useEffect(() => {
    handleInstagramLoginSuccess();
    getInstagramScheduledPosts(
      setScheduledPosts, 
      setScheduledPostsError, 
      setIsLoadingScheduledPosts
    );
  }, []);


  useEffect(() => {
    if (!startDate) return;

    const now = new Date();

    if (startDate.toDateString() === now.toDateString()) {
      setMinTime(now);
    } else {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      setMinTime(midnight);
    }
  }, [startDate]);

  const handleDateChange = (date) => {
    setStartDate(date);
    setIsScheduled(false);
  }

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
    setIsPosting(true);
    const response = await postToInstagram(caption, file, setInstagramError, setCaption, setFile, setImageResetKey, setButtonTextState);

    if (response && response.success) {
      toast.success('Post created successfully!');
    } else {
      toast.error('Error creating post');
    }
    setIsLoading(false);
    setIsPosting(false);
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

  const handleDeletePost = async (postId) => {
    const response = await deleteInstagramScheduledPost(postId, setScheduledPostsError);
    if (response && response.success) {
      toast.success('Post deleted successfully!');
    } else {
      toast.error('Error deleting post');
    }
    getInstagramScheduledPosts(
      setScheduledPosts, 
      setScheduledPostsError, 
      setIsLoadingScheduledPosts
    );
  }

  const handleSchedulePost = () => {
    setScheduledButtonTextState("Scheduling post...");
    setIsScheduling(true);
    scheduleInstagramPost(
      startDate, 
      caption, 
      file, 
      setScheduledButtonTextState, 
      setScheduledPostsError
    ).then((response) => {
      if (response && response.success) {
        toast.success('Post scheduled successfully!');
        getInstagramScheduledPosts(
          setScheduledPosts, 
          setScheduledPostsError, 
          setIsLoadingScheduledPosts
        );
        setCaption('');
        setFile(null);
        setImageResetKey(prevKey => prevKey + 1);
        setStartDate(null);
      }
    });
    setIsScheduling(false);
    setScheduledButtonTextState("");
  }

  const handleInstagramDisconnect = () => {
    disconnectFromInstagram(setInstagramError);
    checkInstagramAuthStatus(setInstagramError);
    setInstagramConnectionStatus(false);
    setInstagramAuthInfo({
      hasValidToken: false,
      tokenExpires: null,
      userId: null,
      timestamp: null,
    });
    setInstagramError('Disconnected from Instagram');
  }

  return (
    <div className='instagram-post-editor'>
      <h2 className="connection-status-header">
        <div className="connection-status-badge">
          {instagramConnectionStatus ? (
            <>
              <span className="connection-badge connected">
                <FontAwesomeIcon icon={faCheckCircle} /> Connected
                <span className="expiry-info">
                  <FontAwesomeIcon icon={faClock} /> Expires: {
                    instagramAuthInfo.tokenExpires 
                      ? new Date(instagramAuthInfo.tokenExpires).toLocaleString() 
                      : 'N/A'
                  }
                </span>
              </span>
              <button 
                className="disconnect-button" 
                onClick={handleInstagramDisconnect}
                title="Disconnect from Instagram"
              >
                <FontAwesomeIcon icon={faSignOutAlt} /> Disconnect
              </button>
            </>
          ) : (
            <span className="connection-badge disconnected">
              <FontAwesomeIcon icon={faTimesCircle} /> Disconnected
            </span>
          )}
        </div>
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

          {instagramError && <p className="instagram-error">{instagramError}</p>}
        </div>
      ) : (
        <div className="instagram-editor-container">
          <div className="instagram-post-preview-container">
            <div className='instagram-post-preview-header'>
              <h3>Instagram Post Preview</h3>
            </div>
            <div className="instagram-post-preview">
              
              {/* upload image */ }
              <ImageUploader 
                onImageSelect={handleFileSelect} 
                resetKey={imageResetKey} 
              />
              
              {/* caption textarea */}
              <textarea 
                className="instagram-caption-textarea"
                placeholder='Write a caption... (e.g. use engaging captions that are concise, add value, and include a call to action. Some examples include: "Ready to take on the week? ✨" ) and use hashtags to increase visibility. (e.g. #MondayMotivation #Inspiration)'
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
            <div className="post-buttons-container">
              <button 
                // type="button"
                className="schedule-post-instagram-button"
                disabled={ isExceedingLimit ||!caption || !file || isLoading }
                title={
                  isExceedingLimit ? "Caption exceeds character limit" : 
                  !file ? "Please select an image" :
                  !caption ? "Please enter a caption" : 
                  isLoading ? "Loading..." : ""
                }
                onClick={() => {
                  console.log('Caption:', caption);
                  console.log('File:', file);
                  handlePostToInstagram(caption, file);
                }}
              >
                <span className="button-text">
                  {buttonTextState || "Post to Instagram"}
                  {isPosting && <div className="spinner"></div>}
                </span>
              </button>
              

              <div className="schedule-post-button-container">
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  showTimeSelect
                  timeIntervals={15}
                  minDate={new Date()}
                  minTime={minTime}
                  maxTime={new Date().setHours(23, 59, 59)}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="date-picker"
                  placeholderText="Select date and time"
                  isClearable
                  clearButtonTitle="Clear date"
                />
                <button
                  // type="button"
                  className="schedule-post-instagram-button"
                  onClick={handleSchedulePost}
                  disabled={isLoading || !startDate || isExceedingLimit || !caption || !file}
                  title={
                    !startDate ? "Please select a date and time" :
                    isExceedingLimit ? "Caption exceeds character limit" : 
                    !file ? "Please select an image" :
                    !caption ? "Please enter a caption" : 
                    isLoading ? "Loading..." : ""
                  }
                >
                  <span className="button-text">
                  {scheduledButtonTextState || "Schedule Post"}
                  {isScheduling && <div className="spinner"></div>}
                </span>
                </button>
              </div>
            </div>

            {instagramError && <p className="instagram-error">{instagramError}</p>}

          </div>
          
          {/* scheduled post section */ }
          <InstagramScheduledPostsEditor 
            posts={scheduledPosts} 
            isLoading={isLoadingScheduledPosts}
            error={scheduledPostsError}
            onDeletePost={(postId) => {
              console.log('Deleting post:', postId);
              handleDeletePost(postId);
            }}
            onRefresh={() => {
              getInstagramScheduledPosts(
                setScheduledPosts,
                setScheduledPostsError,
                setIsLoadingScheduledPosts
              );
            }}
          />
          {/* <div className="scheduled-posts-container">
            <h4>Scheduled Posts</h4>
            <div className="">
              {scheduledPosts.length > 0 ? (
                scheduledPosts.map((post, index) => (
                  <div key={index} className="">
                    <p>Caption: {post.caption}</p>
                    <p>Image: {post.imageUrl}</p>
                    <p>Scheduled Time: {new Date(post.scheduledTime).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p>No scheduled posts</p>
              )}
            </div>
          </div> */}
        </div> 
      )}
    </div>
  );
}

export default InstagramPostEditor;