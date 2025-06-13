/* global tinymce */
import { useState, useEffect, useRef } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import BlueskyPostDetails from './BlueskyPostDetails';
import BlueskyIcon from '../../assets/images/BlueskyIcon.svg';

function Announcements({ title, email: initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();

  const [emailTo, setEmailTo] = useState(initialEmail || '');
  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const tinymce = useRef(null);
  const [showBluesky, setShowBluesky] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(true);
  const [emailContent, setEmailContent] = useState('');
  const [emailList, setEmailList] = useState([]);

  const editorInit = {
    height: 500,
    menubar: false,
    plugins: 'lists link image code',
    toolbar: 'bold italic underline | bullist numlist | link image | code'
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailListChange = (e) => {
    const value = e.target.value;
    setEmailTo(value);
    setEmailList(value.split(',').map(email => email.trim()).filter(email => email));
  };
  const handleHeaderContentChange = (e) => setHeaderContent(e.target.value);

  const handleSendEmails = () => {
    const htmlContent = `
      <div style="max-width: 900px; width: 100%; margin: auto;">
      ${emailContent}      
      </div>
      `;

    if (!isFileUploaded) {
      toast.error('Error: Please upload a file.');
      return;
    }

    const invalidEmails = emailList.filter(address => !validateEmail(address.trim()));

    if (invalidEmails.length > 0) {
      toast.error(`Error: Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    dispatch(
      sendEmail(emailList.join(','), title ? 'Anniversary congrats' : 'Weekly update', htmlContent),
    );
  };

  const addHeaderToEmailContent = () => {
    if (tinymce.current && headerContent) {
      const content = tinymce.current.getContent();
      tinymce.current.setContent(headerContent + content);
      setHeaderContent('');
    }
  };

  const addImageToEmailContent = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (tinymce.current) {
          const content = tinymce.current.getContent();
          tinymce.current.setContent(content + `<img src="${event.target.result}" alt="Uploaded Image" />`);
        }
        setIsFileUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };
<<<<<<< HEAD
=======

    if (!isFileUploaded) {
      toast.error('Error: Please upload a file.');
      return;
    }

    const invalidEmails = emailList.filter(address => !validateEmail(address.trim()));

    if (invalidEmails.length > 0) {
      toast.error(`Error: Invalid email addresses: ${invalidEmails.join(', ')}`);
      return;
    }

    dispatch(
      sendEmail(emailList.join(','), title ? 'Anniversary congrats' : 'Weekly update', htmlContent),
    );
  };

  const handleBroadcastEmails = () => {
    const htmlContent = `
      <div style="max-width: 900px; width: 100%; margin: auto;">
      ${emailContent}      
      </div>
      `;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
>>>>>>> 10b5d7951 (Final commit before schedule_post feature)
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      {/* Bluesky Header */}
      <div className="bluesky-header">
        <button
          type="button"
          className="bluesky-header-button"
          onClick={() => setShowBluesky(prev => !prev)}
        >
          <img src={BlueskyIcon} alt="Bluesky" className="bluesky-icon" />
          <span className="bluesky-label">Bluesky Manager</span>
        </button>
      </div>

      {!showBluesky && (
        <div className="email-update-container">
          <div className="editor">
            {title ? <h3> {title} </h3> : <h3>Weekly Progress Editor</h3>}
            <br />
            {showEditor && (
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                id="email-editor"
                initialValue="<p>This is the initial content of the editor</p>"
                init={editorInit}
                onEditorChange={content => {
                  setEmailContent(content);
                }}
                onInit={(evt, editor) => tinymce.current = editor}
              />
            )}
            {title ? (
              ''
            ) : (
              <div className="email-update-container">
                <div className="editor">
                  <div className="email-list">
                    <input
                      type="text"
                      value={emailTo}
                      onChange={handleEmailListChange}
                      placeholder="Enter email addresses (comma-separated)"
                    />
                  </div>
                  <div className="header-image">
                    <input
                      type="text"
                      value={headerContent}
                      onChange={handleHeaderContentChange}
                      placeholder="Enter header image URL"
                    />
                    <button type="button" onClick={addHeaderToEmailContent}>
                      Add Header
                    </button>
                  </div>
                  <div className="file-upload">
                    <input type="file" onChange={addImageToEmailContent} />
                  </div>
                  <div className="send-buttons">
                    <button type="button" onClick={handleSendEmails}>
                      Send Emails
                    </button>
                    <button type="button" onClick={handleBroadcastEmails}>
                      Broadcast to All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
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
              className={`input-text-for-announcement ${
                darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
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
              className={`input-text-for-announcement ${
                darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
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
      )}

      {/* show BlueskyPostDetails */}
      {showBluesky && (
        <BlueskyPostDetails content={emailContent} onClose={() => setShowBluesky(false)} />
      )}
    </div>
  );
}

export default Announcements;
