import React from 'react';
import PropTypes from 'prop-types';

const CustomInput = React.forwardRef(
  ({ label, name, error, className, darkMode, ...rest }, ref) => {
    return (
      <div className={`form-group ${className || ''}`}>
        <label htmlFor={name} className={darkMode ? 'text-azure' : ''}>
          {label}
        </label>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <input {...rest} ref={ref} id={name} name={name} className="form-control" />

        {error && <div className="alert alert-danger mt-1">{error}</div>}
      </div>
    );
  },
);

CustomInput.displayName = 'CustomInput';

CustomInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
};

CustomInput.defaultProps = {
  error: '',
};

export default CustomInput;
