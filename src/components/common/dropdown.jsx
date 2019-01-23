import React from 'react';


const Dropdown = ({
  value, name, label, options, className, error, ...rest
}) => (
  <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}</label>

      <select value={value} name={name} id={name} {...rest} className="form-control">
        <option value="">
          Please select a
          {' '}
          {label}
        </option>
        {options.map(item => (
          <option value={item.projectId} key={item.projectId}>
            {item.projectName}
          </option>
        ))}
      </select>
    </div>
);

export default Dropdown;
