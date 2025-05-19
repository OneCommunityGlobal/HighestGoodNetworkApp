import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import InstagramLoginButton from '../InstagramLoginButton';
import './InstagramPostEditor.css';
import {
  postToInstagram,
  checkInstagramAuthStatus,
  disconnectFromInstagram,
} from '../helpers/InstagramPostHelpers';
import ImageUploader from '../ImageUploader';
import InstagramScheduledPostsEditor from '../InstagramScheduledPostEditor/InstagramScheduledPostsEditor';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getInstagramScheduledPosts,
  scheduleInstagramPost,
  deleteInstagramScheduledPost,
} from '../helpers/InstagramSchedulePostHelpers';

const MAX_CAPTION_CHARACTERS = 2200;

/**
 * Instagram Post Editor component that allows users to create, schedule, and manage Instagram posts
 *
 * @param {boolean} instagramConnectionStatus - Whether the user is connected to Instagram
 * @param {function} setInstagramConnectionStatus - Function to update Instagram connection status
 * @returns {JSX.Element} Instagram post editor interface
 */
function InstagramPostEditor({ instagramConnectionStatus, setInstagramConnectionStatus }) {
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
  const [buttonTextState, setButtonTextState] = useState('');
  const [scheduledButtonTextState, setScheduledButtonTextState] = useState('');

  const [instagramError, setInstagramError] = useState('');
  const [scheduledPostsError, setScheduledPostsError] = useState('');

  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoadingScheduledPosts, setIsLoadingScheduledPosts] = useState(false);

  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [minTime, setMinTime] = useState(new Date());

  /**
   * Attempts to authenticate with Instagram and sets connection state
   *
   * @returns {Promise<void>}
   */
  const handleInstagramLoginSuccess = async () => {
    const status = await checkInstagramAuthStatus(setInstagramError);

    if (status && status.success === true) {
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
  };

  // check connection status when component mounts
  useEffect(() => {
    handleInstagramLoginSuccess();
    getInstagramScheduledPosts(
      setScheduledPosts,
      setScheduledPostsError,
      setIsLoadingScheduledPosts,
    );
  }, []);

  /**
   * Updates minimum allowed time for scheduled posts based on selected date
   */
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

  /**
   * Handles date selection for post scheduling
   *
   * @param {Date} date - Selected date and time for scheduling
   */
  const handleDateChange = date => {
    setStartDate(date);
  };

  /**
   * Handles Instagram login failure and sets error message
   */
  const handleInstagramLoginFailure = () => {
    setInstagramError('Failed to connect to Instagram. Please try again.');
    setInstagramConnectionStatus(false);
  };

  /**
   * Sends a post immediately to Instagram
   *
   * @param {string} caption - Text caption for the post
   * @param {File} file - Image file to upload
   * @returns {Promise<void>}
   */
  const handlePostToInstagram = async () => {
    setIsLoading(true);
    setIsPosting(true);
    const response = await postToInstagram(
      caption,
      file,
      setInstagramError,
      setCaption,
      setFile,
      setImageResetKey,
      setButtonTextState,
    );

    if (response && response.success) {
      toast.success('Post created successfully!');
    } else {
      toast.error('Error creating post');
    }
    setIsLoading(false);
    setIsPosting(false);
  };

  const handleFileSelect = selectedFile => {
    setFile(selectedFile);
  };

  const getCharacterCount = text => {
    return [...text].length;
  };

  /**
   * Updates caption text and validates against character limits
   *
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - Change event
   */
  const handleCaptionChange = e => {
    const newCaption = e.target.value;
    const newCharacterCount = getCharacterCount(newCaption);

    setCharacterCount(newCharacterCount);
    setIsExceedingLimit(newCharacterCount > MAX_CAPTION_CHARACTERS);

    setCaption(e.target.value);
  };

  /**
   * Deletes a scheduled Instagram post
   *
   * @param {string} postId - ID of the post to delete
   * @returns {Promise<void>}
   */
  const handleDeletePost = async postId => {
    const response = await deleteInstagramScheduledPost(postId, setScheduledPostsError);
    if (response && response.success) {
      toast.success('Post deleted successfully!');
    } else {
      toast.error('Error deleting post');
    }
    getInstagramScheduledPosts(
      setScheduledPosts,
      setScheduledPostsError,
      setIsLoadingScheduledPosts,
    );
  };

  /**
   * Schedules a post for future publication
   *
   * @returns {Promise<void>}
   */
  const handleSchedulePost = async () => {
    setIsLoading(true);
    setScheduledButtonTextState('Scheduling post...');
    setIsScheduling(true);

    try {
      const response = await scheduleInstagramPost(
        startDate,
        caption,
        file,
        setScheduledButtonTextState,
        setScheduledPostsError,
      );

      if (response && response.success) {
        toast.success('Post scheduled successfully!');
        getInstagramScheduledPosts(
          setScheduledPosts,
          setScheduledPostsError,
          setIsLoadingScheduledPosts,
        );
        setCaption('');
        setFile(null);
        setImageResetKey(prevKey => prevKey + 1);
        setStartDate(null);
      } else {
        toast.error('Failed to schedule post');
      }
    } catch (error) {
      toast.error('Error scheduling post');
    } finally {
      // Only reset states after completion (success or error)
      setIsScheduling(false);
      setScheduledButtonTextState('');
      setIsLoading(false);
    }
  };

  /**
   * Disconnects from Instagram and resets authentication state
   */
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
  };

  /**
   * Returns the button title based on the current state of the form
   * @returns {string} Button title
   * */
  const getButtonTitle = () => {
    if (isExceedingLimit) return 'Caption exceeds character limit';
    if (!file) return 'Please select an image';
    if (!caption) return 'Please enter a caption';
    if (isLoading) return 'Loading...';
    return '';
  };

  /**
   * Returns the schedule button title based on the current state of the form
   * @returns {string} Button title
   * */
  const getScheduleButtonTitle = () => {
    if (!startDate) return 'Please select a date and time';
    if (isExceedingLimit) return 'Caption exceeds character limit';
    if (!file) return 'Please select an image';
    if (!caption) return 'Please enter a caption';
    if (isLoading) return 'Loading...';
    return '';
  };

  return (
    <div className="instagram-post-editor">
      <h2 className="connection-status-header">
        <div className="connection-status-badge">
          {instagramConnectionStatus ? (
            <>
              <span className="connection-badge connected">
                <FontAwesomeIcon icon={faCheckCircle} /> Connected
                <span className="expiry-info">
                  <FontAwesomeIcon icon={faClock} /> Expires:{' '}
                  {instagramAuthInfo.tokenExpires
                    ? new Date(instagramAuthInfo.tokenExpires).toLocaleString()
                    : 'N/A'}
                </span>
              </span>
              <button
                type="button"
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
            onLoginFailure={() => {
              handleInstagramLoginFailure();
            }}
          />

          {instagramError && <p className="instagram-error">{instagramError}</p>}
        </div>
      ) : (
        <div className="instagram-editor-container">
          <div className="instagram-post-preview-container">
            <div className="instagram-post-preview-header">
              <h3>Instagram Post Preview</h3>
            </div>
            <div className="instagram-post-preview">
              {/* upload image */}
              <ImageUploader onImageSelect={handleFileSelect} resetKey={imageResetKey} />

              {/* caption textarea */}
              <textarea
                className="instagram-caption-textarea"
                placeholder='Write a caption... (e.g. use engaging captions that are concise, add value, and include a call to action. Some examples include: "Ready to take on the week? ✨" ) and use hashtags to increase visibility. (e.g. #MondayMotivation #Inspiration)'
                onChange={e => handleCaptionChange(e)}
                value={caption}
              />
              {/* character count */}
              <div className="caption-character-count">
                <span className={isExceedingLimit ? 'exceeding-limit' : ''}>
                  {characterCount}/{MAX_CAPTION_CHARACTERS} characters
                </span>
                {isExceedingLimit && (
                  <span className="limit-warning">Character limit exceeded!</span>
                )}
              </div>
            </div>

            {/* post button */}
            <div className="post-buttons-container">
              <button
                type="button"
                className="schedule-post-instagram-button"
                disabled={isExceedingLimit || !caption || !file || isLoading}
                title={getButtonTitle()}
                onClick={() => {
                  handlePostToInstagram();
                }}
              >
                <span className="button-text">
                  {buttonTextState || 'Post to Instagram'}
                  {isPosting && <div className="spinner" />}
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
                  type="button"
                  className="schedule-post-instagram-button"
                  onClick={handleSchedulePost}
                  disabled={isLoading || !startDate || isExceedingLimit || !caption || !file}
                  title={getScheduleButtonTitle()}
                >
                  <span className="button-text">
                    {scheduledButtonTextState || 'Schedule Post'}
                    {isScheduling && <div className="spinner" />}
                  </span>
                </button>
              </div>
            </div>

            {instagramError && <p className="instagram-error">{instagramError}</p>}
          </div>

          {/* scheduled post section */}
          <InstagramScheduledPostsEditor
            posts={scheduledPosts}
            isLoading={isLoadingScheduledPosts}
            error={scheduledPostsError}
            onDeletePost={postId => {
              handleDeletePost(postId);
            }}
            onRefresh={() => {
              getInstagramScheduledPosts(
                setScheduledPosts,
                setScheduledPostsError,
                setIsLoadingScheduledPosts,
              );
            }}
          />
        </div>
      )}
    </div>
  );
}

export default InstagramPostEditor;
