import PropTypes from 'prop-types';
import styles from './JobApplicationForm.module.css';
import { isJobApplicationFileUploadQuestion } from './jobApplicationQuestionUtils';
import { getQuestionLabelText } from '../jobFormQuestionUtils';

const KNOWN_QUESTION_TYPES = new Set([
  'textbox',
  'text',
  'textarea',
  'date',
  'checkbox',
  'radio',
  'dropdown',
]);

function getQuestionType(q) {
  return String(q.questionType || q.type || '').toLowerCase();
}

function isQuestionRequired(q) {
  if (!q || typeof q !== 'object') return false;
  return (
    q.isRequired === true ||
    q.required === true ||
    q.mandatory === true ||
    String(q.isRequired).toLowerCase() === 'true' ||
    String(q.required).toLowerCase() === 'true'
  );
}

function getQuestionLabel(q, idx) {
  const cleaned = getQuestionLabelText(q);
  if (!cleaned) return `Question ${idx + 1}`;
  return cleaned;
}

function isIndividualOrgQuestionLabel(label) {
  const labelLower = String(label || '').toLowerCase();
  return labelLower.includes('individual') && labelLower.includes('organization');
}

function answerDisplayValue(answer) {
  return Array.isArray(answer) ? '' : answer || '';
}

function DynamicQuestionTextAndFile({
  q,
  idx,
  label,
  formKey,
  answer,
  req,
  showTextbox,
  showDate,
  showFallbackInput,
  isIndividualOrgQuestion,
  inputClassName,
  questionFile,
  questionFileError,
  fieldError,
  questionFileInputRefs,
  onAnswerChange,
  onQuestionFileChange,
  onClearQuestionFile,
  FileUploadField,
}) {
  const qt = getQuestionType(q);

  if (isJobApplicationFileUploadQuestion(q)) {
    return (
      <FileUploadField
        id={`${formKey}-file`}
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        file={questionFile || null}
        onChange={e => onQuestionFileChange(idx, e)}
        onClear={() => onClearQuestionFile(idx)}
        inputRef={el => {
          questionFileInputRefs.current[idx] = el;
        }}
        required={req}
        error={questionFileError || fieldError}
      />
    );
  }

  if (showTextbox) {
    return (
      <input
        type="text"
        placeholder={q.placeholder || 'Type your response here'}
        value={answerDisplayValue(answer)}
        onChange={e => onAnswerChange(idx, e.target.value, label)}
        required={req}
        aria-required={req}
        aria-labelledby={`${formKey}-heading`}
        className={inputClassName}
      />
    );
  }

  if (qt === 'textarea' && !isIndividualOrgQuestion) {
    return (
      <textarea
        placeholder={q.placeholder || 'Type your response here'}
        value={answerDisplayValue(answer)}
        onChange={e => onAnswerChange(idx, e.target.value, label)}
        rows={5}
        required={req}
        aria-required={req}
        aria-labelledby={`${formKey}-heading`}
        className={inputClassName}
      />
    );
  }

  if (showDate) {
    return (
      <input
        type="date"
        className={styles.dateInput}
        value={answerDisplayValue(answer)}
        onChange={e => onAnswerChange(idx, e.target.value, label)}
        required={req}
        aria-required={req}
        aria-labelledby={`${formKey}-heading`}
      />
    );
  }

  if (showFallbackInput) {
    return (
      <input
        type="text"
        placeholder="Type your response here"
        value={answerDisplayValue(answer)}
        onChange={e => onAnswerChange(idx, e.target.value, label)}
        required={req}
        aria-required={req}
        aria-labelledby={`${formKey}-heading`}
        className={inputClassName}
      />
    );
  }

  return null;
}

