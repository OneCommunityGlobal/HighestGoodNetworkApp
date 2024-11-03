import { forwardRef } from 'react'; // Removed React and useCallback
import PropTypes from 'prop-types';

/**
 * A custom input component that forwards its ref and handles errors.
 */
const CustomInput = forwardRef(
  ({ label, name, error, className, darkMode, type, placeholder, value, onChange }, ref) => {
    return (
      <div className={`form-group ${className || ''}`}>
        <label htmlFor={name} className={darkMode ? 'text-azure' : ''}>
          {label}
        </label>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          ref={ref}
          id={name}
          name={name}
          className="form-control"
        />
        {error && <div className="alert alert-danger mt-1">{error}</div>}
      </div>
    );
  }
);

CustomInput.propTypes = {
  /** The label for the input field */
  label: PropTypes.string.isRequired,
  /** The name attribute for the input field */
  name: PropTypes.string.isRequired,
  /** The error message to display */
  error: PropTypes.string,
  /** Additional CSS classes for the container */
  className: PropTypes.string,
  /** Flag to apply dark mode styling */
  darkMode: PropTypes.bool,
  /** The type of the input field */
  type: PropTypes.string,
  /** The placeholder text for the input field */
  placeholder: PropTypes.string,
  /** The value of the input field */
  value: PropTypes.string,
  /** The change handler for the input field */
  onChange: PropTypes.func,
};

CustomInput.defaultProps = {
  error: null,
  className: '',
  darkMode: false,
  type: 'text',
  placeholder: '',
  value: '',
  onChange: () => {},
};

export default CustomInput;
