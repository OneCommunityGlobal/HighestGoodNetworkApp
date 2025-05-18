import React, { useState } from 'react';
import './InstagramScheduledPostsEditor.css';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

/**
 * Component for displaying and managing scheduled Instagram posts
 * 
 * @param {Array} posts - List of scheduled Instagram posts
 * @param {boolean} isLoading - Whether posts are currently loading
 * @param {string} error - Error message if any
 * @param {function} onDeletePost - Function to delete a post
 * @param {function} onRefresh - Function to refresh post list
 * @returns {JSX.Element} Scheduled posts interface
 */
function InstagramScheduledPostsEditor({ 
  posts = [], 
  isLoading = false, 
  error = '', 
  onDeletePost = () => {},
  onRefresh = () => {}
}) {
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('scheduled');

  /**
   * Toggles the expanded state of a post card
   * 
   * @param {string} postId - ID of the post to toggle expansion
   */
  const handleExpandClick = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  /**
   * Handles the delete action for a scheduled post with confirmation
   * 
   * @param {string} postId - ID of the post to delete
   * @returns {Promise<void>}
   */
  const handleDeleteClick = async (postId) => {
    if (window.confirm('Are you sure you want to delete this scheduled post?')) {
      try {
        await onDeletePost(postId);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  /**
   * Filters posts based on the selected category (scheduled/published/failed)
   * 
   * @returns {Array} Filtered posts based on active category
   */
  const getFilteredPosts = () => {
    if (!posts || !posts.length) return [];
    
    switch(activeCategory) {
      case 'scheduled':
        return posts.filter(post => post.status === 'scheduled' || post.status === 'pending');
      case 'published':
        return posts.filter(post => post.status === 'published' || post.status === 'posted');
      case 'failed':
        return posts.filter(post => post.status === 'failed' || post.status === 'error');
      default:
        return posts;
    }
  };

  const filteredPosts = getFilteredPosts();

  /**
   * Formats a date string into a user-friendly format
   * 
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted date string
   */
  const formatScheduledDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="scheduled-posts-editor">
        <div className="scheduled-posts-header">
          <h3>Scheduled Posts</h3>
          <button className="refresh-button" onClick={onRefresh} disabled={isLoading}>
            Refresh
          </button>
        </div>
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading scheduled posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scheduled-posts-editor">
        <div className="scheduled-posts-header">
          <h3>Scheduled Posts</h3>
          <button className="refresh-button" onClick={onRefresh}>
            Refresh
          </button>
        </div>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduled-posts-editor">
      <div className="scheduled-posts-header">
        <h3>Scheduled Posts</h3>
        <button className="refresh-button" onClick={onRefresh}>
          Refresh
        </button>
      </div>
      <div className="scheduled-posts-categories-header">
        <button
          onClick={() => setActiveCategory('scheduled')}
          className={`scheduled-posts-tab-category ${activeCategory === 'scheduled' ? 'active' : ''}`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setActiveCategory('published')}
          className={`scheduled-posts-tab-category ${activeCategory === 'published' ? 'active' : ''}`}
        >
          Posted
        </button>
        <button
          onClick={() => setActiveCategory('failed')}
          className={`scheduled-posts-tab-category ${activeCategory === 'failed' ? 'active' : ''}`}
        >
          Failed
        </button>
      </div>
      <div className="scheduled-posts-grid">
        {filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div 
              key={post._id} 
              className={`scheduled-post-card ${expandedPostId === post._id ? 'expanded' : ''}`}
            >
              <div className="scheduled-post-image">
                <img src={post.imgurImageUrl} alt="Scheduled post" />
                <div className="scheduled-time">
                  <span className="time-icon">🕒</span>
                  {formatScheduledDate(post.scheduledTime)}
                </div>
              </div>
              
              <div className="scheduled-post-content">
                <div className="scheduled-post-header">
                  <p className="scheduled-post-status">Status: <span className={post.status}>{post.status}</span></p>
                  <div className="scheduled-post-actions">
                    <button 
                      className="expand-button"
                      onClick={() => handleExpandClick(post._id)}
                      aria-label={expandedPostId === post._id ? "Collapse" : "Expand"}
                    >
                      {expandedPostId === post._id ? '▲' : '▼'}
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteClick(post._id)}
                      aria-label="Delete post"
                    >
                      ✖
                    </button>
                  </div>
                </div>
                
                <div className="scheduled-post-caption">
                  {expandedPostId === post._id ? (
                    <p>{post.caption}</p>
                  ) : (
                    <p>{post.caption.length > 100 ? `${post.caption.substring(0, 100)}...` : post.caption}</p>
                  )}
                </div>
                
                {expandedPostId === post._id && (
                  <div className="scheduled-post-details">
                    <p><strong>Job ID:</strong> {post.jobId}</p>
                    <p><strong>Created:</strong> {new Date(post.createdAt).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(post.updatedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts-message">
            <p>No {activeCategory} posts found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstagramScheduledPostsEditor;