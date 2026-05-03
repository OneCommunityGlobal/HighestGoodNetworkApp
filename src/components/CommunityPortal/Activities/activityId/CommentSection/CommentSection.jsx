import styles from './CommentSection.module.css';
import { useSelector } from 'react-redux';

const getAvatarColorClass = (name = '', index = 0, stylesRef) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const isPurple = (hash + index) % 2 === 0;
  return isPurple ? stylesRef.purple : stylesRef.blue;
};

function CommentSection({ comments }) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  return (
    <div className={darkMode ? styles.darkMode : ''}>
      <div className={styles.activityCommentsSection}>
        {comments.map((comment, index) => (
          <div key={comment.id} className={styles.activityComment}>
            <div className={styles.activityCommentUser}>
              <span
                className={`${styles.activityIcon} ${getAvatarColorClass(
                  comment.name,
                  index,
                  styles,
                )}`}
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
