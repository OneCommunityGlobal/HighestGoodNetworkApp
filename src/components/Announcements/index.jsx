import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import { sendEmail } from '../../actions/sendEmails';
import WeeklyEmailTemplate from './WeeklyEmailTemplate';

function Announcements({ title, email: initialEmail }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const dispatch = useDispatch();
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [headerContent, setHeaderContent] = useState('');
  const [showEditor, setShowEditor] = useState(true);
  const [templateHtml, setTemplateHtml] = useState('');
  const [videoTopicImage, setVideoTopicImage] = useState(
    'https://www.dropbox.com/scl/fi/e4gv4jo2p128u2ezqva4j/topic.jpg?rlkey=10qsu8i15my3fa3bk34z4yjhq&raw=1',
  );

  useEffect(() => {
    setShowEditor(false);
    setTimeout(() => setShowEditor(true), 0);
  }, [darkMode]);

  useEffect(() => {
    // Render WeeklyEmailTemplate as HTML string for the editor
    const html = ReactDOMServer.renderToStaticMarkup(
      <WeeklyEmailTemplate headerImageUrl={headerContent || undefined} />,
    );
    setTemplateHtml(html);
  }, []);

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
    // Just refresh the template
    const html = ReactDOMServer.renderToStaticMarkup(
      <WeeklyEmailTemplate headerImageUrl={headerContent || undefined} />,
    );
    setTemplateHtml(html);
  };

  const addVideoTopicImageToTemplate = () => {
    // Just refresh the template
    const html = ReactDOMServer.renderToStaticMarkup(
      <WeeklyEmailTemplate
        headerImageUrl={headerContent || undefined}
        videoTopicImageUrl={videoTopicImage || undefined}
      />,
    );
    setTemplateHtml(html);
  };

  const validateEmail = email => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSendEmails = () => {
    const editor = window.tinymce.get('email-editor');
    const htmlContent = editor ? editor.getContent() : emailContent;

    if (emailList.length === 0 || emailList.every(e => !e.trim())) {
      toast.error('Error: Empty Email List. Please enter AT LEAST One email.');
      return;
    }

    if (!htmlContent || htmlContent.trim() === '') {
      toast.error('Error: Email content cannot be empty.');
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

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <div className="email-update-container">
        <div className="editor">
          {title ? <h3> {title} </h3> : <h3>Weekly Progress Editor</h3>}

          <br />
          {showEditor && (
            <div
              style={{
                height: '100%',
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                id="email-editor"
                initialValue={templateHtml}
                init={{
                  ...editorInit,
                  height: '100%',
                  min_height: 600,
                  max_height: 9999,
                }}
                onEditorChange={content => {
                  setEmailContent(content);
                }}
              />
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
            {title ? 'Send Email' : 'Send mail to users'}
          </button>

          <hr />
          {/* Header Image Input Box */}
          <label htmlFor="header-image-input" className={darkMode ? 'text-light' : 'text-dark'}>
            Header image link:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              id="header-image-input"
              value={
                headerContent ||
                'https://www.dropbox.com/scl/fi/60pgjcylcw15uik0wmoxj/HD-Horizontal-Logo-1275x375.jpg?rlkey=34nu3c1pav1d16dkstu5jq8g8&raw=1'
              }
              onChange={handleHeaderContentChange}
              className={`input-text-for-announcement ${
                darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
              }`}
            />
            <button
              type="button"
              className="send-button small-button"
              onClick={addHeaderToEmailContent}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Change
            </button>
          </div>
          <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
            For Dropbox URL that ends with &quot;dl=0&quot;, please replace with &quot;raw=1&quot;.
          </div>
          <hr />
          {/* Video Topic Image Input Box (Changeable) */}
          <label
            htmlFor="video-topic-image-input"
            className={darkMode ? 'text-light' : 'text-dark'}
          >
            Video topic image link:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              id="video-topic-image-input"
              value={
                videoTopicImage ||
                'https://www.dropbox.com/scl/fi/e4gv4jo2p128u2ezqva4j/topic.jpg?rlkey=10qsu8i15my3fa3bk34z4yjhq&raw=1'
              }
              onChange={e => setVideoTopicImage(e.target.value)}
              className={`input-text-for-announcement ${
                darkMode ? 'bg-darkmode-liblack text-light border-0' : ''
              }`}
            />
            <button
              type="button"
              className="send-button small-button"
              onClick={addVideoTopicImageToTemplate}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Change
            </button>
          </div>
          <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
            For Dropbox URL that ends with &quot;dl=0&quot;, please replace with &quot;raw=1&quot;.
          </div>
          <hr />
        </div>
      </div>
    </div>
  );
}

export default Announcements;