DynamicQuestionTextAndFile.propTypes = {
  q: PropTypes.shape({
    placeholder: PropTypes.string,
    questionType: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  idx: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  formKey: PropTypes.string.isRequired,
  answer: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  req: PropTypes.bool.isRequired,
  showTextbox: PropTypes.bool.isRequired,
  showDate: PropTypes.bool.isRequired,
  showFallbackInput: PropTypes.bool.isRequired,
  isIndividualOrgQuestion: PropTypes.bool.isRequired,
  inputClassName: PropTypes.string.isRequired,
  questionFile: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  questionFileError: PropTypes.string,
  fieldError: PropTypes.string,
  questionFileInputRefs: PropTypes.shape({ current: PropTypes.object }).isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onQuestionFileChange: PropTypes.func.isRequired,
  onClearQuestionFile: PropTypes.func.isRequired,
  FileUploadField: PropTypes.elementType.isRequired,
};

DynamicQuestionTextAndFile.defaultProps = {
  answer: '',
  questionFile: null,
  questionFileError: '',
  fieldError: '',
};

function DynamicQuestionChoices({
  q,
  idx,
  label,
  formKey,
  answer,
  req,
  isIndividualOrgQuestion,
  onAnswerChange,
  onToggleCheckbox,
  isCheckboxOptionChecked,
}) {
  const qt = getQuestionType(q);
  const options = q.options || [];

  if (isIndividualOrgQuestion) {
    const choiceOptions = options.length ? options : ['Individual', 'Organization'];
    return (
      <fieldset
        className={`${styles.optionFieldset} ${styles.optionFieldsetInline}`}
        aria-labelledby={`${formKey}-heading`}
      >
        {choiceOptions.map(opt => (
          <label key={String(opt)}>
            <input
              type="radio"
              name={`question-${formKey}`}
              value={opt}
              checked={answer === opt}
              onChange={() => onAnswerChange(idx, opt, label)}
              required={req}
            />{' '}
            {opt}
          </label>
        ))}
      </fieldset>
    );
  }

  if (qt === 'checkbox' && options.length > 0) {
    return (
      <fieldset className={styles.optionFieldset} aria-labelledby={`${formKey}-heading`}>
        {options.map(opt => (
          <label key={String(opt)}>
            <input
              type="checkbox"
              name={`question-${formKey}-${String(opt)}`}
              value={opt}
              checked={isCheckboxOptionChecked(answer, opt)}
              onChange={() => onToggleCheckbox(idx, opt)}
            />{' '}
            {opt}
          </label>
        ))}
      </fieldset>
    );
  }

  if (qt === 'radio' && options.length > 0) {
    return (
      <fieldset className={styles.optionFieldset} aria-labelledby={`${formKey}-heading`}>
        {options.map(opt => (
          <label key={String(opt)}>
            <input
              type="radio"
              name={`question-${formKey}`}
              value={opt}
              checked={answer === opt}
              onChange={() => onAnswerChange(idx, opt)}
            />{' '}
            {opt}
          </label>
        ))}
      </fieldset>
    );
  }

  if (qt === 'dropdown') {
    return (
      <select
        className={styles.selectField}
        value={answerDisplayValue(answer)}
        onChange={e => onAnswerChange(idx, e.target.value, label)}
        required={req}
        aria-required={req}
        aria-labelledby={`${formKey}-heading`}
      >
        <option value="">Select an option</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return null;
}

DynamicQuestionChoices.propTypes = {
  q: PropTypes.shape({
    questionType: PropTypes.string,
    type: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  idx: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  formKey: PropTypes.string.isRequired,
  answer: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  req: PropTypes.bool.isRequired,
  isIndividualOrgQuestion: PropTypes.bool.isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onToggleCheckbox: PropTypes.func.isRequired,
  isCheckboxOptionChecked: PropTypes.func.isRequired,
};

DynamicQuestionChoices.defaultProps = {
  answer: '',
};

/**
 * One dynamic custom question block on /job-application.
 */
function JobApplicationDynamicQuestion({
  question: q,
  index: idx,
  formId,
  answer,
  fieldError,
  questionFile,
  questionFileError,
  questionFileInputRefs,
  onAnswerChange,
  onToggleCheckbox,
  onQuestionFileChange,
  onClearQuestionFile,
  isCheckboxOptionChecked,
  FileUploadField,
}) {
  const qt = getQuestionType(q);
  const label = getQuestionLabel(q, idx);
  const labelLower = label.toLowerCase();
  const isIndividualOrgQuestion = isIndividualOrgQuestionLabel(label);
  const req = isQuestionRequired(q);
  const hasFieldError = Boolean(fieldError);
  const formKey = formId ? `${formId}-q-${idx}` : `q-${idx}-${label.slice(0, 24)}`;
  const showTextbox =
    (qt === 'textbox' || qt === 'text') &&
    !isJobApplicationFileUploadQuestion(q) &&
    !isIndividualOrgQuestion;
  const showDate = qt === 'date' || (labelLower.includes('start') && labelLower.includes('date'));
  const showFallbackInput =
    !KNOWN_QUESTION_TYPES.has(qt) &&
    !isJobApplicationFileUploadQuestion(q) &&
    !isIndividualOrgQuestion;
  const inputClassName = `${styles.inputField} ${hasFieldError ? styles.inputFieldError : ''}`;
  const showFieldError = hasFieldError && !isJobApplicationFileUploadQuestion(q);

  return (
    <div className={styles.formGroup}>
      <h2 className={styles.formGroupTitle} id={`${formKey}-heading`}>
        <span className={styles.questionNumber}>{idx + 1}.</span> {label}
        {req ? (
          <>
            <span className={styles.requiredMark} aria-hidden="true">
              {' '}
              *
            </span>
            <span className={styles.visuallyHidden}> (required)</span>
          </>
        ) : null}
      </h2>
      <DynamicQuestionTextAndFile
        q={q}
        idx={idx}
        label={label}
        formKey={formKey}
        answer={answer}
        req={req}
        showTextbox={showTextbox}
        showDate={showDate}
        showFallbackInput={showFallbackInput}
        isIndividualOrgQuestion={isIndividualOrgQuestion}
        inputClassName={inputClassName}
        questionFile={questionFile}
        questionFileError={questionFileError}
        fieldError={fieldError}
        questionFileInputRefs={questionFileInputRefs}
        onAnswerChange={onAnswerChange}
        onQuestionFileChange={onQuestionFileChange}
        onClearQuestionFile={onClearQuestionFile}
        FileUploadField={FileUploadField}
      />
      <DynamicQuestionChoices
        q={q}
        idx={idx}
        label={label}
        formKey={formKey}
        answer={answer}
        req={req}
        isIndividualOrgQuestion={isIndividualOrgQuestion}
        onAnswerChange={onAnswerChange}
        onToggleCheckbox={onToggleCheckbox}
        isCheckboxOptionChecked={isCheckboxOptionChecked}
      />
      {showFieldError ? (
        <p className={styles.fieldError} role="alert">
          {fieldError}
        </p>
      ) : null}
    </div>
  );
}

JobApplicationDynamicQuestion.propTypes = {
  question: PropTypes.shape({
    questionType: PropTypes.string,
    type: PropTypes.string,
    label: PropTypes.string,
    questionText: PropTypes.string,
    placeholder: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  index: PropTypes.number.isRequired,
  formId: PropTypes.string,
  answer: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  fieldError: PropTypes.string,
  questionFile: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  questionFileError: PropTypes.string,
  questionFileInputRefs: PropTypes.shape({ current: PropTypes.object }).isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onToggleCheckbox: PropTypes.func.isRequired,
  onQuestionFileChange: PropTypes.func.isRequired,
  onClearQuestionFile: PropTypes.func.isRequired,
  isCheckboxOptionChecked: PropTypes.func.isRequired,
  FileUploadField: PropTypes.elementType.isRequired,
};

JobApplicationDynamicQuestion.defaultProps = {
  formId: '',
  answer: '',
  fieldError: '',
  questionFile: null,
  questionFileError: '',
};

export default JobApplicationDynamicQuestion;
export { getQuestionLabel };
