import React from 'react';

const DropdownMenu = ({name, label, options, value, className, error, ...rest}) => (

  <div className={`form-group ${className}`}>
    <label id="name" htmlFor={name}>{label}</label>
    <select value={value} name={name} id={name} {...rest} className="form-control">     
    <option value="">Please select a {label}</option>

      {options.map(i => (
        <option value={i._id} key={i._id}>
          {i.projectName}
        </option>
      ))}
    </select>
  </div>
);
export default DropdownMenu;
