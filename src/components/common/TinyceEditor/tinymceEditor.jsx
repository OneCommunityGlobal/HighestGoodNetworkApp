
import { Editor } from '@tinymce/tinymce-react';

// eslint-disable-next-line react/function-component-definition
const TinyMCEEditor = ({ label, name, error, className, value, ...rest }) => {
  const config = {
    plugins: 'autolink link image lists print preview',
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright',
  };

  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={name}>{label}</label>
      <Editor
        init={{ branding: false, plugins: 'autoresize', autoresize_bottom_margin: 1 }}
        // eslint-disable-next-line react/jsx-props-no-spreading
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
