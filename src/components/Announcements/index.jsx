/* global tinymce */
import { useState, useEffect, useRef } from 'react';
// Removed import for deleted Announcements.css
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from '../../styles';
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
  const [emailContent, setEmailContent] = useState('');
  const [emailList, setEmailList] = useState([]);

  useEffect(() => {
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

  const editorInit = {
    height: 500,
    menubar: false,
    plugins: 'lists link image code',
    toolbar: 'bold italic underline | bullist numlist | link image | code',
  };

  const validateEmail = email => {
    if (typeof email !== 'string') {
      return false;
    }

    const trimmedEmail = email.trim();
    const atIndex = trimmedEmail.indexOf('@');
    const lastAtIndex = trimmedEmail.lastIndexOf('@');

    if (
      atIndex <= 0 ||
      atIndex !== lastAtIndex ||
      atIndex === trimmedEmail.length - 1 ||
      trimmedEmail.includes(' ')
    ) {
      return false;
    }

    const localPart = trimmedEmail.slice(0, atIndex);
    const domainPart = trimmedEmail.slice(atIndex + 1);
    const domainLabels = domainPart.split('.');

    if (localPart === '' || domainLabels.length < 2 || domainLabels.some(label => label === '')) {
      return false;
    }

    return true;
  };

  const handleEmailListChange = e => {
    const value = e.target.value;
    setEmailTo(value);
    setEmailList(
      value
        .split(',')
        .map(email => email.trim())
        .filter(Boolean),
    );
  };
  const handleHeaderContentChange = e => setHeaderContent(e.target.value);

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

  const handleBroadcastEmails = () => {
    const htmlContent = `<div style="max-width:900px;width:100%;margin:auto;">${emailContent}</div>`;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
  };

  const addHeaderToEmailContent = () => {
    if (tinymce.current && headerContent) {
      const content = tinymce.current.getContent();
      tinymce.current.setContent(headerContent + content);
      setHeaderContent('');
    }
  };

  const addImageToEmailContent = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          toast.error('Error: Unable to read the uploaded image.');
          return;
        }

        if (tinymce.current) {
          const content = tinymce.current.getContent();
          tinymce.current.setContent(content + `<img src="${result}" alt="Uploaded Image" />`);
        }
        setIsFileUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      {/* Bluesky Header Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: darkMode ? '#1a2035' : '#f0f4ff',
          borderBottom: `2px solid ${showBluesky ? '#0085ff' : 'transparent'}`,
          marginBottom: '16px',
        }}
      >
        <button
          type="button"
          onClick={() => setShowBluesky(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            background: showBluesky ? '#0085ff' : 'transparent',
            color: showBluesky ? '#fff' : darkMode ? '#a0aec0' : '#4a5568',
            border: `2px solid ${showBluesky ? '#0085ff' : '#cbd5e0'}`,
            borderRadius: '24px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-pressed={showBluesky}
        >
          <img
            src={BlueskyIcon}
            alt="Bluesky"
            style={{
              width: '20px',
              height: '20px',
              filter: showBluesky ? 'brightness(100)' : 'none',
            }}
          />
          <span>Bluesky Manager</span>
        </button>
        {showBluesky && (
          <span
            style={{ fontSize: '13px', color: darkMode ? '#a0aec0' : '#718096', marginLeft: '4px' }}
          >
            — post to Bluesky
          </span>
        )}
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
                onInit={(evt, editor) => (tinymce.current = editor)}
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
