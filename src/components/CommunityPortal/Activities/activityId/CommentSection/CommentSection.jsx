import PropTypes from 'prop-types';
import styles from './CommentSection.module.css';

function CommentSection({ comments }) {
  return (
    <div>
      <div className={styles.commentsSection}>
        {comments.map(comment => (
          <div key={comment.id} className={styles.comment}>
            <div className={styles.commentUser}>
              <span
                className={`${styles.icon} ${comment.id % 2 === 0 ? styles.purple : styles.blue}`}
              >
                {comment.name[0]}
              </span>
            </div>
            <div className={styles.commentText}>
              {comment.comment}
              <div className={styles.commentFooter}>
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

CommentSection.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      comment: PropTypes.string.isRequired,
      time: PropTypes.string,
    }),
  ).isRequired,
};

export default CommentSection;
