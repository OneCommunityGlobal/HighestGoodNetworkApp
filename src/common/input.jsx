import React from "react";

const Input = ({ label,name, error, ...rest  }) => {
  
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label> 
      <input
       {...rest}
        id={name}
        name = {name}
        className="form-control"  
      />

{error && <div className="alert alert-danger">{error}</div>}

    </div>
  );
};

export default Input;
