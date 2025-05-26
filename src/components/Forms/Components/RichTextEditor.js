/* eslint-disable no-unused-vars */
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { updateQuestion } from 'actions/formActions';
import { useDispatch } from 'react-redux';

export default function RichTextEditor({ data }) {
  // console.log('Data', data);
  const editorRef = useRef(null);
  const [content, setContent] = useState(data.description);
  const [text, setText] = useState('');
  const dispatch = useDispatch();

  const onEditorChange = (newContent, editor) => {
    setContent(newContent);
    dispatch(updateQuestion(data.id, { description: newContent }));
    setText(editor.getContent({ format: 'text' }));
  };

  return (
    <Editor
      className="col"
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      onEditorChange={onEditorChange}
      value={content}
      // eslint-disable-next-line no-return-assign
      onInit={(evt, editor) => (editorRef.current = editor)}
      init={{
        license_key: 'gpl',
        height: 250,
        width: '100%',
        menubar: false,
        plugins: [
          'mentions advlist autolink lists link image charmap print preview anchor',
          'searchreplace visualblocks code fullscreen',
          'insertdatetime media paste code help wordcount',
        ],
        toolbar:
          'undo redo | formatselect | ' +
          'bold italic underline backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat',
        content_style: 'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }',
        emoticons_append: {
          custom_mind_explode: {
            keywords: ['brain', 'mind', 'explode', 'blown'],
            char: '🤯',
          },
        },
      }}
    />
  );
}
