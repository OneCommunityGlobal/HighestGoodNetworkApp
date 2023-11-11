import React from 'react';

const CheckboxCollection = ({ items, error, pathName, isChecked, onChange, ...rest }) => {
  const getCheckBox = element => (
    <div className={`form-check`} key={element._id}>
      <input
        {...rest}
        id={element._id}
        value={element[pathName]}
        name={element[pathName]}
        className={`form-check-input`}
        type="checkbox"
        checked={isChecked(element._id)}
        {...rest}
        onChange={e => onChange(e)}
      />
      <label className="form-check-label" htmlFor={element[pathName]}>
        {element[pathName]}
      </label>
    </div>
  );

  return (
    <div className="form-group">
      {items.map(item => getCheckBox(item))}
      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
};

export default CheckboxCollection;
