import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from '~/styles';
import { sendEmail, broadcastEmailsToAll } from '../../../../actions/sendEmails.jsx';
import styles from '../../Announcements.module.css';

export default function EmailPanel({ title, initialEmail }) {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    setShowEditor(false);
    const t = setTimeout(() => setShowEditor(true), 0);
    return () => clearTimeout(t);
  }, [darkMode]);

  useEffect(() => {
    if (initialEmail) {
      const trimmed = initialEmail.trim();
      setEmailTo(initialEmail);
      setEmailList(trimmed.split(','));
    }
  }, [initialEmail]);

  const validateEmail = email => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

  const handleEmailListChange = e => {
    const { value } = e.target;
    setEmailTo(value);
    setEmailList(value.split(','));
  };

  const handleHeaderContentChange = e => setHeaderContent(e.target.value);

  const convertImageToBase64 = (file, cb) => {
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result);
    reader.readAsDataURL(file);
  };

  const addHeaderToEmailContent = () => {
    if (!headerContent) return;
    const imageTag = `<img src="${headerContent}" alt="Header Image" style="width:100%;max-width:100%;height:auto;">`;
    const editor = window.tinymce.get('email-editor');
    if (editor) {
      editor.insertContent(imageTag);
      setEmailContent(editor.getContent());
    }
    setHeaderContent('');
  };

  const addImageToEmailContent = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsFileUploaded(true);
    convertImageToBase64(file, base64 => {
      const imageTag = `<img src="${base64}" alt="Header Image" style="width:100%;max-width:100%;height:auto;">`;
      const editor = window.tinymce.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
    });
    e.target.value = '';
  };

  const handleSendEmails = () => {
    const htmlContent = emailContent;

    if (emailList.length === 0 || emailList.every(e => !e.trim())) {
      toast.error('Error: Empty Email List. Please enter AT LEAST one email.');
      return;
    }
    if (!isFileUploaded) {
      toast.error('Error: Please upload a file.');
      return;
    }
    const invalid = emailList.filter(e => !validateEmail(e.trim()));
    if (invalid.length > 0) {
      toast.error(`Error: Invalid email addresses: ${invalid.join(', ')}`);
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

  const editorInit = {
    license_key: 'gpl',
    selector: 'Editor#email-editor',
    height: 500,
    plugins: [
      'advlist autolink lists link image',
      'charmap print preview anchor help',
      'searchreplace visualblocks code',
      'insertdatetime media table wordcount',
    ],
    menubar: false,
    branding: false,
    image_title: true,
    automatic_uploads: true,
    file_picker_callback(cb) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const id = `blobid${Date.now()}`;
          const { blobCache } = window.tinymce.activeEditor.editorUpload;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };
      // eslint-disable-next-line testing-library/no-node-access
      input.click();
    },
    a11y_advanced_options: true,
    toolbar:
      'undo redo | bold italic | blocks fontfamily fontsize | image alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | help',
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  return (
    <div className={styles.emailUpdateContainer}>
      <div className={styles.editor}>
        {title ? <h3>{title}</h3> : <h3>Weekly Progress Editor</h3>}
        <br />
        {showEditor && (
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            id="email-editor"
            initialValue="<p>This is the initial content of the editor</p>"
            init={editorInit}
            onEditorChange={setEmailContent}
            onInit={(evt, editor) => {
              editorRef.current = editor;
            }}
          />
        )}
        <div className="send-buttons" style={{ marginTop: '1rem' }}>
          <button type="button" onClick={handleBroadcastEmails} className={styles.sendButton}>
            Broadcast Weekly Update
          </button>
        </div>
      </div>

      {title ? null : (
        <div
          className={`${styles.emails}${darkMode ? ' bg-yinmn-blue text-light' : ''}`}
          style={darkMode ? boxStyleDark : boxStyle}
        >
          <label htmlFor="email-list-input" className={darkMode ? 'text-light' : 'text-dark'}>
            Email List (comma-separated)<span className="red-asterisk">* </span>:
          </label>
          <input
            type="text"
            id="email-list-input"
            value={emailTo}
            onChange={handleEmailListChange}
            placeholder="Enter email addresses (comma-separated)"
            className={`${styles.inputTextForAnnouncement} ${
              darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
            }`}
          />
          <button
            type="button"
            className={styles.sendButton}
            onClick={handleSendEmails}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Send mail to specific users
          </button>

          <hr />
          <label htmlFor="header-content-input" className={darkMode ? 'text-light' : 'text-dark'}>
            Insert header or image link:
          </label>
          <input
            type="text"
            id="header-content-input"
            value={headerContent}
            onChange={handleHeaderContentChange}
            placeholder="Enter header image URL"
            className={`${styles.inputTextForAnnouncement} ${
              darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
            }`}
          />
          <button
            type="button"
            className={styles.sendButton}
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
            className={styles.inputFileUpload}
          />
        </div>
      )}
    </div>
  );
}
