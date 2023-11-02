/* eslint-disable react/jsx-props-no-spreading */
function Image({ label, name, error, className, ...rest }) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}</label>
      <img
        type="image"
        {...rest}
        id={name}
        name={name}
        alt={label}
        className={`img-responsive ${className}`}
      />

      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
}

export default Image;
