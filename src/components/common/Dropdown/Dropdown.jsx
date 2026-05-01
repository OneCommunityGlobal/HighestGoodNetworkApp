import React from 'react';

function Dropdown({ value, name, label, options, className, error, onChange, onBlur, disabled }) {
  return (
    <div className={`form-group ${className || ''}`}>
      <label htmlFor={name}>{label}</label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className="form-control"
      >
        <option value="">{`Please select a ${label}`}</option>
        {options.map(item => (
          <option key={item._id} value={item._id}>
            {item.name}
          </option>
        ))}
      </select>

      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
}

export default Dropdown;
