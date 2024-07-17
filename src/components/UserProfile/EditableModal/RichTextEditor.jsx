import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ disabled, value, onEditorChange }) => (
  <Editor
    tinymceScriptSrc="/tinymce/tinymce.min.js"
    init={{
      license_key: 'gpl',
      menubar: false,
      placeholder: 'Please input infos',
      plugins: 'advlist autolink autoresize lists link charmap table paste help wordcount',
      toolbar: 'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
      branding: false,
      min_height: 180,
      max_height: 500,
      autoresize_bottom_margin: 1,
    }}
    disabled={disabled}
    value={value}
    onEditorChange={onEditorChange}
  />
);

export default RichTextEditor;