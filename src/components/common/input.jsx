import React from "react";
import PropTypes from 'prop-types';

const Input = ({ label,name, error,className,inputClassName = "", labelClassName = "", ...rest  }) => {

  return (
    <div className={`form-group ${className? className :""}`}>
      <label htmlFor={name} className = {labelClassName}>{label}</label> 
      <input
       {...rest}
        id={name}
        name = {name}
        className={`form-control ${inputClassName}`}
      />

{error && <div className="alert alert-danger mt-1">{error}</div>}

    </div>
  );
};
Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  error : PropTypes.func

}

export default Input;
