/* eslint-disable no-undef */
import { useState, useEffect, useRef } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from '~/styles';
import { toast } from 'react-toastify';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails.jsx';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import SocialMediaComposer from './SocialMediaComposer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faLinkedin, faMedium } from '@fortawesome/free-brands-svg-icons';
import ReactTooltip from 'react-tooltip';

function Announcements({ title, email: initialEmail }) {
  const [activeTab, setActiveTab] = useState('email');

  const iconTabStyle = tabId => ({
    flex: 1,
    textAlign: 'center',
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: activeTab === tabId ? '2px solid #007bff' : '2px solid transparent',
    backgroundColor: activeTab === tabId ? '#eef6ff' : '#f9f9f9',
    color: activeTab === tabId ? '#007bff' : '#444',
    fontWeight: activeTab === tabId ? 'bold' : 'normal',
  });

  const getIconColor = id => {
    switch (id) {
      case 'facebook':
        return '#1877F2';
      case 'linkedin':
        return '#0077B5';
      case 'medium':
        return '#00ab6c';
      default:
        return undefined;
    }
  };

  const toggleTab = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

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
      <Nav
        tabs
        className="mb-3 flex-wrap"
        style={{
          paddingLeft: '1rem',
          paddingTop: '1rem',
          display: 'flex',
          flexWrap: 'wrap',
          borderBottom: '1px solid #ccc',
        }}
      >
        {[
          { id: 'email', icon: faEnvelope, label: 'Email' },
          { id: 'x', label: 'X', customIconSrc: 'social-media-logos/x_icon.png' },
          { id: 'facebook', icon: faFacebook, label: 'Facebook' },
          { id: 'linkedin', icon: faLinkedin, label: 'LinkedIn' },
          {
            id: 'pinterest',
            label: 'Pinterest',
            customIconSrc: 'social-media-logos/pinterest_icon.png',
          },
          {
            id: 'instagram',
            label: 'Instagram',
            customIconSrc: 'social-media-logos/insta_icon.png',
          },
          { id: 'threads', label: 'Threads', customIconSrc: 'social-media-logos/threads_icon.png' },
          {
            id: 'mastodon',
            label: 'Mastodon',
            customIconSrc: 'social-media-logos/mastodon_icon.png',
          },
          { id: 'bluesky', label: 'BlueSky', customIconSrc: 'social-media-logos/bluesky_icon.png' },
          { id: 'youtube', label: 'Youtube', customIconSrc: 'social-media-logos/youtube_icon.png' },
          { id: 'reddit', label: 'Reddit', customIconSrc: 'social-media-logos/reddit_icon.png' },
          { id: 'tumblr', label: 'Tumblr', customIconSrc: 'social-media-logos/tumblr_icon.png' },
          { id: 'imgur', label: 'Imgur', customIconSrc: 'social-media-logos/imgur_icon.png' },
          { id: 'diigo', label: 'Diigo', customIconSrc: 'social-media-logos/diigo_icon.png' },
          { id: 'myspace', label: 'Myspace', customIconSrc: 'social-media-logos/myspace_icon.png' },
          { id: 'medium', icon: faMedium, label: 'Medium' },
          { id: 'plurk', label: 'Plurk', customIconSrc: 'social-media-logos/plurk_icon.png' },
          { id: 'bitily', label: 'Bitily', customIconSrc: 'social-media-logos/bitily_icon.png' },
          {
            id: 'livejournal',
            label: 'LiveJournal',
            customIconSrc: 'social-media-logos/liveJournal_icon.png',
          },
          {
            id: 'slashdot',
            label: 'Slashdot',
            customIconSrc: 'social-media-logos/slashdot_icon.png',
          },
          { id: 'blogger', label: 'Blogger', customIconSrc: 'social-media-logos/blogger_icon.png' },
          {
            id: 'truthsocial',
            label: 'Truth Social',
            customIconSrc: 'social-media-logos/truthsocial_icon.png',
          },
        ].map(({ id, icon, label, customIconSrc }) => (
          <NavItem key={id} style={{ flex: 1 }}>
            <NavLink
              data-tip={label}
              className={classnames({ active: activeTab === id })}
              onClick={() => toggleTab(id)}
              style={{
                ...iconTabStyle(id),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                gap: '4px',
                minWidth: '70px',
              }}
            >
              <div style={{ width: '24px', height: '24px' }}>
                {customIconSrc ? (
                  <img
                    src={customIconSrc}
                    alt={`${label} icon`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={icon}
                    style={{ width: '100%', height: '100%', color: getIconColor(id) }}
                  />
                )}
              </div>
              <div style={{ fontSize: '0.75rem', lineHeight: '1rem', textAlign: 'center' }}>
                {label}
              </div>
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <ReactTooltip place="bottom" type="dark" effect="solid" />
      <TabContent activeTab={activeTab}>
        <TabPane tabId="email">
          <div className="email-update-container">
            <div className="editor">
              {title ? <h3>{title}</h3> : <h3>Weekly Progress Editor</h3>}
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
              <div className="send-buttons" style={{ marginTop: '1rem' }}>
                <button type="button" onClick={handleBroadcastEmails} className="send-button">
                  Broadcast Weekly Update
                </button>
              </div>
            </div>

            {title ? null : (
              <div
                className={`emails${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
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
                  Send mail to specific users
                </button>

                <hr />
                <label
                  htmlFor="header-content-input"
                  className={darkMode ? 'text-light' : 'text-dark'}
                >
                  Insert header or image link:
                </label>
                <input
                  type="text"
                  id="header-content-input"
                  value={headerContent}
                  onChange={handleHeaderContentChange}
                  placeholder="Enter header image URL"
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
                <label
                  htmlFor="upload-header-input"
                  className={darkMode ? 'text-light' : 'text-dark'}
                >
                  Upload Header (or footer):
                </label>
                <input
                  type="file"
                  id="upload-header-input"
                  onChange={addImageToEmailContent}
                  className="input-file-upload"
                />
              </div>
            )}
          </div>
        </TabPane>
        {[
          'x',
          'facebook',
          'linkedin',
          'pinterest',
          'instagram',
          'threads',
          'mastodon',
          'bluesky',
          'youtube',
          'reddit',
          'tumblr',
          'imgur',
          'diigo',
          'myspace',
          'medium',
          'plurk',
          'bitily',
          'livejournal',
          'slashdot',
          'blogger',
          'truthsocial',
        ].map(platform => (
          <TabPane tabId={platform} key={platform}>
            <SocialMediaComposer platform={platform} />
          </TabPane>
        ))}
      </TabContent>
    </div>
  );
}

export default Announcements;
