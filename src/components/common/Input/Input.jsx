import {useState} from 'react';
import PropTypes from 'prop-types';
import './input.css'

const Input = ({ label, name, error, className, type, ...rest }) => {
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
    <div className={`form-group ${className ? className : ''}`}>
      <label htmlFor={name}>{label}</label>
      {type === 'password' ? (
        <div className='input-text-for-input-component'>
          <input {...rest} type={password} id={name} name={name} className={`form-control`} />
          <i onClick={toggleEye} className={`fa ${eye ? "fa-eye-slash fa-eye-slash-input-component" : "fa-eye fa-eye-input-component"}`}></i>
        </div>
      ) : (
        <input {...rest} type={type} id={name} name={name} className={`form-control`} />
      )}
      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
};

export default Input;
