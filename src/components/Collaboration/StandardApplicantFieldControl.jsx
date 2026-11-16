import PropTypes from 'prop-types';

/**
 * Read-only preview control for a STANDARD_APPLICANT_FIELDS entry (builder + form preview).
 */
function StandardApplicantFieldControl({ field, className, lockMode = 'readonly' }) {
  const lockProps = lockMode === 'disabled' ? { disabled: true } : { readOnly: true, tabIndex: -1 };

  if (field.inputType === 'select') {
    return (
      <select
        {...lockProps}
        className={className}
        aria-label={`${field.label} preview`}
        defaultValue=""
      >
        <option value="">{field.placeholder}</option>
      </select>
    );
  }

  if (field.inputType === 'file') {
    return (
      <input
        type="text"
        {...lockProps}
        placeholder={field.placeholder}
        className={className}
        aria-label={`${field.label} preview`}
      />
    );
  }

  const inputType = field.inputType === 'tel' ? 'tel' : field.inputType || 'text';

  return (
    <input
      type={inputType}
      {...lockProps}
      placeholder={field.placeholder}
      className={className}
      aria-label={`${field.label} preview`}
    />
  );
}

StandardApplicantFieldControl.propTypes = {
  field: PropTypes.shape({
    label: PropTypes.string.isRequired,
    inputType: PropTypes.string,
    placeholder: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
  lockMode: PropTypes.oneOf(['readonly', 'disabled']),
};

StandardApplicantFieldControl.defaultProps = {
  className: '',
  lockMode: 'readonly',
};

export default StandardApplicantFieldControl;
