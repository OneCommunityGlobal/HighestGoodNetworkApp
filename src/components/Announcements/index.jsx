/* global tinymce */
import { useState, useEffect, useRef } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';

function Announcements({ title, email: initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();

  const [emailTo, setEmailTo] = useState(initialEmail || '');
  const [headerContent, setHeaderContent] = useState('');
  const editorRef = useRef(null);

  const handleEmailListChange = (e) => setEmailTo(e.target.value);
  const handleHeaderContentChange = (e) => setHeaderContent(e.target.value);

  const handleSendEmails = () => {
    if (!emailTo.trim()) {
      toast.error('Please enter at least one email address.');
      return;
    }
    const emails = emailTo.split(',').map(email => email.trim()).filter(email => email);
    if (emails.length === 0) {
      toast.error('Please enter valid email addresses.');
      return;
    }
    dispatch(sendEmail(emails, editorRef.current ? editorRef.current.getContent() : ''));
    toast.success('Emails sent successfully!');
  };

  const addHeaderToEmailContent = () => {
    if (editorRef.current && headerContent) {
      const content = editorRef.current.getContent();
      editorRef.current.setContent(headerContent + content);
      setHeaderContent('');
    }
  };

  const addImageToEmailContent = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (editorRef.current) {
          const content = editorRef.current.getContent();
          editorRef.current.setContent(content + `<img src="${event.target.result}" alt="Uploaded Image" />`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <div
        className={`emails ${darkMode ? 'bg-yinmn-blue' : ''}`}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        {title ? (
          <p>Email</p>
        ) : (
          <label htmlFor="email-list-input" className={darkMode ? 'text-light' : 'text-dark'}>
            Email List (comma-separated)<span className="red-asterisk">* </span>:
          </label>
        )}
        <input
          type="text"
          value={emailTo}
          id="email-list-input"
          onChange={handleEmailListChange}
          className={`input-text-for-announcement ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
            }`}
        />
        <button
          type="button"
          className="send-button"
          onClick={handleSendEmails}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          {title ? 'Send Email' : 'Send mail to specific users'}
        </button>

        <hr />
        <label htmlFor="header-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
          Insert header or image link:
        </label>
        <input
          type="text"
          id="header-content-input"
          onChange={handleHeaderContentChange}
          value={headerContent}
          className={`input-text-for-announcement ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
            }`}
        />
        <button
          type="button"
          className="send-button"
          onClick={addHeaderToEmailContent}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Insert
        </button>
        <hr />
        <label htmlFor="upload-header-input" className={darkMode ? 'text-light' : 'text-dark'}>
          Upload Header (or footer):
        </label>
        <input
          type="file"
          id="upload-header-input"
          onChange={addImageToEmailContent}
          className="input-file-upload"
        />
      </div>
    </div>
  );
}

export default Announcements;
