import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ disabled, value, onEditorChange, darkMode }) => (
  <Editor
    tinymceScriptSrc="/tinymce/tinymce.min.js"
    init={{
      license_key: 'gpl',
      menubar: false,
      placeholder: 'Please input infos',
      plugins: 'advlist autolink autoresize lists link charmap table help wordcount',
      toolbar: 'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
      branding: false,
      min_height: 180,
      max_height: 500,
      autoresize_bottom_margin: 1,
      skin: darkMode ? 'oxide-dark' : 'oxide',
      content_css: darkMode ? 'dark' : 'default',
      // Write only &nbsp; as a named entity, like DOMPurify does, so the editor's HTML equals the
      // cleaned value kept in state and TinyMCE does not roll back letters while someone types
      entity_encoding: 'named',
      entities: '160,nbsp',
    }}
    disabled={disabled}
    value={value}
    onEditorChange={onEditorChange}
  />
);

export default RichTextEditor;