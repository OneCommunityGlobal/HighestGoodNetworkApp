import PropTypes from 'prop-types';

function Input({ label, name, error, className, ...rest }) {
  return (
    <div className={`form-group ${className || ''}`}>
      <label htmlFor={name}>{label}</label>
      <input {...rest} id={name} name={name} className="form-control" />

      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
}
Input.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/require-default-props
  error: PropTypes.string,
};

export default Input;
