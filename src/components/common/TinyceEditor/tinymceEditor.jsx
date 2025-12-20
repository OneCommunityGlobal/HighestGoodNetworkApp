import { Editor } from '@tinymce/tinymce-react';

function TinyMCEEditor({ label, name, error, className = '', value, ...rest }) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}</label>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        id={name}
        init={{
          branding: false,
          height: 300,
          plugins: 'autoresize autolink link image lists print preview',
          toolbar: 'undo redo | bold italic | alignleft aligncenter alignright',
          autoresize_bottom_margin: 1,
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      />

      {error && <div className="alert alert-danger mt-1">{error}</div>}
    </div>
  );
}

export default TinyMCEEditor;
