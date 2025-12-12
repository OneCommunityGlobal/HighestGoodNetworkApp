import { useSelector } from 'react-redux';
import styles from './CommentList.module.css';

function CommentList({
  comments = [],
  loading = false,
  emptyMessage = 'No comments yet.',
  onDeleteComment,
  currentUserId,
}) {
  const darkMode = useSelector(state => state.theme?.darkMode);

  const getInitials = name => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const formatTimeAgo = date => {
    const now = new Date();
    const commentDate = new Date(date);
    const seconds = Math.floor((now - commentDate) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  if (loading) {
    return (
      <div className={`${styles.commentList} ${darkMode ? styles.commentListDark : ''}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Loading comments...</span>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={`${styles.commentList} ${darkMode ? styles.commentListDark : ''}`}>
        <div className={`${styles.emptyState} ${darkMode ? styles.emptyStateDark : ''}`}>
          <svg
            className={styles.emptyIcon}
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.commentList} ${darkMode ? styles.commentListDark : ''}`}>
      <div className={styles.commentsHeader}>
        <h3 className={`${styles.commentsTitle} ${darkMode ? styles.commentsTitleDark : ''}`}>
          Comments/Queries Section
        </h3>
      </div>

      <div className={styles.commentsContainer}>
        {comments.map(comment => (
          <div
            key={comment.id}
            className={`${styles.commentItem} ${darkMode ? styles.commentItemDark : ''}`}
          >
            <div className={styles.commentHeader}>
              <div className={styles.userInfo}>
                <div className={`${styles.avatar} ${darkMode ? styles.avatarDark : ''}`}>
                  {getInitials(comment.author)}
                </div>
                <div className={styles.authorDetails}>
                  <span className={`${styles.authorName} ${darkMode ? styles.authorNameDark : ''}`}>
                    {comment.author}
                  </span>
                  {comment.role && (
                    <span
                      className={`${styles.authorRole} ${darkMode ? styles.authorRoleDark : ''}`}
                    >
                      {comment.role}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.commentActions}>
                <span className={`${styles.timestamp} ${darkMode ? styles.timestampDark : ''}`}>
                  {formatTimeAgo(comment.createdAt)}
                </span>
                {onDeleteComment && comment.userId === currentUserId && (
                  <button
                    className={`${styles.deleteButton} ${darkMode ? styles.deleteButtonDark : ''}`}
                    onClick={() => onDeleteComment(comment.id)}
                    title="Delete comment"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div
              className={`${styles.commentContent} ${darkMode ? styles.commentContentDark : ''}`}
            >
              {comment.content}
            </div>

            {comment.edited && (
              <div className={`${styles.editedBadge} ${darkMode ? styles.editedBadgeDark : ''}`}>
                (edited)
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentList;
