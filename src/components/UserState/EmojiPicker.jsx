import PropTypes from 'prop-types';
import { EMOJI_OPTIONS } from './constants';
import styles from './UserState.module.css';

function EmojiPicker({ darkMode, onSelect, usedEmojis = [], selectedEmoji = '' }) {
  const isSelectedUsed = selectedEmoji && usedEmojis.includes(selectedEmoji);
  return (
    <div className={`${styles.emojiPickerGrid} ${darkMode ? styles.dark : styles.light}`}>
      {EMOJI_OPTIONS.map(emoji => {
        const isUsed = usedEmojis.includes(emoji);
        return (
          <div key={emoji} className={styles.swatchWrapper}>
            <button
              type="button"
              onClick={() => onSelect(emoji)}
              className={`${styles.emojiBtn} ${isUsed ? styles.emojiUsed : ''}`}
              title={isUsed ? `${emoji} already in use by another state` : emoji}
            >
              {emoji}
            </button>
            {isUsed && (
              <span className={styles.swatchUsedDot} title="Already in use">
                ●
              </span>
            )}
          </div>
        );
      })}
      {isSelectedUsed && (
        <p className={`${styles.colorWarning} ${styles.emojiWarning}`}>⚠️ Emoji already in use</p>
      )}
    </div>
  );
}

EmojiPicker.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  usedEmojis: PropTypes.arrayOf(PropTypes.string),
  selectedEmoji: PropTypes.string,
};

EmojiPicker.defaultProps = {
  usedEmojis: [],
  selectedEmoji: '',
};

export default EmojiPicker;
