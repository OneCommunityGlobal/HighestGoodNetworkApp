import PropTypes from 'prop-types';
import styles from './LessonListForm.module.css';

function handleRemoveEvent(e, onRemove, tag) {
  e.preventDefault();
  e.stopPropagation();
  onRemove(tag);
}

function buildClassName(...classNames) {
  return classNames.filter(Boolean).join(' ');
}

function getTagClassName(darkMode) {
  return buildClassName(styles.tag, darkMode && styles.tagDark);
}

function getCloseClassName(darkMode) {
  return buildClassName(styles.buttonClose, darkMode && styles.buttonCloseDark);
}

function getRemoveAriaLabel(isFilter, tag) {
  if (isFilter) {
    return `Remove ${tag} tag`;
  }
  return `Remove ${tag} from delete list`;
}

function LessonListRemovableTag({ tag, darkMode, onRemove, variant }) {
  const isFilter = variant === 'filter';
  const tagClass = getTagClassName(darkMode);
  const closeClass = getCloseClassName(darkMode);
  const removeAriaLabel = getRemoveAriaLabel(isFilter, tag);
  const tagTextClass = darkMode ? styles.tagTextDark : '';

  const handleClick = e => handleRemoveEvent(e, onRemove, tag);
  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleRemoveEvent(e, onRemove, tag);
    }
  };

  return (
    <div className={tagClass}>
      <span className={tagTextClass}>{tag}</span>
      <button
        type="button"
        className={closeClass}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={removeAriaLabel}
      >
        ×
      </button>
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
