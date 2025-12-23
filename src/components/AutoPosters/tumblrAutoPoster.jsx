import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTumblrPosts, createTumblrPost, deleteTumblrPost } from '../../actions/tumblrActions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const TumblrAutoPoster = () => {
  const dispatch = useDispatch();
  const { loading, posts, error } = useSelector(state => state.tumblr);

  const [editingPost, setEditingPost] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTumblrPosts());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Open editor for create or edit
  const openEditor = (post = null) => {
    if (post) {
      setEditingPost(post);
      setEditorContent(post.content);
      setEditorTitle(post.title || '');
    } else {
      setEditingPost(null);
      setEditorContent('');
      setEditorTitle('');
    }
    setIsEditorOpen(true);
  };

  // Save handler (create post)
  const handleSavePost = () => {
    if (!editorContent) {
      toast.error('Post content cannot be empty');
      return;
    }

    const postData = {
      text: editorContent, // HTML string from React Quill
      tags: [], // optional
    };

    dispatch(createTumblrPost(postData))
      .then(() => {
        toast.success('Post created successfully');
        setEditingPost(null);
        setEditorContent('');
        setEditorTitle('');
        setIsEditorOpen(false);
      })
      .catch(err => toast.error(err.message || 'Failed to create post'));
  };

  const handleDeleteClick = post => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      dispatch(deleteTumblrPost(post.id))
        .then(() => toast.success('Post deleted successfully'))
        .catch(err => toast.error(err.message || 'Failed to delete post'));
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container my-5">
      <ToastContainer />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-4 text-center">Tumblr Posts</h1>
        <button className="btn btn-success" onClick={() => openEditor()}>
          Create Post
        </button>
      </div>

      {/* Editor */}
      {isEditorOpen && (
        <div className="card mb-4 p-3">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Post Title"
            value={editorTitle}
            onChange={e => setEditorTitle(e.target.value)}
          />
          <ReactQuill
            theme="snow"
            value={editorContent}
            onChange={setEditorContent}
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image', 'video'],
                ['clean'],
              ],
            }}
            formats={[
              'header',
              'bold',
              'italic',
              'underline',
              'strike',
              'list',
              'bullet',
              'link',
              'image',
              'video',
            ]}
            style={{ minHeight: '200px', maxHeight: '500px', marginBottom: '10px' }}
          />
          <div className="mt-2 d-flex">
            <button className="btn btn-primary me-2" onClick={handleSavePost}>
              Save
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingPost(null);
                setEditorContent('');
                setEditorTitle('');
                setIsEditorOpen(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Post List */}
      {posts.length === 0 && (
        <div className="alert alert-info text-center">No posts available.</div>
      )}

      <div className="row">
        {posts.map(post => (
          <div key={post.id} className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{post.title || 'Untitled Post'}</h5>

                <div dangerouslySetInnerHTML={{ __html: post.content }} />

                <div className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                  <span>{post.blogName}</span> ·{' '}
                  <span>{new Date(post.date).toLocaleDateString()}</span> ·{' '}
                  <span>{post.notes} notes</span>
                </div>

                {post.tags.length > 0 && (
                  <div className="mb-2">
                    {post.tags.map((tag, idx) => (
                      <span key={idx} className="badge bg-primary me-1">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <span>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm"
                    >
                      View on Tumblr
                    </a>
                  </span>
                  <div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteClick(post)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TumblrAutoPoster;
