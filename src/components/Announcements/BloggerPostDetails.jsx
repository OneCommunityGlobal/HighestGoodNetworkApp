import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { faPlus, faSpinner, faPen, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
import './BloggerPostDetails.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import BloggerIcon from '../../assets/images/blogger-icon.png';

axios.defaults.baseURL = 'http://localhost:4500';
axios.defaults.headers.common['Content-Type'] = 'application/json';

function BloggerPostDetails() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedCount, setPublishedCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [editMode, setEditMode] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchBlogPosts = async () => {
    try {
      if (!isConnected) {
        setPosts([]);
        setDraftCount(0);
        setPublishedCount(0);
        setScheduledCount(0);
        return;
      }

      setIsLoading(true);
      const res = await axios.get('/api/auth/blogger/posts');
      const newPosts = res.data.posts || [];
      setPosts(newPosts);

      setScheduledCount(res.data.summary?.scheduled || 0);
      setPublishedCount(res.data.summary?.published || 0);
      setDraftCount(res.data.summary?.draft || 0);
    } catch (err) {
      setPosts([]);
      setDraftCount(0);
      setPublishedCount(0);
      setScheduledCount(0);
      if (err.response?.status === 401) {
        setIsConnected(false);
        toast.error('Blogger authentication expired. Please reconnect.');
      } else if (err.response?.status === 404) {
        toast.error(err.response.data?.error || 'Blog not found');
      } else {
        toast.error('Failed to fetch blog posts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkBloggerConnection = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/api/auth/blogger/status');
      setIsConnected(res.data.connected);
      if (!res.data.connected) {
        setPosts([]);
        setDraftCount(0);
        setPublishedCount(0);
      }
    } catch (err) {
      setIsConnected(false);
      setPosts([]);
      setDraftCount(0);
      setPublishedCount(0);
      toast.error('Failed to check Blogger connection');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    const state = params.get('state');
    const error = params.get('error');
    const storedState = sessionStorage.getItem('bloggerAuthState');

    const cleanUp = () => {
      sessionStorage.removeItem('bloggerAuthState');
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    if (authStatus === 'success' && state) {
      if (storedState && state === storedState) {
        toast.success('Successfully connected to Blogger!');
        setIsConnected(true);
        checkBloggerConnection();
      } else {
        toast.error('Invalid authentication state - please try connecting again');
        setIsConnected(false);
      }
    } else if (authStatus === 'error') {
      toast.error(`Failed to connect to Blogger: ${error || 'Unknown error'}`);
      setIsConnected(false);
    }

    cleanUp();
  }, []);

  useEffect(() => {
    checkBloggerConnection();
    fetchBlogPosts();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchBlogPosts();
    } else {
      setPosts([]);
      setDraftCount(0);
      setPublishedCount(0);
    }
  }, [isConnected]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      toast.info('Connecting to Blogger...');
      const res = await axios.get('/api/auth/blogger/auth');
      sessionStorage.setItem('bloggerAuthState', res.data.state);
      sessionStorage.setItem('bloggerReturnUrl', window.location.href);
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(`Connection failed: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handlePost = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your blog post');
      return;
    }

    try {
      setIsPublishing(true);

      const payload = { title, content };
      if (scheduleDate) {
        payload.scheduleDate = scheduleDate.toISOString();
      }

      const res = await axios.post('/api/auth/blogger/post', payload);

      const newPost = res.data.post;
      if (newPost.status === 'live' || newPost.status === 'published') {
        const now = new Date();
        const publishedDate = new Date(newPost.published);
        if (publishedDate > now) {
          newPost.status = 'scheduled';
        } else {
          newPost.status = 'published';
        }
      }

      setPosts(prev => [newPost, ...prev]);

      if (newPost.status === 'draft') {
        setDraftCount(prev => prev + 1);
      } else if (newPost.status === 'scheduled') {
        setScheduledCount(prev => prev + 1);
      } else {
        setPublishedCount(prev => prev + 1);
      }

      setTitle('');
      setContent('');
      setScheduleDate(null);

      toast.success('Blog post published successfully!');
    } catch (err) {
      toast.error('Failed to publish blog post');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEdit = post => {
    setEditMode(true);
    setEditingPostId(post.id);
    setTitle(post.title || '');
    setContent(post.content || '');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingPostId(null);
    setTitle('');
    setContent('');
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title for your blog post');
      return;
    }

    try {
      setIsPublishing(true);
      const res = await axios.put(`/api/auth/blogger/post/${editingPostId}`, {
        title,
        content,
      });
      toast.success('Post updated!');
      setPosts(prev => prev.map(p => (p.id === editingPostId ? res.data.post : p)));
      cancelEdit();
    } catch (err) {
      toast.error('Failed to update post');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async postId => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`/api/auth/blogger/post/${postId}`);
      toast.success('Post deleted');
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const sortPosts = postsArray => {
    return [...postsArray].sort((a, b) => {
      const dateA = new Date(a.published).getTime();
      const dateB = new Date(b.published).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  };

  const statusLabels = {
    draft: 'Draft',
    scheduled: 'Scheduled',
    published: 'Published',
  };

  let connectionStatusElement;

  if (isLoading) {
    connectionStatusElement = <FontAwesomeIcon icon={faSpinner} spin />;
  } else if (isConnected) {
    connectionStatusElement = (
      <div style={{ color: 'green' }}>
        <FontAwesomeIcon icon={faCheck} />
        <span style={{ marginLeft: 5 }}>Connected</span>
        <button
          type="button"
          onClick={() => setIsConnected(false)}
          title="Disconnect"
          aria-label="Disconnect"
          style={{ marginLeft: 10 }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    );
  } else {
    connectionStatusElement = (
      <button type="button" onClick={handleConnect} disabled={isLoading}>
        <FontAwesomeIcon icon={faPlus} /> Connect to Blogger
      </button>
    );
  }

  return (
    <div
      className={`blogger-post-details ${darkMode ? 'dark' : ''}`}
      style={{ padding: '1rem', borderRadius: 8 }}
    >
      <div
        className="blogger-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div
          className="blogger-title"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <img src={BloggerIcon} alt="Blogger" style={{ width: 24, height: 24 }} />
          <h3 style={{ margin: 0 }}>Blogger Integration</h3>
        </div>

        <div className="connection-status">{connectionStatusElement}</div>
      </div>

      {isConnected && (
        <div className="blog-content">
          <div className="post-stats">
            <span>Recent post: {publishedCount}</span>
            <span>Scheduled: {scheduledCount}</span>
            <span>Draft: {draftCount}</span>
          </div>

          {/* Schedule Date */}
          <div className="datepicker-wrapper">
            <label htmlFor="scheduleDate">Schedule Date (Optional):</label>
            <div className="datepicker-input-group">
              <FaCalendarAlt className="calendar-icon" />
              <DatePicker
                selected={scheduleDate || new Date()}
                onChange={date => setScheduleDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="Pp"
                placeholderText="Select date & time"
                minDate={new Date()}
                maxDate={new Date(new Date().setMonth(new Date().getMonth() + 6))}
                className="date-picker-input"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Enter blog post title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="post-title-input"
          />

          <div className="post-form">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ color: [] }, { background: [] }],
                  [{ align: [] }],
                  ['link', 'image'],
                  ['clean'],
                ],
              }}
              style={{ height: '300px', width: '600px', marginBottom: '30px' }}
            />
          </div>

          {editMode ? (
            <div className="button-group">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isPublishing}
                className="update-button"
              >
                {isPublishing ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPen} />
                    <span>Update Post</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isPublishing}
                className="cancel-button"
              >
                <FontAwesomeIcon icon={faTimes} />
                <span>Cancel</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePost}
              disabled={isPublishing}
              className="publish-button"
            >
              {isPublishing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Publish Post</span>
                </>
              )}
            </button>
          )}

          {/* Sort Button */}
          <div className="sort-button-wrapper">
            <button
              type="button"
              className="sort-button"
              onClick={() => setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            >
              Sort by Date: {sortOrder === 'desc' ? 'Newest First ↓' : 'Oldest First ↑'}
            </button>
          </div>

          {/* Posts List */}
          {sortPosts(posts).length > 0 && (
            <div className="posts-list">
              {sortPosts(posts).map(post => (
                <div key={post.id} className="post-item">
                  <div className="post-info">
                    <h4>{post.title || '(Untitled)'}</h4>
                    <div className="post-meta">
                      <span className={`status ${post.status}`}>
                        {statusLabels[post.status] || 'Unknown'}
                      </span>

                      <span className="date">
                        {new Date(post.published).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="post-actions">
                    {post.url && (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-post"
                      >
                        View Post
                      </a>
                    )}

                    <button type="button" onClick={() => handleEdit(post)} className="edit-button">
                      <FontAwesomeIcon icon={faPen} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="delete-button"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BloggerPostDetails;
