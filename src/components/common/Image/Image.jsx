
// eslint-disable-next-line react/function-component-definition
const Image = ({ label, name, error, className, ...rest }) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}</label>
      <img
        type="image"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
        id={name}
        name={name}
        alt={label}
        className={`img-responsive ${className}`}
      />

      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
};

export default Image;
