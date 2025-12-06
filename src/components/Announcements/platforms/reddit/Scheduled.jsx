import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../../../utils/URL';
import SubmitPost from './SubmitPost';
import { Modal, ModalFooter, Button } from 'reactstrap';

export default function Scheduled() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);

  // editing state to open SubmitPost with initial data
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  async function fetchScheduledPosts() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${ENDPOINTS.AP_REDDIT_POST}`, {
        params: { status: 'scheduled' },
      });

      setPosts(res.data.posts || []);
    } catch (error) {
      setError('Unable to load scheduled posts');
      toast.error('Unable to load scheduled posts for Reddit');
    } finally {
      setLoading(false);
    }
  }

  const formatSchedule = dateToFormat => {
    const d = new Date(dateToFormat);
    const options = { month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const handleCancelPost = async postId => {
    const confirmDelete = window.confirm(`Are you sure you wnat to delete this post?`);
    if (!confirmDelete) return;
    try {
      const res = await axios.delete(`${ENDPOINTS.AP_REDDIT_POST}/${postId}`);

      if (res?.status === 200) {
        toast.success(res.data?.message || 'Scheduled post cancelled');
        fetchScheduledPosts();
      } else {
        toast.error(res?.data?.message || 'ubable to cancel scheduled post');
      }
    } catch (err) {
      toast.error('Unable to cancel scheduled post');
    }
  };

  const handleEditPost = post => {
    setEditingPost({
      id: post.id || post._id,
      title: post.title || '',
      content: post.content || '',
      subreddit: post.subreddit || '',
      postType: post.postType || 'text',
      link: post.link || post.url || '',
      scheduledAt: post.scheduledAt || post.scheduled_at || '',
    });
  };

  // called by SubmitPost after successful update
  const handleEditedSaved = () => {
    setEditingPost(null);
    fetchScheduledPosts();
  };

  const handleEditClose = () => setEditingPost(null);

  const handleEditChange = (field, value) => {
    setEditingPost(prev => ({ ...prev, [field]: value }));
  };

  const toggle = () => setModal(!modal);

  return (
    <>
      {/* render SubmitPost as overlay/modal when editingPost is set */}
      <Modal isOpen={!!editingPost} onClose={handleEditClose} size="xl">
        {editingPost && (
          <SubmitPost
            initialData={editingPost}
            onSaved={handleEditedSaved}
            onCancelEdit={handleEditClose}
          />
        )}
        <ModalFooter>
          <Button color="secondary" onClick={handleEditClose}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
      <div>
        <p>
          <strong>Scheduled Posts for Reddit</strong>
        </p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map(p => (
            <li
              key={p._id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                padding: '12px',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div>
                  {p.scheduled_at ? formatSchedule(p.scheduled_at) : 'No Scheduled time'}
                  {` - ${p.title}`}
                </div>
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleCancelPost(p.id || p._id)}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      marginRight: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditPost(p)}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
