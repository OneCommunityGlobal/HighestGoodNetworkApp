import React from "react";

const Textarea = ({ label, name, error, rows, cols, ...rest }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <textarea
        {...rest}
        rows={rows}
        cols={cols}
        name={name}
        className="form-control"
      />
    </div>
  );
};

export default Textarea;
