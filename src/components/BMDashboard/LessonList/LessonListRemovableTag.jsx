import PropTypes from 'prop-types';
import styles from './LessonListForm.module.css';

function handleRemoveEvent(e, onRemove, tag) {
  e.preventDefault();
  e.stopPropagation();
  onRemove(tag);
}

function LessonListRemovableTag({ tag, darkMode, onRemove, variant }) {
  const isFilter = variant === 'filter';
  const tagClass = isFilter ? `${styles.tag} ${darkMode ? styles.tagDark : ''}` : styles.tag;
  const closeClass = isFilter
    ? `${styles.buttonClose} ${darkMode ? styles.buttonCloseDark : ''}`
    : styles.buttonClose;

  return (
    <div className={tagClass}>
      <span className={isFilter && darkMode ? styles.tagTextDark : ''}>{tag}</span>
      <span
        role="button"
        tabIndex={0}
        className={closeClass}
        onClick={e => handleRemoveEvent(e, onRemove, tag)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleRemoveEvent(e, onRemove, tag);
          }
        }}
        aria-label={isFilter ? `Remove ${tag} tag` : `Remove ${tag} from delete list`}
        style={{
          pointerEvents: 'auto',
          zIndex: 100,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </span>
    </div>
  );
}

LessonListRemovableTag.propTypes = {
  tag: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  onRemove: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['filter', 'delete']).isRequired,
};

LessonListRemovableTag.defaultProps = {
  darkMode: false,
};

export default LessonListRemovableTag;
