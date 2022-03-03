import React from 'react';

const Dropdown = ({ value, name, label, options, className, error, ...rest }) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}</label>

      <select value={value} name={name} id={name} {...rest} className="form-control">
        <option value="">Please select a {label}</option>
        {options.map(item => (
          <option value={item._id} key={item._id}>
            {item.name}
          </option>
        ))}
      </select>
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Dropdown;
