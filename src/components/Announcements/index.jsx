import { useState } from 'react';
import './Announcements.css';
import { useDispatch } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail } from '../../actions/sendEmails';

function Announcements() {
  const dispatch = useDispatch();
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const handleEmailListChange = e => {
    const emails = e.target.value.split(',');
    setEmailList(emails);
  };

  const handleTestEmailChange = e => {
    setTestEmail(e.target.value);
  };

  const handleSendTestEmail = () => {
    // Implement sending a test email if needed
  };

  // const htmlContent = `<html><head><title>Weekly Update</title></head><body>${emailContent}</body></html>`;

  const handleSendEmails = () => {
    const htmlContent = emailContent;
    // console.log(htmlContent);

    // Send the HTML content using your sendEmail function
    dispatch(sendEmail(emailList.join(','), 'Weekly Update', htmlContent));
  };

  return (
    <div className="email-update-container">
      <div className="editor">
        <h3>Weekly Progress Editor</h3>
        <br />
        <Editor
          apiKey="rpfrv9z58kbaoauzv9dncv73jeqv7c5lo73gqlk9rx5p726p" // Replace with your TinyMCE API key
          initialValue="<p>This is the initial content of the editor</p>"
          init={{
            height: 500,
            menubar: false,
            plugins: [
              'advlist autolink lists link image',
              'charmap print preview anchor help',
              'searchreplace visualblocks code',
              'insertdatetime media table paste wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic | \
              alignleft aligncenter alignright | \
              bullist numlist outdent indent | removeformat | help',
          }}
          onEditorChange={(content, editor) => {
            setEmailContent(content);
          }}
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
