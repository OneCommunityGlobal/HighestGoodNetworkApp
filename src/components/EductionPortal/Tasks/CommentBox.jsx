import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
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
      return;
    }

    onSubmit(trimmedComment);
    setComment('');
    setError('');
  };

  const handleChange = e => {
    setComment(e.target.value);
    if (error) {
      setError('');
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
            maxLength={1000}
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
        <div className={styles.commentActions}>
          <span className={`${styles.characterCount} ${darkMode ? styles.characterCountDark : ''}`}>
            {comment.length}/1000
          </span>
          <button
            type="submit"
            className={`${styles.submitButton} ${darkMode ? styles.submitButtonDark : ''}`}
            disabled={disabled || !comment.trim()}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommentBox;
