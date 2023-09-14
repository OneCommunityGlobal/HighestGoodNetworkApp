import { useState } from 'react';
import './Announcements.css';
import { useDispatch } from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { sendEmail } from '../../actions/sendEmails';

function Announcements() {
  const dispatch = useDispatch();
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const handleEmailListChange = e => {
    const emails = e.target.value.split(',');
    setEmailList(emails);
  };

  const handleTestEmailChange = e => {
    setTestEmail(e.target.value);
  };

  const handleSendTestEmail = () => {};

  const handleSendEmails = () => {
    dispatch(sendEmail(emailList.join(','), 'Weekly Update', emailContent));
  };

  const handleEmailContentChange = (event, editor) => {
    const data = editor.getData();
    setEmailContent(data);
  };

  const editorConfiguration = {
    height: 1200,
    width: 5000,
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'fontFamily',
        'fontSize',
        'FontColor',
        'FontBackgroundColor',
        '|',
        'bold',
        'italic',
        'strikethrough',
        'subscript',
        'superscript',
        'code',
        '|',
        'link',
        'uploadImage',
        'blockQuote',
        'codeBlock',
        '|',
        'bulletedList',
        'numberedList',
        'todoList',
        'outdent',
        'indent',
      ],
    },
    language: 'en',
    image: {
      toolbar: [
        'imageTextAlternative',
        '|',
        'imageStyle:alignLeft',
        'imageStyle:alignCenter',
        'imageStyle:alignRight',
      ],
    },
  };

  return (
    <div className="email-update-container">
      <div className="editor">
        <h3>Weekly Progress Editor</h3>
        <br />
        <CKEditor
          editor={ClassicEditor}
          config={editorConfiguration} 
          data={emailContent}
          onChange={(event, editor) => handleEmailContentChange(event, editor)}
        />
        <button type="button" className="send-button" onClick={handleSendEmails}>
          Send Weekly Update
        </button>
      </div>
      <div className="emails">
        Email List (comma-separated):
        <input type="text" onChange={handleEmailListChange} />
        <hr />
        Test Email:
        <input type="text" onChange={handleTestEmailChange} />
        <button type="button" className="send-button" onClick={handleSendTestEmail}>
          Send Test Email
        </button>
      </div>
    </div>
  );
}

export default Announcements;
