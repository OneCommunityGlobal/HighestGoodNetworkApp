import styles from './CommentSection.module.css';

function CommentSection({ comments }) {
  return (
    <div>
      <div className={styles['activity-comments-section']}>
        {comments.map(comment => (
          <div key={comment.id} className={styles['activity-comment']}>
            <div className={styles['activity-comment-user']}>
              <span
                className={`${styles['activity-icon']} ${
                  comment.id % 2 === 0 ? styles.purple : styles.blue
                }`}
              >
                {comment.name[0]}
              </span>
            </div>
            <div className={styles['activity-comment-text']}>
              {comment.comment}
              <div className={styles['activity-comment-footer']}>
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
