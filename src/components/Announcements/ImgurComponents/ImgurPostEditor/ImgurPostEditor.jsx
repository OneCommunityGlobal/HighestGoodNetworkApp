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
import LoginButton from '../LoginButton';
import './ImgurPostEditor.css';
import {
  postToImgur,
  checkImgurAuthStatus,
  disconnectFromImgur,
} from '../helpers/ImgurPostHelpers';
import ImageUploader from '../ImageUploader';
import ImgurScheduledPostsEditor from '../ImgurScheduledPostEditor/ImgurScheduledPostEditor';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getImgurScheduledPosts,
  scheduleImgurPost,
  deleteImgurScheduledPost,
} from '../helpers/ImgurScheduledPostHelpers';

const MAX_CAPTION_CHARACTERS = 2200;

/**
 * Imgur Post Editor component that allows users to create, schedule, and manage Imgur posts
 *
 * @param {boolean} imgurConnectionStatus - Whether the user is connected to Imgur
 * @param {function} setImgurConnectionStatus - Function to update Imgur connection status
 * @returns {JSX.Element} Imgur post editor interface
 */
function ImgurPostEditor({ imgurConnectionStatus, setImgurConnectionStatus }) {
  const [characterCount, setCharacterCount] = useState(0);
  const [isExceedingLimit, setIsExceedingLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [imageResetKey, setImageResetKey] = useState(0);

  const [imgurAuthInfo, setImgurAuthInfo] = useState({
    accountId: null,
    accountUsername: null,
    hasValidToken: false,
    tokenExpires: null,
    userId: null,
    timestamp: null,
  });
  const [buttonTextState, setButtonTextState] = useState('');
  const [scheduledButtonTextState, setScheduledButtonTextState] = useState('');

  const [imgurError, setImgurError] = useState('');
  const [scheduledPostsError, setScheduledPostsError] = useState('');

  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [isLoadingScheduledPosts, setIsLoadingScheduledPosts] = useState(false);

  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState(['']);

  const [startDate, setStartDate] = useState(null);
  const [minTime, setMinTime] = useState(new Date());

  /**
   * Attempts to authenticate with Imgur and sets connection state
   *
   * @returns {Promise<void>}
   */
  const handleImgurLoginSuccess = async () => {
    const status = await checkImgurAuthStatus(setImgurError);

    if (status && status.success === true) {
      setImgurConnectionStatus(true);
      setImgurError('');
      setImgurAuthInfo({
        accountId: status.data.accountId,
        accountUsername: status.data.accountUsername,
        hasValidToken: status.data.hasValidToken,
        tokenExpires: status.data.expiresAt,
        userId: status.data.userId,
        timestamp: status.timestamp,
      });
    } else {
      setImgurError('Failed to retrieve access token. Please try again.');
      setImgurConnectionStatus(false);
    }
  };

  // check connection status when component mounts
  useEffect(() => {
    handleImgurLoginSuccess();
    getImgurScheduledPosts(
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
   * Handles Imgur login failure and sets error message
   */
  const handleImgurLoginFailure = () => {
    setImgurError('Failed to connect to Imgur. Please try again.');
    setImgurConnectionStatus(false);
  };

  /**
   * Sends a post immediately to Imgur
   *
   * @param {string} caption - Text caption for the post
   * @param {File} file - Image file to upload
   * @returns {Promise<void>}
   */
  const handlePostToImgur = async () => {
    setIsLoading(true);
    setIsPosting(true);
    const response = await postToImgur(
      title,
      topic,
      tags,
      caption,
      file,
      setImgurError,
      setTitle,
      setTopic,
      setTags,
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

  const handleTitleChange = e => {
    setTitle(e.target.value);
  };
  const handleTopicChange = e => {
    setTopic(e.target.value);
  };

  const handleTagsChange = e => {
    const tagsArray = e.target.value.split(',').map(tag => tag.trim());
    setTags(tagsArray);
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
   * Deletes a scheduled Imgur post
   *
   * @param {string} postId - ID of the post to delete
   * @returns {Promise<void>}
   */
  const handleDeletePost = async postId => {
    const response = await deleteImgurScheduledPost(postId, setScheduledPostsError);
    if (response && response.success) {
      toast.success('Post deleted successfully!');
    } else {
      toast.error('Error deleting post');
    }
    getImgurScheduledPosts(
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
      const response = await scheduleImgurPost(
        startDate,
        title,
        topic,
        tags,
        caption,
        file,
        setScheduledButtonTextState,
        setScheduledPostsError,
      );

      if (response && response.success) {
        toast.success('Post scheduled successfully!');
        getImgurScheduledPosts(
          setScheduledPosts,
          setScheduledPostsError,
          setIsLoadingScheduledPosts,
        );
        setTitle('');
        setTopic('');
        setTags(['']);
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
   * Disconnects from Imgur and resets authentication state
   */
  const handleImgurDisconnect = () => {
    disconnectFromImgur(setImgurError);
    checkImgurAuthStatus(setImgurError);
    setImgurConnectionStatus(false);
    setImgurAuthInfo({
      accountId: null,
      accountUsername: null,
      hasValidToken: false,
      tokenExpires: null,
      userId: null,
      timestamp: null,
    });
    setImgurError('Disconnected from Imgur');
  };

  /**
   * Returns the button title based on the current state of the form
   * @returns {string} Button title
   * */
  const getButtonTitle = () => {
    if (isExceedingLimit) return 'Caption exceeds character limit';
    if (!file) return 'Please select an image';
    if (!title) return 'Please enter a title';
    if (!topic) return 'Please enter a topic';
    if (!caption) return 'Please enter a caption';
    if (!tags) return 'Please enter tags';
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
    <div className="imgur-post-editor">
      <h2 className="connection-status-header">
        <div className="connection-status-badge">
          {imgurConnectionStatus ? (
            <>
              <span className="connection-badge connected">
                <FontAwesomeIcon icon={faCheckCircle} /> Connected
                <span className="expiry-info">
                  <FontAwesomeIcon icon={faClock} /> Expires:{' '}
                  {imgurAuthInfo.tokenExpires
                    ? new Date(imgurAuthInfo.tokenExpires).toLocaleString()
                    : 'N/A'}
                </span>
              </span>
              <button
                type="button"
                className="disconnect-button"
                onClick={handleImgurDisconnect}
                title="Disconnect from Imgur"
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
      {!imgurConnectionStatus ? (
        <div className="imgur-login-container">
          <LoginButton
            className="imgur-login-button"
            buttonText="Connect Imgur Account"
            onLoginSuccess={() => {
              handleImgurLoginSuccess();
            }}
            onLoginFailure={() => {
              handleImgurLoginFailure();
            }}
          />

          {imgurError && <p className="imgur-error">{imgurError}</p>}
        </div>
      ) : (
        <div className="imgur-editor-container">
          <div className="imgur-post-preview-container">
            <div className="imgur-post-preview-header">
              <h3>Imgur Post Preview</h3>
            </div>
            <div className="imgur-post-preview">
              {/* upload image */}
              <ImageUploader onImageSelect={handleFileSelect} resetKey={imageResetKey} />

              {/* title textarea */}
              <input
                type="text"
                className="imgur-title-input"
                placeholder='Write a title... (e.g. "A Beautiful Sunset")'
                onChange={e => handleTitleChange(e)}
                value={title}
              />

              { /* topic input */}
              <input
                type="text"
                className="imgur-topic-input"
                placeholder='Write a topic... (e.g. "Environment, Animals, Nature")'
                onChange={e => handleTopicChange(e)}
                value={topic}
              />

              { /* tags input */}
              <input
                type="text"
                className="imgur-tags-input"
                placeholder='Write tags... (e.g. "#funny, #engaging, #environment")'
                onChange={e => handleTagsChange(e)}
                value={tags}
              />

              {/* description textarea */}
              <textarea
                className="imgur-caption-textarea"
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
                className="schedule-post-imgur-button"
                disabled={isExceedingLimit || !caption || !file || !title || !topic || !tags || isLoading}
                title={getButtonTitle()}
                onClick={() => {
                  handlePostToImgur();
                }}
              >
                <span className="button-text">
                  {buttonTextState || 'Post to Imgur'}
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
                  className="schedule-post-imgur-button"
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

            {imgurError && <p className="imgur-error">{imgurError}</p>}
          </div>

          {/* scheduled post section */}
          <ImgurScheduledPostsEditor
            posts={scheduledPosts}
            isLoading={isLoadingScheduledPosts}
            error={scheduledPostsError}
            onDeletePost={postId => {
              handleDeletePost(postId);
            }}
            onRefresh={() => {
              getImgurScheduledPosts(
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

export default ImgurPostEditor;