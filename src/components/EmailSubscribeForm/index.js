import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';

function EmailSubscribeForm() {
  const dispatch = useDispatch();
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');

  const handleEmailListChange = e => {
    const emails = e.target.value.split(',');
    setEmailList(emails);
  };

  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
  };

  const convertImageToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addImageToEmailContent = e => {
    const imageFile = document.querySelector('input[type="file"]').files[0];
    convertImageToBase64(imageFile, base64Image => {
      const imageTag = `<img src="${base64Image}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
      setHeaderContent(prevContent => `${imageTag}${prevContent}`);
      const editor = tinymce.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
    });
    e.target.value = '';
  };
  // const htmlContent = `<html><head><title>Weekly Update</title></head><body>${emailContent}</body></html>`;
  const addHeaderToEmailContent = () => {
    if (!headerContent) return;
    const imageTag = `<img src="${headerContent}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
    const editor = tinymce.get('email-editor');
    if (editor) {
      editor.insertContent(imageTag);
      setEmailContent(editor.getContent());
    }
  };
  const handleSendEmails = () => {
    const htmlContent = emailContent;
    // Send the HTML content using your sendEmail function
    dispatch(sendEmail(emailList.join(','), 'Weekly Update', htmlContent));
  };

  const handleBroadcastEmails = () => {
    const htmlContent = emailContent;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
  };

  return (
    <>
      <div className="email-update-container">
        <div className="emails">
          <p>Email Subscribe</p>
          Email List (comma-separated):
          <input type="text" onChange={handleEmailListChange} />
          <button type="button" className="send-button" onClick={handleSendEmails}>
            Opt-In
          </button>
        </div>
      </div>
      {/* <div className="email-content-preview-section">
        <div className="email-content-preview-title">
          <h3>Preview</h3>
        </div>
        <div className="email-content-preview" dangerouslySetInnerHTML={{ __html: emailContent }} />
      </div> */}
    </>
  );
}

export default EmailSubscribeForm;
