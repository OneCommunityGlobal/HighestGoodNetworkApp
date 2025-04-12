import { useState } from 'react';
import { useSelector } from "react-redux";
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
    },
  ]);

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

  const darkMode = useSelector((state) => state.theme.darkMode);

  return (
    <div className={`comments-section ${darkMode  ? "comments-section-dark" : ""}`}>
      <div className="comments-header">
        <h2 className={`comments-title ${darkMode  ? "comments-title-dark" : ""}`}>
          Comments <span className={`comments-count ${darkMode  ? "comments-count-dark" : ""}`}>
            {sortedComments.length}
            </span>
        </h2>
        <div className={`sort-options ${darkMode  ? "sort-options-dark" : ""}`}>
          <label className={`filter ${darkMode  ? "filter-dark" : ""}`}>
            Filter by:
            <select value={filterBy} onChange={e => setFilterBy(e.target.value)}>
              <option value="likes">Likes</option>
              <option value="dislikes">Dislikes</option>
              <option value="time">Time Posted</option>
            </select>
          </label>
          <button type="button" onClick={handleSortChange} className={`sort-btn ${darkMode  ? "sort-btn-dark" : ""}`}>
            Sort {sortOrder === 'asc' ? <MdArrowUpward /> : <MdArrowDownward />}
          </button>
        </div>
      </div>

      <div className="comment-list">
        {sortedComments.map(comment => (
          <div key={comment.id} className={`comment-item ${darkMode  ? "comment-item-dark" : ""}`}>
            <div className="comment-content">
              <div className="comment-content-header">
                <img alt="User" className="comment-avatar" />
                <strong className="comment-user">{comment.user}</strong>
              </div>
              <p  className={`comment-text ${darkMode  ? "comment-text-dark" : ""}`}>{comment.text}</p>
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

                <button type="button" className="reply-button">
                  <FaReply /> Reply
                </button>
              </div>

              {comment.replies.length > 0 && (
                <div className="replies">
                  {comment.replies.map(reply => (
                    <div key={`${comment.id}-${reply.timestamp}`} className="reply">
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
    </div>
  );
}

export default Comments;
