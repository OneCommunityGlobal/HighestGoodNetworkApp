

// eslint-disable-next-line react/function-component-definition
const Radio = ({ name, label, options, error, value, ...rest }) => {
  return (
    <div className="form-group">
      {options.map(item => (
        <div className="form-check form-check-inline" key={item.value}>
          <input
            type="radio"
            id={item.value}
            value={item.value}
            name={name}
            className="form-check-input"
            defaultChecked={item.value === value ? true : null}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
          />
          <label htmlFor={item.value.toString()} className="form-check-label">
            {item.label}
          </label>
        </div>
      ))}

      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Radio;
