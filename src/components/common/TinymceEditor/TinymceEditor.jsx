import React from "react";
import { Editor } from "@tinymce/tinymce-react";

const TinyMCEEditor = ({ label, name, error, className, ...rest }) => {
  const config = {
    plugins: "autolink link image lists print preview",
    toolbar: "undo redo | bold italic | alignleft aligncenter alignright"
  };

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}</label>
      <Editor
        init={{
          branding: false,
          plugins: "link autoresize",
          autoresize_bottom_margin: 1,
          forced_root_block: false,
          force_br_newlines: true,
          force_p_newlines: false,
          apply_source_formatting: false,
          remove_linebreaks: false,
          convert_newlines_to_brs: true
        }}
        {...rest}
        id={name}
        name={name}
        config={config}
        className="form-control"
      />

      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
};

export default TinyMCEEditor;
