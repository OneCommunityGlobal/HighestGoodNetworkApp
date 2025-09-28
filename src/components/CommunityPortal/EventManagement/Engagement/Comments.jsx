import { useState } from 'react';
import { useSelector } from 'react-redux';
import './Comments.css';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { FaThumbsUp, FaThumbsDown, FaReply } from 'react-icons/fa';

function Comments() {
  const [filterBy, setFilterBy] = useState('time');
  const [sortOrder, setSortOrder] = useState('desc');
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'Jane Doe',
      text: 'This is a comment',
      likes: 5,
      dislikes: 2,
      timestamp: new Date('2025-02-25T10:30:00Z'),
      userAction: null,
      replies: [],
      visibility: 'public',
    },
    {
      id: 2,
      user: 'John Smith',
      text:
        'This event was incredibly well-organized and insightful. Looking forward to attending more sessions like this!',
      likes: 10,
      dislikes: 1,
      timestamp: new Date('2025-01-26T08:00:00Z'),
      userAction: null,
      replies: [],
      visibility: 'public',
    },
    {
      id: 3,
      user: 'Alice Johnson',
      text: 'Yet another comment',
      likes: 7,
      dislikes: 3,
      timestamp: new Date('2025-02-27T09:15:00Z'),
      userAction: null,
      replies: [],
      visibility: 'private',
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [visibleCount, setVisibleCount] = useState(2); // pagination

  const formatTimestamp = date => {
    const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hr ago`;
    }
    return `${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) > 1 ? 's' : ''} ago`;
  };

  const handleVote = (id, type) => {
    setComments(
      comments.map(comment => {
        if (comment.id === id && comment.userAction === null) {
          return {
            ...comment,
            likes: type === 'like' ? comment.likes + 1 : comment.likes,
            dislikes: type === 'dislike' ? comment.dislikes + 1 : comment.dislikes,
            userAction: type,
          };
        }
        return comment;
      }),
    );
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (filterBy === 'likes') {
      return sortOrder === 'asc' ? a.likes - b.likes : b.likes - a.likes;
    }
    if (filterBy === 'dislikes') {
      return sortOrder === 'asc' ? a.dislikes - b.dislikes : b.dislikes - a.dislikes;
    }
    return sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
  });

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const newEntry = {
      id: Date.now(),
      user: 'You',
      text: newComment,
      likes: 0,
      dislikes: 0,
      timestamp: new Date(),
      userAction: null,
      replies: [],
      visibility,
    };
    setComments([newEntry, ...comments]);
    setNewComment('');
  };

  const handleReply = parentId => {
    if (!replyText.trim()) return;
    const reply = {
      text: replyText,
      timestamp: new Date(),
    };
    setComments(
      comments.map(c => (c.id === parentId ? { ...c, replies: [...c.replies, reply] } : c)),
    );
    setReplyText('');
    setReplyingTo(null);
  };

  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`comments-section ${darkMode ? 'comments-section-dark' : ''}`}>
      {/* Comment Input Box */}
      <div className="comment-input-box">
        <textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className={`comment-input ${darkMode ? 'comment-input-dark' : ''}`}
        />
        <div className="comment-input-actions">
          <select
            value={visibility}
            onChange={e => setVisibility(e.target.value)}
            className="visibility-select"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button type="button" className="post-button" onClick={handlePostComment}>
            Post
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="comments-header">
        <h2 className={`comments-title ${darkMode ? 'comments-title-dark' : ''}`}>
          Comments{' '}
          <span className={`comments-count ${darkMode ? 'comments-count-dark' : ''}`}>
            {sortedComments.length}
          </span>
        </h2>
        <div className={`sort-options ${darkMode ? 'sort-options-dark' : ''}`}>
          <label className={`filter ${darkMode ? 'filter-dark' : ''}`}>
            Filter by:
            <select value={filterBy} onChange={e => setFilterBy(e.target.value)}>
              <option value="likes">Likes</option>
              <option value="dislikes">Dislikes</option>
              <option value="time">Time Posted</option>
            </select>
          </label>
          <button
            type="button"
            onClick={handleSortChange}
            className={`sort-btn ${darkMode ? 'sort-btn-dark' : ''}`}
          >
            Sort {sortOrder === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />}
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="comment-list">
        {sortedComments.slice(0, visibleCount).map(comment => (
          <div key={comment.id} className={`comment-item ${darkMode ? 'comment-item-dark' : ''}`}>
            <div className="comment-content">
              <div className="comment-content-header">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user)}`}
                  alt="User"
                  className="comment-avatar"
                />
                <strong className="comment-user">{comment.user}</strong>
                <span className="visibility-tag">{comment.visibility}</span>
              </div>
              <p className={`comment-text ${darkMode ? 'comment-text-dark' : ''}`}>
                {comment.text}
              </p>
              <div className="comment-actions">
                <div className="comment-votes">
                  <button
                    type="button"
                    className="like-button"
                    onClick={() => handleVote(comment.id, 'like')}
                    disabled={comment.userAction !== null}
                  >
                    <FaThumbsUp /> {comment.likes}
                  </button>
                  <button
                    type="button"
                    className="dislike-button"
                    onClick={() => handleVote(comment.id, 'dislike')}
                    disabled={comment.userAction !== null}
                  >
                    <FaThumbsDown /> {comment.dislikes}
                  </button>
                </div>

                <span className="comment-time">{formatTimestamp(comment.timestamp)}</span>

                <button
                  type="button"
                  className="reply-button"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  <FaReply /> Reply
                </button>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="reply-box">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <button className="reply-btn" onClick={() => handleReply(comment.id)}>
                    Reply
                  </button>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="replies">
                  {comment.replies.map((reply, idx) => (
                    <div key={`${comment.id}-${idx}`} className="reply">
                      <span>{reply.text}</span>
                      <span className="reply-time">{formatTimestamp(reply.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {visibleCount < sortedComments.length && (
        <div className="load-more">
          <button onClick={() => setVisibleCount(visibleCount + 2)}>Load More</button>
        </div>
      )}
    </div>
  );
}

export default Comments;
