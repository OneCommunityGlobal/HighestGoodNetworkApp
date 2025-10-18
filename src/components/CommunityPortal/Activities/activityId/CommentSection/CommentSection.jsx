import styles from './CommentSection.module.css';

function CommentSection({ comments, darkMode }) {
  return (
    <div>
      <div
        className={`${styles.activityCommentsSection} ${
          darkMode ? styles.activityCommentsSectionDark : ''
        }`}
      >
        {comments.map(comment => (
          <div
            key={comment.id}
            className={`${styles.activityComment} ${darkMode ? styles.activityCommentDark : ''}`}
          >
            <div className={styles.activityCommentUser}>
              <span
                className={`${styles.activityIcon} ${
                  Math.random() > 0.5 ? styles.purple : styles.blue
                }`}
              >
                {comment.name[0]}
              </span>
            </div>
            <div
              className={`${styles.activityCommentText} ${
                darkMode ? styles.activityCommentTextDark : ''
              }`}
            >
              {comment.comment}
              <div
                className={`${styles.activityCommentFooter} ${
                  darkMode ? styles.activityCommentFooterDark : ''
                }`}
              >
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
