/* eslint-disable no-undef */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import './Announcements.css';

function Announcements({ title, email: initialEmail, history }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

  useEffect(() => {
    if (initialEmail) {
      const trimmedEmail = initialEmail.trim();
      setEmailTo(initialEmail);
      setEmailList(trimmedEmail.split(','));
    }
  }, [initialEmail]);

  const handleEmailListChange = e => {
    const { value } = e.target;
    setEmailTo(value);
    setEmailList(value.split(','));
  };

  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
  };

  const addHeaderToEmailContent = () => {
    if (!headerContent) return;
    const imageTag = `<img src="${headerContent}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
    const editor = window.tinymce.get('email-editor');
    if (editor) {
      editor.insertContent(imageTag);
      setEmailContent(editor.getContent());
    }
    setHeaderContent('');
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
    setIsFileUploaded(true);
    convertImageToBase64(imageFile, base64Image => {
      const imageTag = `<img src="${base64Image}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
      setHeaderContent(prevContent => `${imageTag}${prevContent}`);
      const editor = window.tinymce.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
    });
    e.target.value = '';
  };

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSendEmails = () => {
    const htmlContent = emailContent;
    if (emailList.length === 0 || emailList.every(e => !e.trim())) {
      toast.error('Error: Empty Email List. Please enter AT LEAST One email.');
      return;
    }
    if (!isFileUploaded) {
      toast.error('Error: Please upload a file.');
      return;
    }
    const invalidEmails = emailList.filter(email => !validateEmail(email.trim()));
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
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
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
              onInit={(evt, editor) => {
                editorRef.current = editor;
              }}
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
      <div style={{ padding: 0, marginLeft: 78 }}>
        <button
          type="button"
          className="send-button"
          onClick={() => history.push('/announcements/youtube-posting')}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Go to YouTube Features
        </button>
      </div>
    </div>
  );
}

export default withRouter(Announcements);
