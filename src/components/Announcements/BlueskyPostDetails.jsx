import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Container, Form, Modal, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import styles from './BlueskyPostDetails.module.css';

const API_BASE_URL = 'http://localhost:4500/api/bluesky';
const SUCCESS_PREFIX = '[OK]';
const ERROR_PREFIX = '[ERROR]';
const INFO_PREFIX = '[INFO]';

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const showYear = date.getFullYear() !== now.getFullYear();

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: showYear ? 'numeric' : undefined,
  });
}

function getStatusVariant(status) {
  if (status.includes(SUCCESS_PREFIX)) return 'success';
  if (status.includes(ERROR_PREFIX)) return 'danger';
  return 'info';
}

const CHAR_LIMIT = 300;

function ConnectionCard({ handle, appPassword, onHandleChange, onPasswordChange, onConnect }) {
  return (
    <Card className={`overflow-hidden border-0 ${styles['connection-card']}`}>
      <div className={styles['brand-header']}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zm0 3c1.516 0 2.917.423 4.11 1.155L6.155 16.11A7.002 7.002 0 0 1 5 12c0-3.866 3.134-7 7-7zm0 14a6.97 6.97 0 0 1-4.11-1.155l9.955-9.955A6.97 6.97 0 0 1 19 12c0 3.866-3.134 7-7 7z" />
        </svg>
        <span>Connect to Bluesky</span>
      </div>
      <div className="p-4">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className={styles['form-label']}>Handle</Form.Label>
            <Form.Control
              type="text"
              placeholder="username.bsky.social"
              value={handle}
              onChange={onHandleChange}
              className={styles['form-input']}
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className={styles['form-label']}>App Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="xxxx-xxxx-xxxx-xxxx"
              value={appPassword}
              onChange={onPasswordChange}
              className={styles['form-input']}
            />
            <Form.Text>
              <a
                href="https://bsky.app/settings/app-passwords"
                target="_blank"
                rel="noopener noreferrer"
                className={styles['hint-link']}
              >
                Create an App Password at bsky.app/settings/app-passwords
              </a>
            </Form.Text>
          </Form.Group>
          <Button className={styles['bluesky-btn-primary']} onClick={onConnect}>
            Connect to Bluesky
          </Button>
        </Form>
      </div>
    </Card>
  );
}

ConnectionCard.propTypes = {
  handle: PropTypes.string.isRequired,
  appPassword: PropTypes.string.isRequired,
  onHandleChange: PropTypes.func.isRequired,
  onPasswordChange: PropTypes.func.isRequired,
  onConnect: PropTypes.func.isRequired,
};

function UploadDropZone({
  dropZoneRef,
  fileInputRef,
  isDragging,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}) {
  return (
    <label
      ref={dropZoneRef}
      htmlFor="bluesky-image-upload"
      className={`${styles['drop-zone']} mb-3 p-4 text-center ${isDragging ? styles.dragging : ''}`}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        border: `2px dashed ${isDragging ? '#0d6efd' : '#dee2e6'}`,
        borderRadius: '4px',
        backgroundColor: isDragging ? 'rgba(13, 110, 253, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      <div className="d-flex flex-column align-items-center">
        <i className="bi bi-cloud-upload" style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
        <p className="mb-2">Drag and drop an image here, or</p>
        <Form.Control
          ref={fileInputRef}
          id="bluesky-image-upload"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ maxWidth: '300px' }}
          className="mb-2"
          aria-label="Upload an image from your device"
        />
        <small className="text-muted">Max file size: 1MB (5MB for GIFs)</small>
      </div>
    </label>
  );
}

UploadDropZone.propTypes = {
  dropZoneRef: PropTypes.shape({ current: PropTypes.any }),
  fileInputRef: PropTypes.shape({ current: PropTypes.any }),
  isDragging: PropTypes.bool.isRequired,
  onDragEnter: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
};

