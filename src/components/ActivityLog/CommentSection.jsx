import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import styles from './styles/CommentSection.module.css';
import { IconByRole, Tag } from './icons';
import { useSelector } from 'react-redux';

const CommentSection = ({ logId, comments, userRole, handleCommentSubmit }) => {
  const [newComment, setNewComment] = useState('');

  const darkMode = useSelector(state => state.theme.darkMode);
  const onSubmit = () => {
    if (newComment.trim()) {
      handleCommentSubmit(logId, newComment);
      setNewComment('');
    }
  };

  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.commentSectionContainer}`}>
        <h2 className={`${styles.commentSectionTitle}`}>Interaction / Comments</h2>

        {/* Display Existing Comments */}
        <div className={`${styles.commentList}`}>
          {comments.length === 0 && (
            <p className={`${styles.noComments}`}>No comments yet. Start the conversation!</p>
          )}
          {comments.map(comment => (
            <div key={comment.id} className={`${styles.commentCard}`}>
              <div className={`${styles.commentHeader}`}>
                <IconByRole role={comment.role} className={`${styles.commentIcon}`} />
                <span className={`${styles.commentAuthor}`}>{comment.author}</span>
                <Tag colorClass={styles.commentRoleTag}>{comment.role}</Tag>
              </div>
              <p className={`${styles.commentText}`}>{comment.text}</p>
            </div>
          ))}
        </div>

        <div className={`${styles.commentInputWrapper}`}>
          <textarea
            rows="2"
            placeholder={`Leave a comment to interact... (As ${userRole})`}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className={`${styles.commentTextarea}`}
          ></textarea>
          <button
            onClick={onSubmit}
            disabled={!newComment.trim()}
            className={`${styles.commentSubmitBtn} ${
              !newComment.trim() ? styles.commentSubmitDisabled : ''
            }`}
          >
            <MessageSquare className={`${styles.submitIcon}`} />
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
