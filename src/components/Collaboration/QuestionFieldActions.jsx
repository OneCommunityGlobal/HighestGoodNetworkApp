import PropTypes from 'prop-types';
import styles from './QuestionFieldActions.module.css';

function QuestionFieldActions({
  field,
  index,
  totalFields,
  onClone,
  onMove,
  onDelete,
  onEdit,
  visible,
  onVisibilityChange,
}) {
  return (
    <div className={styles.fieldControls}>
      <input
        type="checkbox"
        id={`form-div-checkbox-${index}`}
        checked={visible}
        onChange={onVisibilityChange}
        className={styles.visibilityCheckbox}
      />
      <div className={styles.fieldActions}>
        <button
          type="button"
          onClick={() => onEdit(field, index)}
          className={styles.editButton}
          title="Edit this question"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onClone(field, index)}
          className={styles.cloneButton}
          title="Clone this question"
        >
          Clone
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 'up')}
          className={styles.moveButton}
          disabled={index === 0}
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 'down')}
          className={styles.moveButton}
          disabled={index === totalFields - 1}
          title="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className={styles.deleteButton}
          title="Delete question"
        >
          ×
        </button>
      </div>
    </div>
  );
}

QuestionFieldActions.propTypes = {
  field: PropTypes.shape({
    questionText: PropTypes.string,
    questionType: PropTypes.string,
    visible: PropTypes.bool,
    isRequired: PropTypes.bool,
    required: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.string),
    placeholder: PropTypes.string,
    label: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  totalFields: PropTypes.number.isRequired,
  onClone: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  onVisibilityChange: PropTypes.func.isRequired,
};

export default QuestionFieldActions;
