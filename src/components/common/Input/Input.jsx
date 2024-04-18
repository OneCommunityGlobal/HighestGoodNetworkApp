/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import PropTypes from 'prop-types';
import './input.css'

// eslint-disable-next-line react/function-component-definition
const Input = ({ label, name, error, className, type, invalid, ...rest }) => {
  const [eye, setEye] = useState(true);
  const [password, setPassword] = useState("password");

  const toggleEye = () => {
    if (password === "password") {
      setPassword("text");
      setEye(false);
    } else {
      setPassword("password");
      setEye(true);
    }
  };

  return (
    <div className={`form-group ${className || ''}`}>
      <label htmlFor={name}>{label}</label>
      {type === 'password' ? (
        <div className='input-text w-100'>
          <input {...rest} type={password} id={name} name={name} className="form-control" />
          <i onClick={toggleEye}
            className={`fa ${eye ? "fa-eye-slash" : "fa-eye"}`} />
          {invalid && <div className='text-danger' style={{ fontSize: "14px" }}>{invalid}</div>}
        </div>
      ) : (
        <input {...rest} type={type} id={name} name={name} className="form-control" />
      )}
      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  error: PropTypes.string,
};

export default Input;
