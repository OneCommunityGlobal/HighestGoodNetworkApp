import styles from './CommentSection.module.css';
import { useSelector } from 'react-redux';

function CommentSection({ comments }) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  return (
    <div className={darkMode ? styles.darkMode : ''}>
      <div className={styles.activityCommentsSection}>
        {comments.map(comment => (
          <div key={comment.id} className={styles.activityComment}>
            <div className={styles.activityCommentUser}>
              <span
                className={`${styles.activityIcon} ${
                  Math.random() > 0.5 ? styles.purple : styles.blue
                }`}
              >
                {comment.name[0]}
              </span>
            </div>
            <div className={styles.activityCommentText}>
              {comment.comment}
              <div className={styles.activityCommentFooter}>
                <span>{comment.name} - </span>
                <span>{comment.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
