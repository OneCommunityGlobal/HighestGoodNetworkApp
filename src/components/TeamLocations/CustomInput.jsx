import React from 'react';
import PropTypes from 'prop-types';

const CustomInput = React.forwardRef(({ label, name, error, className, ...rest }, ref) => {
  return (
    <div className={`form-group ${className ? className : ''}`}>
      <label htmlFor={name}>{label}</label>
      <input {...rest} ref={ref} id={name} name={name} className={`form-control`} />

      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
});

CustomInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
};

export default CustomInput;
