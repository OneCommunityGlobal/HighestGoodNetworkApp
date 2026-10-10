/**
 * Shared question-field renderer for collab job test pages
 * (/jobApplyLink, /jobDetailsLink). Keeps cognitive complexity out of page components.
 */

const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'application/doc',
  'application/docx',
  'image/jpeg',
  'image/png',
  'image/bmp',
]);

export function isAllowedUploadMimeType(mimeType) {
  return ALLOWED_UPLOAD_MIME_TYPES.has(mimeType);
}

function OptionList({ options, renderOption }) {
  if (!options?.length) return null;
  return options.map(option => renderOption(option));
}

function FileUploadStatus({ question, uploadingFiles, answers }) {
  if (uploadingFiles[question.questionText]) {
    return <p style={{ color: 'blue' }}>Uploading</p>;
  }

  const uploadedUrl = answers?.find(a => a.questionId === question._id)?.answer;
  if (!uploadedUrl) return null;

  return (
    <>
      <p style={{ color: 'green' }}>File Uploaded Successfully</p>
      <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
        View File
      </a>
    </>
  );
}

export function JobFormQuestionField({
  question,
  index,
  getValue,
  onChange,
  onFileChange,
  answers = [],
  uploadingFiles = {},
}) {
  const { questionType, _id: questionId, questionText, options } = question;
  const commonProps = {
    id: questionId,
    name: questionText,
    onChange: e => onChange(e, index),
  };

  switch (questionType) {
    case 'text':
    case 'textbox':
      return <input type="text" {...commonProps} value={getValue(questionId)} />;
    case 'textarea':
      return (
        <textarea rows={5} {...commonProps} name={questionType} value={getValue(questionId)} />
      );
    case 'email':
      return <input type="email" {...commonProps} value={getValue(questionId)} />;
    case 'date':
      return <input type="date" {...commonProps} value={getValue(questionId)} />;
    case 'dropdown':
      return (
        <select {...commonProps} name={questionType} value={getValue(questionId)}>
          <option value="">-- Select an option --</option>
          <OptionList
            options={options}
            renderOption={option => (
              <option key={String(option)} value={option}>
                {option}
              </option>
            )}
          />
        </select>
      );
    case 'checkbox':
      return (
        <fieldset>
          <OptionList
            options={options}
            renderOption={option => {
              const optionId = `${questionText}-${option}`;
              const checked =
                answers.find(a => a.questionId === questionText)?.answer?.includes(option) || false;
              return (
                <label key={optionId} htmlFor={optionId}>
                  <span>{option}</span>
                  <input
                    type="checkbox"
                    id={optionId}
                    name={questionText}
                    value={option}
                    checked={checked}
                    onChange={e => onChange(e, index)}
                  />
                </label>
              );
            }}
          />
        </fieldset>
      );
    case 'radio':
      return (
        <fieldset>
          <OptionList
            options={options}
            renderOption={option => {
              const optionId = `${questionText}-${option}`;
              const checked = answers.find(a => a.questionId === questionText)?.answer === option;
              return (
                <label key={optionId} htmlFor={optionId}>
                  <input
                    type="radio"
                    id={optionId}
                    name={questionText}
                    value={option}
                    checked={checked}
                    onChange={e => onChange(e, index)}
                  />
                  <span>{option}</span>
                </label>
              );
            }}
          />
        </fieldset>
      );
    case 'file':
      return (
        <div>
          <input
            type="file"
            name={questionText}
            id={questionId}
            accept=".pdf,.doc,.docx,.jpg,.png,.bmp"
            onChange={e => onFileChange(e, index)}
          />
          <FileUploadStatus question={question} uploadingFiles={uploadingFiles} answers={answers} />
        </div>
      );
    default:
      return <p>another field type {questionType}</p>;
  }
}

export default JobFormQuestionField;
