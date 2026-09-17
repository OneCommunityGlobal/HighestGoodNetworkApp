import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import {
  cancelScheduledPost,
  fetchPostHistory,
  fetchScheduledPosts,
  postFacebookContent,
  postFacebookContentWithImage,
  scheduleFacebookPost,
  scheduleFacebookPostWithImage,
  updateScheduledPost,
} from '~/actions/facebookActions';
import { getFacebookConnectionStatus } from '~/actions/facebookAuthActions';
import CharacterCounter from '../../CharacterCounter';
import ConfirmationModal from '../../ConfirmationModal';
import FacebookConnection from './FacebookConnection';
import styles from './FacebookComposer.module.css';

const PACIFIC_TIMEZONE = 'America/Los_Angeles';
const FACEBOOK_CHARACTER_LIMIT = 63206;
const FACEBOOK_CONNECTION_STATES = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  LOADING: 'loading',
  ERROR: 'error',
  EXPIRED: 'expired',
};
const TABS = [
  { id: 'composer', label: '📝 Make Post' },
  { id: 'scheduled', label: '⏰ Scheduled' },
  { id: 'history', label: '📜 History' },
  { id: 'settings', label: '⚙️ Settings' },
];

const buildRequestor = authUser => {
  if (!authUser?.userid) return null;
  return {
    requestorId: authUser.userid,
    name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim(),
    role: authUser.role,
    permissions: authUser.permissions,
  };
};

const formatPacificDate = date =>
  moment(date)
    .tz(PACIFIC_TIMEZONE)
    .format('MMM D, YYYY h:mm A');

const validateImage = file => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) return 'Please select a JPEG, PNG, GIF, or WebP image';
  if (file.size > 10 * 1024 * 1024) return 'Image must be under 10MB';
  return null;
};

const getFacebookConnectionState = (connectionStatus, loading) => {
  if (loading || connectionStatus === null) return FACEBOOK_CONNECTION_STATES.LOADING;
  if (connectionStatus?.error) return FACEBOOK_CONNECTION_STATES.ERROR;
  if (connectionStatus?.connected === false) return FACEBOOK_CONNECTION_STATES.DISCONNECTED;
  if (connectionStatus?.connected !== true) return FACEBOOK_CONNECTION_STATES.ERROR;
  if (connectionStatus.tokenStatus === 'expired') return FACEBOOK_CONNECTION_STATES.EXPIRED;
  return FACEBOOK_CONNECTION_STATES.CONNECTED;
};

function ConnectionWarning({ connectionState, onSettings }) {
  const content = {
    [FACEBOOK_CONNECTION_STATES.DISCONNECTED]: {
      title: '⚠️ Facebook Not Connected',
      message: 'Connect a Facebook Page before posting.',
      settingsSuffix: ' to connect.',
    },
    [FACEBOOK_CONNECTION_STATES.LOADING]: {
      title: 'Checking Facebook Connection',
      message: 'Facebook connection status is still loading. Please try again.',
    },
    [FACEBOOK_CONNECTION_STATES.ERROR]: {
      title: 'Unable to Verify Facebook Connection',
      message: 'Facebook connection status could not be verified.',
      settingsSuffix: ' to retry the status check.',
    },
    [FACEBOOK_CONNECTION_STATES.EXPIRED]: {
      title: 'Facebook Connection Expired',
      message: 'Reconnect your Facebook Page before posting.',
      settingsSuffix: ' to reconnect.',
    },
  }[connectionState];

  if (!content) return null;

  return (
    <div className={styles.warning}>
      <strong>{content.title}</strong>
      <p>{content.message}</p>
      {content.settingsSuffix && (
        <p>
          Go to the{' '}
          <button className={styles.linkButton} type="button" onClick={onSettings}>
            Settings tab
          </button>
          {content.settingsSuffix}
        </p>
      )}
    </div>
  );
}

