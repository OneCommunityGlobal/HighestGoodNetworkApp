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

function ConnectionCard({ handle, appPassword, onHandleChange, onPasswordChange, onConnect }) {
  return (
    <Card className="p-3">
      <h4>Connect to Bluesky</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Your handle (e.g. linh.bsky.social)"
            value={handle}
            onChange={onHandleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            type="password"
            placeholder="App Password"
            value={appPassword}
            onChange={onPasswordChange}
          />
        </Form.Group>
        <Button variant="primary" onClick={onConnect}>
          Connect
        </Button>
      </Form>
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
    <div
      ref={dropZoneRef}
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
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{ maxWidth: '300px' }}
          className="mb-2"
          aria-label="Upload an image from your device"
        />
        <small className="text-muted">Max file size: 1MB (5MB for GIFs)</small>
      </div>
    </div>
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
    <Card className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Your Posts</h4>
        <Button variant="success" onClick={onRefresh} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </div>
      {posts.length > 0 ? (
        <div>
          {posts.map(post => (
            <Card key={post.cid} className="mb-3">
              <Card.Body>
                <Card.Text>{post.text}</Card.Text>
                <MediaDisplay media={post?.media} />
                <div className="d-flex justify-content-between align-items-center text-muted small">
                  <div>
                    <span>
                      Likes {post.likeCount} | Reposts {post.repostCount}
                    </span>
                    <span className="ms-2">| {formatDate(post.createdAt)}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onViewPost(post.uri)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onDeletePost(post.uri)}
                      disabled={deletingPost !== null}
                    >
                      {deletingPost === post.uri ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Alert variant="light" className="text-center mb-0">
          {isLoading ? 'Loading posts...' : 'No posts yet'}
        </Alert>
      )}
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

  const canPost = isConnected && (postText.trim() !== '' || selectedImage !== null);

  return (
    <Container className={styles['bluesky-post-details']}>
      <h2 className="mb-4">Bluesky Manager</h2>
      {isConnected ? (
        <>
          <Card className="mb-4 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Create a New Post</h4>
              <Button variant="danger" onClick={disconnectFromBluesky}>
                Disconnect
              </Button>
            </div>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                value={postText}
                onChange={event => setPostText(event.target.value)}
                placeholder="What's on your mind?"
              />
            </Form.Group>
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
              <div className="mb-3 position-relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                  }}
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={clearImage}
                  className="position-absolute"
                  style={{ top: '5px', right: '5px' }}
                  aria-label="Remove image preview"
                >
                  Remove
                </Button>
              </div>
            )}
            <Button variant="primary" onClick={createPost} disabled={!canPost}>
              Post
            </Button>
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
      {status !== '' && (
        <Alert variant={getStatusVariant(status)} className="mt-3">
          {status}
        </Alert>
      )}
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
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
            {deletingPost ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default BlueskyPostDetails;
