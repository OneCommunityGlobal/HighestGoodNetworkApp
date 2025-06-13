// Bluesky Post Details Component
import { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import './BlueskyPostDetails.css';

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function MediaDisplay({ media }) {
  if (!media || media.length === 0) return null;

  return (
    <div className="post-media mt-2">
      {media.map(item => {
        // Generate a unique key based on the media URL or thumb URL
        const mediaKey = item.url || item.thumb;

        if (item.type === 'image') {
          return (
            <div key={mediaKey} className="image-container p-3">
              <button
                type="button"
                className="media-button"
                onClick={() => window.open(item.url, '_blank')}
                aria-label={`View full size ${item.alt || 'post image'}`}
              >
                <img
                  src={item.thumb}
                  alt={item.alt || 'Post image'}
                  className="media-item"
                  loading="lazy"
                />
              </button>
            </div>
          );
        }
        if (item.type === 'video') {
          return (
            <div key={mediaKey} className="video-container">
              <video controls poster={item.thumb} className="media-item" preload="metadata">
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
            <div key={mediaKey} className="gif-container" id={`gif-${mediaKey}`}>
              <div className="position-relative">
                <button
                  type="button"
                  className="media-button"
                  onClick={() => {
                    // Replace thumbnail with actual GIF on click
                    const img = document.createElement('img');
                    img.src = item.url;
                    img.alt = item.title || 'GIF';
                    img.className = 'media-item';
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
                    className="media-item"
                    loading="lazy"
                  />
                </button>
                {item.thumb && (
                  <div className="gif-overlay">
                    <span className="gif-badge">GIF</span>
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

  const checkSession = async () => {
    try {
      const response = await fetch('http://localhost:4500/api/bluesky/session', {
        credentials: 'include',
      });
      const result = await response.json();

      if (result.success && result.isConnected) {
        setIsConnected(true);
        setHandle(result.handle || '');
        // Don't set password as it's not sent back from server
        if (!status) setStatus('✅ Connected to Bluesky');
      } else {
        setIsConnected(false);
        if (isConnected) setStatus('Session expired. Please reconnect.');
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  // Check session status on mount and periodically
  useEffect(() => {
    checkSession();
    // Check session every 5 minutes
    const intervalId = setInterval(checkSession, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const isGif = file.type === 'image/gif';
        if (file.size > (isGif ? 5000000 : 1000000)) {
          // 5MB for GIFs, 1MB for other images
          setStatus(
            `❌ ${isGif ? 'GIF' : 'Image'} size must be less than ${isGif ? '5MB' : '1MB'}`,
          );
          return;
        }
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setStatus('❌ Only image files are allowed');
      }
    }
  };

  const handleImageSelect = e => {
    const file = e.target.files[0];
    if (file) {
      const isGif = file.type === 'image/gif';
      if (file.size > (isGif ? 5000000 : 1000000)) {
        // 5MB for GIFs, 1MB for other images
        setStatus(`❌ ${isGif ? 'GIF' : 'Image'} size must be less than ${isGif ? '5MB' : '1MB'}`);
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const connectToBluesky = async () => {
    if (!handle || !appPassword) {
      setStatus('❌ Handle and password are required');
      return;
    }

    try {
      setStatus('🔄 Connecting...');
      const response = await fetch('http://localhost:4500/api/bluesky/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include credentials
        body: JSON.stringify({
          handle,
          password: appPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setIsConnected(true);
        setStatus(`✅ Connected to Bluesky! DID: ${result.did}`);
      } else {
        setStatus(`${result.error || 'Failed to connect'}`);
      }
    } catch (error) {
      setStatus(`${error.message}`);
    }
  };

  const disconnectFromBluesky = async () => {
    try {
      setStatus('🔄 Disconnecting...');
      const response = await fetch('http://localhost:4500/api/bluesky/disconnect', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setIsConnected(false);
      setHandle('');
      setAppPassword('');
      setPostText('');
      setStatus('✅ Disconnected from Bluesky');
    } catch (error) {
      setStatus(`${error.message}`);
    }
  };

  const getPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4500/api/bluesky/posts', {
        credentials: 'include',
      });
      const result = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (result.success) {
        setPosts(result.posts);
        setStatus(result.posts.length ? '✅ Posts loaded!' : 'ℹ️ No posts found');
      } else {
        setStatus(`${result.error || 'Failed to load posts'}`);
      }
    } catch (error) {
      setStatus(`${error.message}`);

      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setIsConnected(false);
        setStatus('❌ Session expired. Please reconnect.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const createPost = async () => {
    if (!isConnected) {
      setStatus('❌ Please connect to Bluesky first');
      return;
    }

    const trimmedText = postText.trim();
    if (!trimmedText && !selectedImage) {
      setStatus('❌ Please provide text or an image for the post');
      return;
    }

    try {
      setStatus('🔄 Creating post...');
      const formData = new FormData();
      formData.append('text', trimmedText); // Will be empty string if no text

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch('http://localhost:4500/api/bluesky/post', {
        method: 'POST',
        credentials: 'include',
        body: formData, // Let browser set the Content-Type with boundary
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create post');
      }

      setStatus('✅ Posted successfully!');
      setPostText('');
      clearImage();
      getPosts();
    } catch (error) {
      setStatus(`${error.message}`);

      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setIsConnected(false);
        setStatus('❌ Session expired. Please reconnect.');
      }
    }
  };

  const handleDelete = uri => {
    setPostToDelete(uri);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setShowDeleteModal(false);
      setDeletingPost(postToDelete);
      setStatus('🔄 Deleting post...');
      const response = await fetch(
        `http://localhost:4500/api/bluesky/post/${encodeURIComponent(postToDelete)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setStatus('✅ Post deleted successfully!');
        // Remove the deleted post from the list
        setPosts(posts.filter(post => post.uri !== postToDelete));
      } else {
        setStatus(`${result.error || 'Failed to delete post'}`);
      }
    } catch (error) {
      setStatus(`${error.message}`);

      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setIsConnected(false);
        setStatus('❌ Session expired. Please reconnect.');
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
    try {
      if (!uri || !uri.startsWith('at://')) {
        return;
      }

      const parts = uri.split('/');
      const rkey = parts[parts.length - 1];

      const didMatch = uri.match(/at:\/\/(did:[^/]+)/);
      if (!didMatch) {
        return;
      }

      const did = didMatch[1];
      const url = `https://bsky.app/profile/${did}/post/${rkey}`;
      window.open(url, '_blank');
    } catch (error) {
      setStatus(`${error.message}`);
    }
  };

  useEffect(() => {
    if (isConnected) {
      getPosts();
    } else {
      setPosts([]);
    }
  }, [isConnected]);

  const getStatusVariant = () => {
    if (status.includes('✅')) return 'success';
    if (status.includes('❌')) return 'danger';
    return 'info';
  };

  return (
    <Container className="bluesky-post-details">
      <h2 className="mb-4">🔵 Bluesky Manager</h2>
      {!isConnected ? (
        <Card className="p-3">
          <h4>🔐 Connect to Bluesky</h4>
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Your handle (e.g. linh.bsky.social)"
                value={handle}
                onChange={e => setHandle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="App Password"
                value={appPassword}
                onChange={e => setAppPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" onClick={connectToBluesky}>
              Connect
            </Button>
          </Form>
        </Card>
      ) : (
        <>
          <Card className="mb-4 p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">📝 Create a New Post</h4>
              <Button variant="danger" onClick={disconnectFromBluesky}>
                Disconnect
              </Button>
            </div>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                value={postText}
                onChange={e => setPostText(e.target.value)}
                placeholder="What's on your mind?"
              />
            </Form.Group>
            {/* Drag & Drop Image Upload */}
            <div
              ref={dropZoneRef}
              className={`drop-zone mb-3 p-4 text-center ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#0d6efd' : '#dee2e6'}`,
                borderRadius: '4px',
                backgroundColor: isDragging ? 'rgba(13, 110, 253, 0.05)' : 'transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
            >
              <div className="d-flex flex-column align-items-center">
                <i
                  className="bi bi-cloud-upload"
                  style={{ fontSize: '2rem', marginBottom: '0.5rem' }}
                />
                <p className="mb-2">Drag and drop an image here, or</p>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ maxWidth: '300px' }}
                  className="mb-2"
                />
                <small className="text-muted">Max file size: 1MB (5MB for GIFs)</small>
              </div>
            </div>
            {/* Image Preview */}
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
                >
                  ✖ Remove
                </Button>
              </div>
            )}
            <Button
              variant="primary"
              onClick={createPost}
              disabled={!isConnected || (!postText.trim() && !selectedImage)}
            >
              Post
            </Button>
          </Card>

          <Card className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">📜 Your Posts</h4>
              <Button variant="success" onClick={getPosts} disabled={isLoading}>
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
                  '🔄 Refresh'
                )}
              </Button>
            </div>
            {posts.length > 0 ? (
              <div>
                {posts.map(post => (
                  <Card key={post.cid} className="mb-3">
                    <Card.Body>
                      <Card.Text>{post.text}</Card.Text>
                      <MediaDisplay media={post.media} />
                      <div className="d-flex justify-content-between align-items-center text-muted small">
                        <div>
                          <span>
                            ❤️ {post.likeCount} • 🔁 {post.repostCount}
                          </span>
                          <span className="ms-2">• {formatDate(post.createdAt)}</span>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => viewPost(post.uri)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(post.uri)}
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
                {isLoading ? '🔄 Loading posts...' : 'No posts yet'}
              </Alert>
            )}
          </Card>
        </>
      )}
      {status && (
        <Alert variant={getStatusVariant()} className="mt-3">
          {status}
        </Alert>
      )}
      {/* Delete confirmation modal */}
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

<style jsx>{`
  .drop-zone.dragging {
    transform: scale(1.02);
  }

  .drop-zone:hover {
    border-color: #0d6efd !important;
    background-color: rgba(13, 110, 253, 0.05);
  }
`}</style>;
