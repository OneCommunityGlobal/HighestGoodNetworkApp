import React from "react";

const Textarea = props => {
  return (
    <div className="form-group ghhhh">
      <label htmlFor={props.name}>{props.label}</label>
      <textarea
        rows={props.rows}
        cols={props.cols}
        name={props.name}
        className="form-control"
      />
    </div>
  );
};

export default Textarea;