function MediaDisplay({ media }) {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }

  return (
    <div className={`${styles['post-media']} mt-2`}>
      {media.map(item => {
        const mediaKey = item.url || item.thumb;

        if (item.type === 'image') {
          return (
            <div key={mediaKey} className={`${styles['image-container']} p-3`}>
              <button
                type="button"
                className={styles['media-button']}
                onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
                aria-label={`View full size ${item.alt || 'post image'}`}
              >
                <img
                  src={item.thumb}
                  alt={item.alt || 'Post image'}
                  className={styles['media-item']}
                  loading="lazy"
                />
              </button>
            </div>
          );
        }

        if (item.type === 'video') {
          return (
            <div key={mediaKey} className={styles['video-container']}>
              <video
                controls
                poster={item.thumb}
                className={styles['media-item']}
                preload="metadata"
              >
                <source src={item.url} type="video/mp4" />
                <track kind="captions" label="Captions" src="" default />
                Your browser does not support the video tag.
              </video>
              {item.title && <small className="text-muted d-block mt-1">{item.title}</small>}
            </div>
          );
        }

        if (item.type === 'gif') {
          return (
            <div key={mediaKey} className={styles['gif-container']} id={`gif-${mediaKey}`}>
              <div className="position-relative">
                <button
                  type="button"
                  className={styles['media-button']}
                  onClick={() => {
                    const img = document.createElement('img');
                    img.src = item.url;
                    img.alt = item.title || 'GIF';
                    img.className = styles['media-item'];
                    const container = document.getElementById(`gif-${mediaKey}`);
                    if (container) {
                      container.innerHTML = '';
                      container.appendChild(img);
                    }
                  }}
                  aria-label={`View full ${item.title || 'GIF'}`}
                >
                  <img
                    src={item.thumb || item.url}
                    alt={item.title || 'GIF'}
                    className={styles['media-item']}
                    loading="lazy"
                  />
                </button>
                {item.thumb && (
                  <div className={styles['gif-overlay']}>
                    <span className={styles['gif-badge']}>GIF</span>
                  </div>
                )}
              </div>
              {item.title && <small className="text-muted d-block mt-1">{item.title}</small>}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

MediaDisplay.propTypes = {
  media: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      url: PropTypes.string,
      thumb: PropTypes.string,
      alt: PropTypes.string,
      title: PropTypes.string,
    }),
  ),
};

function PostsCard({ posts, isLoading, deletingPost, onRefresh, onViewPost, onDeletePost }) {
  return (
    <Card className={`border-0 ${styles['posts-card']}`}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-4 pt-4">
        <h5 className={`mb-0 ${styles['section-title']}`}>
          Your Posts
          {posts.length > 0 && <span className={styles['post-count']}>{posts.length}</span>}
        </h5>
        <Button className={styles['refresh-btn']} onClick={onRefresh} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              Refreshing…
            </>
          ) : (
            '↻ Refresh'
          )}
        </Button>
      </div>
      <div className="px-4 pb-4">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.cid} className={styles['post-item']}>
              <div className={styles['post-avatar']}>
                <span>🦋</span>
              </div>
              <div className={styles['post-body']}>
                <p className={styles['post-text']}>{post.text}</p>
                <MediaDisplay media={post?.media} />
                <div className={styles['post-meta']}>
                  <span className={styles['post-stat']}>
                    <span aria-label="likes">❤️</span> {post.likeCount ?? 0}
                  </span>
                  <span className={styles['post-stat']}>
                    <span aria-label="reposts">🔁</span> {post.repostCount ?? 0}
                  </span>
                  <span className={styles['post-time']}>{formatDate(post.createdAt)}</span>
                  <div className={styles['post-actions']}>
                    <button
                      type="button"
                      className={styles['action-btn-view']}
                      onClick={() => onViewPost(post.uri)}
                    >
                      View ↗
                    </button>
                    <button
                      type="button"
                      className={styles['action-btn-delete']}
                      onClick={() => onDeletePost(post.uri)}
                      disabled={deletingPost !== null}
                    >
                      {deletingPost === post.uri ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles['empty-state']}>
            <span className={styles['empty-icon']}>🦋</span>
            <p className="mb-0">
              {isLoading ? 'Loading posts…' : 'No posts yet. Create your first post!'}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

PostsCard.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool.isRequired,
  deletingPost: PropTypes.string,
  onRefresh: PropTypes.func.isRequired,
  onViewPost: PropTypes.func.isRequired,
  onDeletePost: PropTypes.func.isRequired,
};

function BlueskyPostDetails() {
  const [handle, setHandle] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef(null);
  const fileInputRef = useRef(null);

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const checkSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/session`, {
        credentials: 'include',
      });
      const result = await response.json();

      if (result.success && result.isConnected) {
        setIsConnected(true);
        setHandle(result.handle || '');
        setStatus(currentStatus =>
          currentStatus === '' ? `${SUCCESS_PREFIX} Connected to Bluesky` : currentStatus,
        );
        return;
      }

      setIsConnected(false);
      setStatus(currentStatus =>
        currentStatus.includes(SUCCESS_PREFIX)
          ? `${ERROR_PREFIX} Session expired. Please reconnect.`
          : currentStatus,
      );
    } catch (error) {
      setIsConnected(false);
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : 'Unable to verify the current Bluesky session.';
      setStatus(`${ERROR_PREFIX} ${errorMessage}`);
    }
  };

  useEffect(() => {
    checkSession();
    const intervalId = setInterval(checkSession, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isConnected) {
      const loadPosts = async () => {
        await getPosts();
      };
      loadPosts();
      return;
    }

    setPosts([]);
  }, [isConnected]);

  const handleImageFile = file => {
    if (!file.type.startsWith('image/')) {
      setStatus(`${ERROR_PREFIX} Only image files are allowed`);
      return;
    }

    const isGif = file.type === 'image/gif';
    const maxSize = isGif ? 5000000 : 1000000;
    if (file.size > maxSize) {
      setStatus(
        `${ERROR_PREFIX} ${isGif ? 'GIF' : 'Image'} size must be less than ${
          isGif ? '5MB' : '1MB'
        }`,
      );
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setImagePreview(result);
        return;
      }

      setStatus(`${ERROR_PREFIX} Unable to preview the selected image.`);
      clearImage();
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = event => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const [file] = event.dataTransfer.files || [];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleImageSelect = event => {
    const [file] = event.target.files || [];
    if (file) {
      handleImageFile(file);
    }
  };

  const connectToBluesky = async () => {
    if (handle === '' || appPassword === '') {
      setStatus(`${ERROR_PREFIX} Handle and password are required`);
      return;
    }

    try {
      setStatus(`${INFO_PREFIX} Connecting...`);
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          handle,
          password: appPassword,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setIsConnected(true);
        setStatus(`${SUCCESS_PREFIX} Connected to Bluesky! DID: ${result.did}`);
        return;
      }

      setStatus(result.error || `${ERROR_PREFIX} Failed to connect`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const disconnectFromBluesky = async () => {
    try {
      setStatus(`${INFO_PREFIX} Disconnecting...`);
      const response = await fetch(`${API_BASE_URL}/disconnect`, {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      setIsConnected(false);
      setHandle('');
      setAppPassword('');
      setPostText('');
      clearImage();
      setStatus(`${SUCCESS_PREFIX} Disconnected from Bluesky`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const getPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setPosts(result.posts);
        setStatus(
          result.posts.length > 0
            ? `${SUCCESS_PREFIX} Posts loaded!`
            : `${INFO_PREFIX} No posts found`,
        );
        return;
      }

      setStatus(result.error || `${ERROR_PREFIX} Failed to load posts`);
    } catch (error) {
      setStatus(error.message);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setIsConnected(false);
        setStatus(`${ERROR_PREFIX} Session expired. Please reconnect.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async () => {
    if (!isConnected) {
      setStatus(`${ERROR_PREFIX} Please connect to Bluesky first`);
      return;
    }

    const trimmedText = postText.trim();
    if (trimmedText === '' && !selectedImage) {
      setStatus(`${ERROR_PREFIX} Please provide text or an image for the post`);
      return;
    }

    try {
      setStatus(`${INFO_PREFIX} Creating post...`);
      const formData = new FormData();
      formData.append('text', trimmedText);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${API_BASE_URL}/post`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create post');
      }

      setStatus(`${SUCCESS_PREFIX} Posted successfully!`);
      setPostText('');
      clearImage();
      await getPosts();
    } catch (error) {
      setStatus(error.message);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setIsConnected(false);
        setStatus(`${ERROR_PREFIX} Session expired. Please reconnect.`);
      }
    }
  };

  const handleDelete = uri => {
    setPostToDelete(uri);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (postToDelete === null) {
      return;
    }

    try {
      setShowDeleteModal(false);
      setDeletingPost(postToDelete);
      setStatus(`${INFO_PREFIX} Deleting post...`);
      const response = await fetch(`${API_BASE_URL}/post/${encodeURIComponent(postToDelete)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setStatus(`${SUCCESS_PREFIX} Post deleted successfully!`);
        setPosts(currentPosts => currentPosts.filter(post => post.uri !== postToDelete));
        return;
      }

      setStatus(result.error || `${ERROR_PREFIX} Failed to delete post`);
    } catch (error) {
      setStatus(error.message);
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setIsConnected(false);
        setStatus(`${ERROR_PREFIX} Session expired. Please reconnect.`);
      }
    } finally {
      setDeletingPost(null);
      setPostToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const viewPost = uri => {
    if (typeof uri !== 'string' || !uri.startsWith('at://')) {
      setStatus(`${ERROR_PREFIX} Invalid URI`);
      return;
    }

    const rkey = uri.split('/').at(-1);
    const didMatch = /at:\/\/(did:[^/]+)/.exec(uri);
    if (didMatch === null || rkey === undefined) {
      setStatus(`${ERROR_PREFIX} Invalid Bluesky post identifier`);
      return;
    }

    const did = didMatch[1];
    const url = `https://bsky.app/profile/${did}/post/${rkey}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const charsLeft = CHAR_LIMIT - postText.length;
  const charsPercent = Math.min((postText.length / CHAR_LIMIT) * 100, 100);
  const getCharColor = remainingChars => {
    if (remainingChars < 0) return '#e53e3e';
    if (remainingChars <= 20) return '#ed8936';
    return '#0085ff';
  };
  const charColor = getCharColor(charsLeft);
  const canPost =
    isConnected && (postText.trim() !== '' || selectedImage !== null) && charsLeft >= 0;

  return (
    <Container className={styles['bluesky-post-details']}>
      {/* Status alert — shown at top */}
      {status !== '' && (
        <Alert
          variant={getStatusVariant(status)}
          className={`mb-4 ${styles['status-alert']}`}
          dismissible
          onClose={() => setStatus('')}
        >
          {status.replace(/^\[(OK|ERROR|INFO)\]\s*/, '')}
        </Alert>
      )}

      {isConnected ? (
        <>
          {/* Connected header bar */}
          <div className={styles['connected-bar']}>
            <div className={styles['connected-badge']}>
              <span className={styles['connected-dot']} />
              <span>@{handle}</span>
            </div>
            <button
              type="button"
              className={styles['disconnect-btn']}
              onClick={disconnectFromBluesky}
            >
              Disconnect
            </button>
          </div>

          {/* Composer card */}
          <Card className={`border-0 mb-4 ${styles['composer-card']}`}>
            <div className="p-4">
              <h5 className={styles['section-title']}>Create a Post</h5>
              <Form.Control
                as="textarea"
                rows={4}
                value={postText}
                onChange={event => setPostText(event.target.value)}
                placeholder="What's on your mind?"
                className={styles['composer-textarea']}
                maxLength={CHAR_LIMIT + 50}
              />
              {/* Character counter */}
              <div className={styles['char-counter']}>
                <div className={styles['char-bar-track']}>
                  <div
                    className={styles['char-bar-fill']}
                    style={{ width: `${charsPercent}%`, background: charColor }}
                  />
                </div>
                <span style={{ color: charColor, fontWeight: charsLeft <= 20 ? '700' : '400' }}>
                  {charsLeft < 0 ? `${Math.abs(charsLeft)} over limit` : `${charsLeft} remaining`}
                </span>
              </div>

              <UploadDropZone
                dropZoneRef={dropZoneRef}
                fileInputRef={fileInputRef}
                isDragging={isDragging}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileChange={handleImageSelect}
              />

              {imagePreview && (
                <div className={`mb-3 ${styles['image-preview-wrap']}`}>
                  <img src={imagePreview} alt="Preview" className={styles['image-preview']} />
                  <button
                    type="button"
                    className={styles['remove-image-btn']}
                    onClick={clearImage}
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className={styles['composer-footer']}>
                <button
                  type="button"
                  className={styles['bluesky-btn-primary']}
                  onClick={createPost}
                  disabled={!canPost}
                >
                  Post to Bluesky
                </button>
              </div>
            </div>
          </Card>

          <PostsCard
            posts={posts}
            isLoading={isLoading}
            deletingPost={deletingPost}
            onRefresh={getPosts}
            onViewPost={viewPost}
            onDeletePost={handleDelete}
          />
        </>
      ) : (
        <ConnectionCard
          handle={handle}
          appPassword={appPassword}
          onHandleChange={event => setHandle(event.target.value)}
          onPasswordChange={event => setAppPassword(event.target.value)}
          onConnect={connectToBluesky}
        />
      )}

      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton className={styles['modal-header']}>
          <Modal.Title>Delete Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this post? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deletingPost !== null}>
            {deletingPost ? 'Deleting…' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default BlueskyPostDetails;
