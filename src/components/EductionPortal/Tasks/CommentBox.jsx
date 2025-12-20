import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './CommentBox.module.css';

function CommentBox({
  onSubmit,
  placeholder = 'Please enter your comments/Queries here',
  disabled = false,
}) {
  const darkMode = useSelector(state => state.theme?.darkMode);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = e => {
    e.preventDefault();

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError('Comment cannot be empty');
      textareaRef.current?.focus();
      return;
    }

    if (trimmedComment.length > 1000) {
      setError('Comment must be less than 1000 characters');
      textareaRef.current?.focus();
      return;
    }

    onSubmit(trimmedComment);
    setComment('');
    setError('');
  };

  const handleChange = e => {
    const newValue = e.target.value;
    setComment(newValue);

    // Clear error when user starts typing
    if (error) {
      setError('');
    }

    // Show error immediately when exceeding 1000 characters
    if (newValue.length > 1000) {
      setError('Comment must be less than 1000 characters');
    }
  };

  return (
    <div className={`${styles.commentBox} ${darkMode ? styles.commentBoxDark : ''}`}>
      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={`${styles.commentInput} ${error ? styles.inputError : ''} ${
              darkMode ? styles.commentInputDark : ''
            }`}
            placeholder={placeholder}
            value={comment}
            onChange={handleChange}
            disabled={disabled}
            rows={4}
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
        <div className={styles.commentActions}>
          <span
            className={`${styles.characterCount} ${darkMode ? styles.characterCountDark : ''} ${
              comment.length > 1000 ? styles.characterCountError : ''
            }`}
          >
            {comment.length}/1000
          </span>
          <button
            type="submit"
            className={`${styles.submitButton} ${darkMode ? styles.submitButtonDark : ''}`}
            disabled={disabled}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

CommentBox.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

export default CommentBox;