export default function FacebookComposer() {
  const dispatch = useDispatch();
  const authUser = useSelector(state => state.auth?.user);
  const darkMode = useSelector(state => state.theme.darkMode);
  const connectionStatus = useSelector(state => state.facebook?.connectionStatus);
  const connectionLoading = useSelector(state => state.facebook?.loading);
  const requestor = useMemo(() => buildRequestor(authUser), [authUser]);
  const connectionState = getFacebookConnectionState(connectionStatus, connectionLoading);
  const facebookPostingAllowed = connectionState === FACEBOOK_CONNECTION_STATES.CONNECTED;

  const [activeTab, setActiveTab] = useState('composer');
  const [postContent, setPostContent] = useState('');
  const [link, setLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);

  const [scheduledContent, setScheduledContent] = useState('');
  const [scheduledLink, setScheduledLink] = useState('');
  const [scheduledImageUrl, setScheduledImageUrl] = useState('');
  const [scheduledImageFile, setScheduledImageFile] = useState(null);
  const [scheduledImagePreview, setScheduledImagePreview] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);

  const [postHistory, setPostHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySource, setHistorySource] = useState('mongodb');
  const [historyStatus, setHistoryStatus] = useState('all');
  const [historyPostMethod, setHistoryPostMethod] = useState('all');
  const [facebookApiError, setFacebookApiError] = useState(null);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [editDateTime, setEditDateTime] = useState('');

  useEffect(() => {
    if (connectionStatus === null) dispatch(getFacebookConnectionStatus());
  }, [connectionStatus, dispatch]);

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (scheduledImagePreview) URL.revokeObjectURL(scheduledImagePreview);
    },
    [imagePreview, scheduledImagePreview],
  );

  const loadScheduledPosts = useCallback(async () => {
    if (!requestor) return;
    setLoadingScheduled(true);
    try {
      const result = await dispatch(fetchScheduledPosts({ requestor }));
      setScheduledPosts(result.scheduledPosts || []);
    } catch {
      setScheduledPosts([]);
    } finally {
      setLoadingScheduled(false);
    }
  }, [dispatch, requestor]);

  const loadPostHistory = useCallback(async () => {
    if (!requestor) return;
    setLoadingHistory(true);
    setFacebookApiError(null);
    try {
      const result = await dispatch(
        fetchPostHistory({
          requestor,
          source: historySource,
          status: historyStatus === 'all' ? undefined : historyStatus,
          postMethod: historyPostMethod === 'all' ? undefined : historyPostMethod,
        }),
      );
      setPostHistory(result.posts || []);
      setFacebookApiError(result.facebookApiError || null);
    } catch {
      setPostHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [dispatch, historyPostMethod, historySource, historyStatus, requestor]);

  useEffect(() => {
    if (activeTab === 'scheduled') loadScheduledPosts();
    if (activeTab === 'history') loadPostHistory();
  }, [activeTab, loadPostHistory, loadScheduledPosts]);

  const clearPostImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const clearScheduledImage = () => {
    setScheduledImageFile(null);
    if (scheduledImagePreview) URL.revokeObjectURL(scheduledImagePreview);
    setScheduledImagePreview(null);
  };

  const selectImage = (file, scheduled = false) => {
    if (!file) return;
    const error = validateImage(file);
    if (error) {
      toast.error(error);
      return;
    }
    const preview = URL.createObjectURL(file);
    if (scheduled) {
      clearScheduledImage();
      setScheduledImageFile(file);
      setScheduledImagePreview(preview);
      setScheduledImageUrl('');
    } else {
      clearPostImage();
      setImageFile(file);
      setImagePreview(preview);
      setImageUrl('');
    }
  };

  const validateFacebookConnection = () => {
    if (facebookPostingAllowed) return true;

    const messages = {
      [FACEBOOK_CONNECTION_STATES.DISCONNECTED]: 'Connect a Facebook Page before posting.',
      [FACEBOOK_CONNECTION_STATES.LOADING]:
        'Facebook connection status is still loading. Please try again.',
      [FACEBOOK_CONNECTION_STATES.ERROR]:
        'Facebook connection status could not be verified. Please retry the status check.',
      [FACEBOOK_CONNECTION_STATES.EXPIRED]: 'Reconnect your Facebook Page before posting.',
    };
    toast.error(messages[connectionState]);
    return false;
  };

  const handlePost = async () => {
    if (!validateFacebookConnection()) return;
    if (!postContent.trim() && !imageFile && !imageUrl.trim()) {
      toast.error('Please enter content or add an image for your post.');
      return;
    }
    if (!requestor) {
      toast.error('User information is missing; please re-login.');
      return;
    }

    setPosting(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        if (postContent.trim()) formData.append('message', postContent.trim());
        if (link.trim()) formData.append('link', link.trim());
        formData.append('image', imageFile);
        formData.append('requestor', JSON.stringify(requestor));
        await dispatch(postFacebookContentWithImage(formData));
      } else {
        await dispatch(
          postFacebookContent({
            message: postContent.trim() || undefined,
            link: link.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
            requestor,
          }),
        );
      }
      setPostContent('');
      setLink('');
      setImageUrl('');
      clearPostImage();
    } catch {
      // The action displays the historical toast.
    } finally {
      setPosting(false);
    }
  };

  const handleSchedule = async () => {
    if (!validateFacebookConnection()) return;
    if (!scheduledContent.trim() && !scheduledImageFile && !scheduledImageUrl.trim()) {
      toast.error('Please enter content or add an image for your scheduled post.');
      return;
    }
    if (!scheduledDateTime) {
      toast.error('Please pick a date and time.');
      return;
    }
    const scheduledMoment = moment.tz(scheduledDateTime, 'YYYY-MM-DDTHH:mm', PACIFIC_TIMEZONE);
    if (!scheduledMoment.isValid() || !scheduledMoment.isAfter(moment.tz(PACIFIC_TIMEZONE))) {
      toast.error('Scheduled time must be a valid future date/time (PST).');
      return;
    }
    if (!requestor) {
      toast.error('User information is missing; please re-login.');
      return;
    }

    setScheduling(true);
    try {
      if (scheduledImageFile) {
        const formData = new FormData();
        if (scheduledContent.trim()) formData.append('message', scheduledContent.trim());
        formData.append('scheduledFor', scheduledDateTime);
        formData.append('timezone', PACIFIC_TIMEZONE);
        if (scheduledLink.trim()) formData.append('link', scheduledLink.trim());
        formData.append('image', scheduledImageFile);
        formData.append('requestor', JSON.stringify(requestor));
        await dispatch(scheduleFacebookPostWithImage(formData));
      } else {
        await dispatch(
          scheduleFacebookPost({
            message: scheduledContent.trim() || undefined,
            scheduledFor: scheduledDateTime,
            timezone: PACIFIC_TIMEZONE,
            link: scheduledLink.trim() || undefined,
            imageUrl: scheduledImageUrl.trim() || undefined,
            requestor,
          }),
        );
      }
      setScheduledContent('');
      setScheduledLink('');
      setScheduledImageUrl('');
      setScheduledDateTime('');
      clearScheduledImage();
      loadScheduledPosts();
    } catch {
      // The action displays the historical toast.
    } finally {
      setScheduling(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await dispatch(cancelScheduledPost({ postId: cancelTarget, requestor }));
      loadScheduledPosts();
    } catch {
      // The action displays the historical toast.
    } finally {
      setCancelTarget(null);
    }
  };

  const openEdit = post => {
    setEditingPost(post);
    setEditMessage(post.message || '');
    setEditDateTime(
      moment(post.scheduledFor)
        .tz(PACIFIC_TIMEZONE)
        .format('YYYY-MM-DDTHH:mm'),
    );
  };

  const saveEdit = async () => {
    const scheduledMoment = moment.tz(editDateTime, 'YYYY-MM-DDTHH:mm', PACIFIC_TIMEZONE);
    if (!editMessage.trim()) {
      toast.error('Message cannot be empty.');
      return;
    }
    if (!scheduledMoment.isValid() || !scheduledMoment.isAfter(moment.tz(PACIFIC_TIMEZONE))) {
      toast.error('Scheduled time must be in the future (PST).');
      return;
    }
    try {
      await dispatch(
        updateScheduledPost({
          postId: editingPost._id,
          message: editMessage.trim(),
          scheduledFor: editDateTime,
          timezone: PACIFIC_TIMEZONE,
          requestor,
        }),
      );
      setEditingPost(null);
      loadScheduledPosts();
    } catch {
      // The action displays the historical toast.
    }
  };

  const warning = !facebookPostingAllowed && (
    <ConnectionWarning
      connectionState={connectionState}
      onSettings={() => setActiveTab('settings')}
    />
  );

  return (
    <div className={classnames(styles.composer, { [styles.dark]: darkMode })}>
      <h3 className={styles.title}>Facebook</h3>
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            className={classnames(styles.tab, { [styles.activeTab]: activeTab === tab.id })}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'composer' && (
        <div>
          {warning}
          <textarea
            className={styles.textarea}
            value={postContent}
            placeholder="Write your facebook post here..."
            onChange={event => setPostContent(event.target.value)}
          />
          <CharacterCounter
            currentLength={postContent.length}
            maxLength={FACEBOOK_CHARACTER_LIMIT}
          />
          <input
            className={styles.field}
            value={link}
            placeholder="Optional link"
            onChange={event => setLink(event.target.value)}
          />
          <div className={styles.section}>
            <strong>📷 Add Image (optional)</strong>
            <div className={styles.actions}>
              <label className={styles.secondaryButton}>
                📁 Upload from Device
                <input
                  hidden
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  disabled={Boolean(imageUrl)}
                  type="file"
                  onChange={event => selectImage(event.target.files?.[0])}
                />
              </label>
              {imageFile && (
                <span className={styles.fileName}>
                  ✓ {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                  <button className={styles.removeButton} type="button" onClick={clearPostImage}>
                    ✕
                  </button>
                </span>
              )}
            </div>
            {imagePreview && <img className={styles.preview} src={imagePreview} alt="Preview" />}
            <p className={styles.muted}>OR</p>
            <input
              className={styles.field}
              value={imageUrl}
              disabled={Boolean(imageFile)}
              placeholder="Paste image URL"
              onChange={event => {
                setImageUrl(event.target.value);
                if (event.target.value) clearPostImage();
              }}
            />
            <p className={styles.muted}>Supported: JPEG, PNG, GIF, WebP (max 10MB)</p>
          </div>
          <button
            className={styles.primaryButton}
            type="button"
            disabled={posting || !facebookPostingAllowed}
            onClick={handlePost}
          >
            {posting ? 'Posting...' : 'Post to facebook'}
          </button>
        </div>
      )}

      {activeTab === 'scheduled' && (
        <div>
          {warning}
          <h4>Schedule a New Post</h4>
          <textarea
            className={styles.textarea}
            value={scheduledContent}
            placeholder="Write the message to post later..."
            onChange={event => setScheduledContent(event.target.value)}
          />
          <input
            className={styles.field}
            value={scheduledLink}
            placeholder="Optional link"
            onChange={event => setScheduledLink(event.target.value)}
          />
          <div className={styles.section}>
            <strong>📷 Add Image (optional)</strong>
            <div className={styles.actions}>
              <label className={styles.secondaryButton}>
                📁 Upload from Device
                <input
                  hidden
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  disabled={Boolean(scheduledImageUrl)}
                  type="file"
                  onChange={event => selectImage(event.target.files?.[0], true)}
                />
              </label>
              {scheduledImageFile && (
                <span className={styles.fileName}>
                  ✓ {scheduledImageFile.name} ({(scheduledImageFile.size / 1024 / 1024).toFixed(2)}{' '}
                  MB)
                  <button
                    className={styles.removeButton}
                    type="button"
                    onClick={clearScheduledImage}
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
            {scheduledImagePreview && (
              <img className={styles.preview} src={scheduledImagePreview} alt="Preview" />
            )}
            <p className={styles.muted}>OR</p>
            <input
              className={styles.field}
              value={scheduledImageUrl}
              disabled={Boolean(scheduledImageFile)}
              placeholder="Paste image URL"
              onChange={event => {
                setScheduledImageUrl(event.target.value);
                if (event.target.value) clearScheduledImage();
              }}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.fieldGroup}>
              Date &amp; Time (PST)
              <input
                className={styles.field}
                type="datetime-local"
                value={scheduledDateTime}
                onChange={event => setScheduledDateTime(event.target.value)}
              />
            </label>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={scheduling || !facebookPostingAllowed}
              onClick={handleSchedule}
            >
              {scheduling ? 'Scheduling...' : 'Schedule Post'}
            </button>
          </div>

          <hr />
          <h4>Upcoming Scheduled Posts</h4>
          {loadingScheduled && <p className={styles.muted}>Loading...</p>}
          {!loadingScheduled && scheduledPosts.length === 0 && (
            <p className={styles.muted}>No scheduled posts.</p>
          )}
          {!loadingScheduled &&
            scheduledPosts.map(post => (
              <div className={styles.card} key={post._id}>
                <strong>{formatPacificDate(post.scheduledFor)} (PST)</strong>
                <p>{post.message || '(Image only)'}</p>
                {post.link && <p className={styles.meta}>Link: {post.link}</p>}
                {post.imageUrl && <p className={styles.meta}>Image: {post.imageUrl}</p>}
                {(post.hasImage || post.imageOriginalName) && (
                  <p className={styles.meta}>
                    📷 Image attached: {post.imageOriginalName || 'uploaded file'}
                  </p>
                )}
                <p className={styles.meta}>Status: {post.status}</p>
                <div className={styles.actions}>
                  <button
                    className={styles.primaryButton}
                    type="button"
                    onClick={() => openEdit(post)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.dangerButton}
                    type="button"
                    onClick={() => setCancelTarget(post._id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <div className={styles.filters}>
            <label className={styles.fieldGroup}>
              Status
              <select
                className={styles.select}
                value={historyStatus}
                onChange={event => setHistoryStatus(event.target.value)}
              >
                <option value="all">All</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <label className={styles.fieldGroup}>
              Type
              <select
                className={styles.select}
                value={historyPostMethod}
                onChange={event => setHistoryPostMethod(event.target.value)}
              >
                <option value="all">All</option>
                <option value="direct">Direct Posts</option>
                <option value="scheduled">Scheduled Posts</option>
              </select>
            </label>
            <label className={styles.fieldGroup}>
              Source
              <select
                className={styles.select}
                value={historySource}
                onChange={event => setHistorySource(event.target.value)}
              >
                <option value="mongodb">Database</option>
                <option value="all">Database + Facebook API</option>
                <option value="facebook">Facebook API only</option>
              </select>
            </label>
            <button className={styles.primaryButton} type="button" onClick={loadPostHistory}>
              Refresh
            </button>
          </div>
          {facebookApiError && (
            <div className={styles.warning}>
              <strong>Note:</strong> {facebookApiError}
            </div>
          )}
          {loadingHistory && <p className={styles.muted}>Loading...</p>}
          {!loadingHistory && postHistory.length === 0 && (
            <p className={styles.muted}>No post history found.</p>
          )}
          {!loadingHistory &&
            postHistory.map(post => (
              <div className={styles.card} key={post.postId || post._id}>
                <strong>{formatPacificDate(post.createdTime)}</strong>
                <p>{post.message}</p>
                {post.postMethod && <p className={styles.meta}>Type: {post.postMethod}</p>}
                {post.status && <p className={styles.meta}>Status: {post.status}</p>}
                {post.lastError && <p className={styles.error}>Error: {post.lastError}</p>}
                {post.permalinkUrl && (
                  <a href={post.permalinkUrl} target="_blank" rel="noopener noreferrer">
                    View on Facebook ↗
                  </a>
                )}
              </div>
            ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <h4>Facebook Settings</h4>
          <FacebookConnection />
          <div className={styles.details}>
            <h5>Platform Details</h5>
            <p>
              <strong>Max characters:</strong> No hard limit (recommended &lt;500 for engagement)
            </p>
            <p>
              <strong>Supports hashtags:</strong> Yes
            </p>
            <p>
              <strong>Image support:</strong> Yes (via URL)
            </p>
            <p>
              <strong>Recommended image dimensions:</strong> 1200×630 px
            </p>
            <p>
              <strong>Scheduling timezone:</strong> Pacific Time (PST/PDT)
            </p>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(cancelTarget)}
        toggle={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Scheduled Post"
        message="Are you sure you want to cancel this scheduled post?"
        confirmText="Cancel Post"
        confirmColor="danger"
      />

      {editingPost && (
        <div className={styles.modalOverlay} role="presentation">
          <div className={styles.modal} role="dialog">
            <h4>Edit Scheduled Post</h4>
            <textarea
              className={styles.textarea}
              value={editMessage}
              onChange={event => setEditMessage(event.target.value)}
            />
            <input
              className={styles.field}
              type="datetime-local"
              value={editDateTime}
              onChange={event => setEditDateTime(event.target.value)}
            />
            <div className={styles.actions}>
              <button className={styles.primaryButton} type="button" onClick={saveEdit}>
                Save
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setEditingPost(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
