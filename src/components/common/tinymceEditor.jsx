import React from "react";
import { Editor } from '@tinymce/tinymce-react';

const TinyMCEEditor = ({ label,name, error,className, ...rest  }) => {

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}</label> 
      <Editor
       {...rest}
        id={name}
        name = {name}
        className={`form-control`}
      />    

{error && <div className="alert alert-danger mt-1">{error}</div>}

    </div>
  );
};

export default TinyMCEEditor;
