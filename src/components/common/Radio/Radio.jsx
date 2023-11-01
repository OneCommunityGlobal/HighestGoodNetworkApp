function Radio({ name, label, options, error, value, ...rest }) {
  return (
    <div className="form-group">
      {options.map(item => (
        <div className="form-check form-check-inline" key={item.value}>
          <input
            type="radio"
            value={item.value}
            name={name}
            className="form-check-input"
            checked={item.value === value ? true : null}
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
}

export default Radio;
