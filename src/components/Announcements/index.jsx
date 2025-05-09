import { useState, useEffect, useRef } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react'; // Import Editor from TinyMCE
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';

function Announcements({ title, email }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true); // State to control rendering of the editor
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  useEffect(() => {
    // Toggle the showEditor state to force re-render when dark mode changes
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

  const editorInit = {
    license_key: 'gpl',
    selector: 'Editor#email-editor',
    height: 500,
    plugins: [
      'advlist autolink lists link image paste',
      'charmap print preview anchor help',
      'searchreplace visualblocks code',
      'insertdatetime media table paste wordcount',
    ],
    menubar: false,
    branding: false,
    image_title: true,
    automatic_uploads: true,
    file_picker_callback(cb) {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      /*
        Note: In modern browsers input[type="file"] is functional without
        even adding it to the DOM, but that might not be the case in some older
        or quirky browsers like IE, so you might want to add it to the DOM
        just in case, and visually hide it. And do not forget do remove it
        once you do not need it anymore.
      */

      input.onchange = () => {
        const file = input.files[0];

        const reader = new FileReader();
        reader.onload = () => {
          /*
            Note: Now we need to register the blob in TinyMCEs image blob
            registry. In the next release this part hopefully won't be
            necessary, as we are looking to handle it internally.
          */
          const id = `blobid${new Date().getTime()}`;
          const { blobCache } = tinymce.current.activeEditor.editorUpload;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);

          /* call the callback and populate the Title field with the file name */
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };

      input.click();
    },
    a11y_advanced_options: true,
    toolbar:
      // eslint-disable-next-line no-multi-str
      'undo redo | bold italic | blocks fontfamily fontsize | image \
      alignleft aligncenter alignright | \
      bullist numlist outdent indent | removeformat | help',
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  useEffect(() => {
    if (email) {
      const trimmedEmail = email.trim();
      setEmailTo(email);
      setEmailList(trimmedEmail.split(','));
    }
  }, [email]);

  const handleEmailListChange = e => {
    const { value } = e.target;
    setEmailTo(value); // Update emailTo for the input field
    setEmailList(value.split(',')); // Update emailList for the email list
  };

  const handleHeaderContentChange = e => {
    setHeaderContent(e.target.value);
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
    setHeaderContent(''); // Clear the input field after inserting the header
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
      const editor = tinymce.current.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      }
    });
    e.target.value = '';
  };

  const validateEmail = e => {
    /* Add a regex pattern for email validation */
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(e);
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
            />
          )}
          {title ? (
            ''
          ) : (
            <button
              type="button"
              className="send-button"
              onClick={handleBroadcastEmails}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Broadcast Weekly Update
            </button>
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
              Email List (comma-separated):
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
    </div>
  );
}

export default Announcements;
