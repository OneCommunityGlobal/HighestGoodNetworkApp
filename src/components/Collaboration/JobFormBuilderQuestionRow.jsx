import PropTypes from 'prop-types';
import styles from './JobFormBuilder.module.css';
import QuestionFieldActions from './QuestionFieldActions';
import {
  normalizeQuestionType,
  resolveInputType,
  isFieldRequired,
  numberedQuestionLabel,
} from './jobFormQuestionUtils';

function JobFormBuilderQuestionRow({
  field,
  index,
  totalFields,
  onMove,
  onDelete,
  onEdit,
  onVisibilityChange,
  darkMode,
}) {
  const questionType = normalizeQuestionType(field);
  const textInputPlaceholder =
    resolveInputType(field) === 'email' ? 'Enter email address' : 'Enter text here';

  return (
    <div className={styles.formDiv}>
      <QuestionFieldActions
        field={field}
        index={index}
        totalFields={totalFields}
        onMove={onMove}
        onDelete={onDelete}
        onEdit={onEdit}
        visible={field.visible}
        onVisibilityChange={onVisibilityChange}
        darkMode={darkMode}
      />
      <div className={styles.formField}>
        <label className={`${styles.fieldLabel} ${styles.jbformLabel}`}>
          {numberedQuestionLabel(field.questionText, index)}
          {isFieldRequired(field) ? (
            <span className={styles.requiredMark} aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
        <div className={styles.fieldOptions}>
          {questionType === 'textbox' ? (
            <input
              type={resolveInputType(field)}
              placeholder={textInputPlaceholder}
              className={styles.jobformInput}
            />
          ) : null}
          {questionType === 'date' ? (
            <input type="date" placeholder="Enter date" className={styles.jobformInput} />
          ) : null}
          {questionType === 'textarea' ? (
            <textarea
              className={styles.jobformTextarea}
              placeholder="Enter long-form response here"
              rows={4}
            />
          ) : null}
          {questionType === 'file' ? (
            <input type="file" disabled className={styles.jobformInput} />
          ) : null}
          {['checkbox', 'radio'].includes(questionType)
            ? field.options.map(option => (
                <div key={`${index}-${option}`} className={styles.optionItem}>
                  <input
                    type={questionType}
                    name={`field-${index}`}
                    className={styles.jobformInput}
                  />
                  <label className={styles.jbformLabel}>{option}</label>
                </div>
              ))
            : null}
          {questionType === 'dropdown' ? (
            <select className={styles.jobformSelect}>
              {field.options.map(option => (
                <option key={`${index}-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>
    </div>
  );
}

JobFormBuilderQuestionRow.propTypes = {
  field: PropTypes.shape({
    questionText: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    visible: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
  totalFields: PropTypes.number.isRequired,
  onMove: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onVisibilityChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

JobFormBuilderQuestionRow.defaultProps = {
  darkMode: false,
};

export default JobFormBuilderQuestionRow;
