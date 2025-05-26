import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { SiImgur } from 'react-icons/si';
import { toast } from 'react-toastify';
import ImgurPostEditor from './ImgurComponents/ImgurPostEditor/ImgurPostEditor';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';

function Announcements({ title, email: initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true);
  const [isFileUploaded, setIsFileUploaded] = useState(false);

  const [showImgurPostEditor, setShowImgurPostEditor] = useState(false);
  const [imgurConnectionStatus, setImgurConnectionStatus] = useState(false);

  useEffect(() => {
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

      input.onchange = () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const id = `blobid${new Date().getTime()}`;
          const { blobCache } = window.tinymce.activeEditor.editorUpload;
          const base64 = reader.result.split(',')[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };

      input.click();
    },
    a11y_advanced_options: true,
    toolbar:
      'undo redo | bold italic | blocks fontfamily fontsize | image alignleft aligncenter alignright | bullist numlist outdent indent | removeformat | help',
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

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
    if (!imageFile) {
      toast.error('Please select a file first');
      return;
    }
    setIsFileUploaded(true);
    convertImageToBase64(imageFile, base64Image => {
      const imageTag = `<img src="${base64Image}" alt="Header Image" style="width: 100%; max-width: 100%; height: auto;">`;
      setHeaderContent(prevContent => `${imageTag}${prevContent}`);
      const editor = window.tinymce.get('email-editor');
      if (editor) {
        editor.insertContent(imageTag);
        setEmailContent(editor.getContent());
      } else {
        toast.warning('Editor not ready. Please try again in a moment.');
      }
      // const editor = tinymce.current.get('email-editor');
      // if (editor) {
      //   editor.insertContent(imageTag);
      //   setEmailContent(editor.getContent());
      // }
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

  const handleImgurButtonClick = () => {
    setShowImgurPostEditor(!showImgurPostEditor);
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      {/* {title ? <h3> {title} </h3> : <h3>Weekly Progress Editor</h3>} */}
      {title ? (
        <div className="title-container">
          <h3>{title}</h3>
          <button
            type="button"
            className="imgur-button"
            onClick={() => {
              handleImgurButtonClick();
            }}
            aria-label="imgur button"
          >
            <SiImgur size={40} className="imgur-icon" />
          </button>
        </div>
      ) : (
        <div className="title-container">
          <button
            type="button"
            onClick={() => {
              handleImgurButtonClick();
            }}
          >
            <h3>Weekly Progress Editor</h3>
          </button>
          <button
            type="button"
            className="imgur-button"
            onClick={() => {
              handleImgurButtonClick();
            }}
            aria-label="imgur button"
          >
            <SiImgur size={40} className="imgur-icon" />
          </button>
        </div>
      )}
      {!showImgurPostEditor && (
        <div className="email-update-container">
          <div className="editor">
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
                className={`send-button ${darkMode ? 'boxStyleDark' : 'boxStyle'}`}
                onClick={handleBroadcastEmails}
              >
                Broadcast Weekly Update
              </button>
            )}
          </div>
          <div className={`emails ${darkMode ? 'bg-yinmn-blue boxStyleDark' : 'boxStyle'}`}>
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
              className={`send-button ${darkMode ? 'boxStyleDark' : 'boxStyle'}`}
              onClick={handleSendEmails}
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
              className={`send-button ${darkMode ? 'boxStyleDark' : 'boxStyle'}`}
              onClick={addHeaderToEmailContent}
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
      {showImgurPostEditor && (
        <ImgurPostEditor
          imgurConnectionStatus={imgurConnectionStatus}
          setImgurConnectionStatus={setImgurConnectionStatus}
        />
      )}
    </div>
  );
}

export default Announcements;
