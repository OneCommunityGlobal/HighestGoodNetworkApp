import React, { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyMCEEditor() {
  const editorRef = useRef(null);
  const [content, setContent] = useState('This is the initial content of the editor.');
  const [text, setText] = useState('');

  const logEditorContent = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  const onEditorChange = (content, editor) => {
    setContent(content);
    setText(editor.getContent({ format: 'text' }));
  };

  return (
    <>
      <div style={{ height: '80px', overflow: 'auto' }}>{text}</div>
      <Editor
        apiKey="rpfrv9z58kbaoauzv9dncv73jeqv7c5lo73gqlk9rx5p726p"
        onEditorChange={onEditorChange}
        value={content}
        onInit={(evt, editor) => (editorRef.current = editor)}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'mentions advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media paste code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | emoticons | help',
          content_style: 'body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }',
          emoticons_append: {
            custom_mind_explode: {
              keywords: ['brain', 'mind', 'explode', 'blown'],
              char: '🤯',
            },
          },
        }}
      />
      <button onClick={logEditorContent}>Log editor content</button>
    </>
  );
}
