import React from 'react';
import PropTypes from 'prop-types';
import './QuestionFieldActions.css';

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
    <div className="field-controls">
      <input
        type="checkbox"
        id={`form-div-checkbox-${index}`}
        checked={visible}
        onChange={onVisibilityChange}
        className="visibility-checkbox"
      />
      <div className="field-actions">
        <button
          type="button"
          onClick={() => onEdit(field, index)}
          className="edit-button"
          title="Edit this question"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onClone(field, index)}
          className="clone-button"
          title="Clone this question"
        >
          Clone
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 'up')}
          className="move-button"
          disabled={index === 0}
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 'down')}
          className="move-button"
          disabled={index === totalFields - 1}
          title="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="delete-button"
          title="Delete question"
        >
          ×
        </button>
      </div>
    </div>
  );
}

QuestionFieldActions.propTypes = {
  field: PropTypes.object.isRequired,
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
