import PropTypes from 'prop-types';
import { EMOJI_OPTIONS } from './constants';
import styles from './UserState.module.css';

function EmojiPicker({ darkMode, onSelect }) {
  return (
    <div className={`${styles.emojiPickerGrid} ${darkMode ? styles.dark : styles.light}`}>
      {EMOJI_OPTIONS.map(emoji => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={styles.emojiBtn}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

EmojiPicker.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default EmojiPicker;
