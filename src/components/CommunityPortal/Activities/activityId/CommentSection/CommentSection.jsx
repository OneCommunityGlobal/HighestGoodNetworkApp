import PropTypes from 'prop-types';
import styles from './CommentSection.module.css';
import { useSelector } from 'react-redux';

const getAvatarColorClass = (stylesRef, name = '', index = 0) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = Math.trunc((hash << 5) - hash + name.codePointAt(i));
  }
  const isPurple = (hash + index) % 2 === 0;
  return isPurple ? stylesRef.purple : stylesRef.blue;
};

function CommentSection({ comments = [] }) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  return (
    <div className={darkMode ? styles.darkMode : ''}>
      <div className={styles.activityCommentsSection}>
        {comments.map((comment, index) => (
          <div key={comment.id} className={styles.activityComment}>
            <div className={styles.activityCommentUser}>
              <span
                className={`${styles.activityIcon} ${getAvatarColorClass(
                  styles,
                  comment.name,
                  index,
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

CommentSection.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      comment: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
    }),
  ),
};

CommentSection.defaultProps = {
  comments: [],
};
