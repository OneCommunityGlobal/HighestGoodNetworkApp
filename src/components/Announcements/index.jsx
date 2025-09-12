/* Announcements/Announcements.jsx */
import axios from 'axios';
import { useState, useEffect } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from '../../styles';
import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import { sendEmail, broadcastEmailsToAll } from '../../actions/sendEmails';
import WeeklyEmailTemplate from './WeeklyEmailTemplate';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import SocialMediaComposer from './SocialMediaComposer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faLinkedin, faMedium } from '@fortawesome/free-brands-svg-icons';
import ReactTooltip from 'react-tooltip';
import EmailPanel from './platforms/email/index.jsx';

function Announcements({ title, email: initialEmail, history }) {
  const [activeTab, setActiveTab] = useState('email');
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
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState('');
  const [youtubeAccounts, setYoutubeAccounts] = useState([]);
  const [selectedYoutubeAccountId, setSelectedYoutubeAccountId] = useState('');
  const [showYoutubeDropdown, setShowYoutubeDropdown] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoTags, setVideoTags] = useState('');
  const [privacyStatus, setPrivacyStatus] = useState('private');
  const [isFileUploaded, setIsFileUploaded] = useState(false);

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

  useEffect(() => {
    // Render WeeklyEmailTemplate as HTML string for the editor
    const html = ReactDOMServer.renderToStaticMarkup(
      <WeeklyEmailTemplate
        headerImageUrl={headerContent || undefined}
        videoTopicImageUrl={videoTopicImage || undefined}
        darkMode={darkMode}
      />,
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
  };

  const tabs = [
    { id: 'email', icon: faEnvelope, label: 'Email' },
    { id: 'x', label: 'X', customIconSrc: 'social-media-logos/x_icon.png' },
    { id: 'facebook', icon: faFacebook, label: 'Facebook' },
    { id: 'linkedin', icon: faLinkedin, label: 'LinkedIn' },
    { id: 'pinterest', label: 'Pinterest', customIconSrc: 'social-media-logos/pinterest_icon.png' },
    { id: 'instagram', label: 'Instagram', customIconSrc: 'social-media-logos/insta_icon.png' },
    { id: 'threads', label: 'Threads', customIconSrc: 'social-media-logos/threads_icon.png' },
    { id: 'mastodon', label: 'Mastodon', customIconSrc: 'social-media-logos/mastodon_icon.png' },
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
    { id: 'slashdot', label: 'Slashdot', customIconSrc: 'social-media-logos/slashdot_icon.png' },
    { id: 'blogger', label: 'Blogger', customIconSrc: 'social-media-logos/blogger_icon.png' },
    {
      id: 'truthsocial',
      label: 'Truth Social',
      customIconSrc: 'social-media-logos/truthsocial_icon.png',
    },
  ];

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
      <WeeklyEmailTemplate
        headerImageUrl={headerContent || undefined}
        videoTopicImageUrl={videoTopicImage || undefined}
        darkMode={darkMode}
      />,
    );
    setTemplateHtml(html);
  };

  const addVideoTopicImageToTemplate = () => {
    // Just refresh the template
    const html = ReactDOMServer.renderToStaticMarkup(
      <WeeklyEmailTemplate
        headerImageUrl={headerContent || undefined}
        videoTopicImageUrl={videoTopicImage || undefined}
        darkMode={darkMode}
      />,
    );
    setTemplateHtml(html);
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

  const handleBroadcastEmails = () => {
    const htmlContent = `
    <div style="max-width: 900px; width: 100%; margin: auto;">
      ${emailContent}
    </div>
  `;
    dispatch(broadcastEmailsToAll('Weekly Update', htmlContent));
  };

  const columns = Math.ceil(tabs.length / 2);
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))`,
    padding: '1rem',
    borderBottom: darkMode ? '1px solid #2b3b50' : '1px solid #ccc',
  };

  const handleVideoChange = e => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoURL(url);
    } else {
      setVideoFile(null);
      setVideoURL('');
      toast.error('Please select a valid video file');
    }
  };

  const oauthSignIn = () => {
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = {
      client_id: '79576137807-b7j4fsdm0u9pgorsohcq97gqsaglf7la.apps.googleusercontent.com',
      redirect_uri: 'http://localhost:3000/announcements',
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      include_granted_scopes: 'true',
      state: 'pass-through value',
    };
    const form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint);
    Object.keys(params).forEach(p => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  useEffect(() => {
    fetch('/api/youtubeAccounts')
      .then(res => res.json())
      .then(data => setYoutubeAccounts(data))
      .catch(() => {});
  }, []);

  const handlePostVideoToYouTube = async () => {
    if (!videoFile || !selectedYoutubeAccountId) {
      toast.error('Please select a video and YouTube account');
      return;
    }
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('youtubeAccountId', selectedYoutubeAccountId);
    formData.append('title', videoTitle);
    formData.append('description', videoDescription);
    formData.append('tags', videoTags);
    formData.append('privacyStatus', privacyStatus);
    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const res = await axios.post('http://localhost:4500/api/uploadYtVideo', formData, {
        headers,
      });
      if (res.status === 200) {
        toast.success('Video uploaded successfully!');
        setShowYoutubeDropdown(false);
        setSelectedYoutubeAccountId('');
      } else {
        toast.error('Video upload failed');
      }
    } catch (err) {
      toast.error('Upload error');
    }
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <Nav
        className={classnames('tab-grid', { 'two-rows': columns, dark: darkMode })}
        style={gridStyle}
      >
        {tabs.map(({ id, icon, label, customIconSrc }) => (
          <NavItem key={id}>
            <NavLink
              data-tip={label}
              className={classnames('tab-nav-item', { active: activeTab === id, dark: darkMode })}
              onClick={() => setActiveTab(id)}
              aria-selected={activeTab === id}
            >
              <div className="tab-icon">
                {customIconSrc ? (
                  <img src={customIconSrc} alt={`${label} icon`} className="tab-icon" />
                ) : (
                  <FontAwesomeIcon
                    icon={icon}
                    style={{ width: '100%', height: '100%', color: getIconColor(id) }}
                  />
                )}
              </div>
              <div className="tab-label">{label}</div>
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <ReactTooltip place="bottom" type="dark" effect="solid" />

      <div style={{ backgroundColor: darkMode ? '#14233a' : '#fff', padding: '1rem' }}>
        <TabContent activeTab={activeTab}>
          {/* Email tab now uses the extracted component */}
          <TabPane tabId="email">
            <EmailPanel title={title} initialEmail={initialEmail} />
          </TabPane>

          {/* Platforms stay the same */}
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
      <div className="social-media-container">
        <div className="social-media">
          {title ? <h3>{title}</h3> : <h3>Social Media Post</h3>}
          {title ? null : (
            <label htmlFor="social-media-list" className={darkMode ? 'text-light' : 'text-dark'}>
              Click on below social media to post
            </label>
          )}

          {title ? null : (
            <div
              className="social-buttons-container"
              style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
            >
              <button
                type="button"
                className="send-button"
                onClick={oauthSignIn}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Sign in with Google
              </button>
              <button
                type="button"
                className="send-button"
                onClick={() => setShowYoutubeDropdown(true)}
                style={darkMode ? boxStyleDark : boxStyle}
              >
                Post video to YouTube channel
              </button>
              {showYoutubeDropdown && (
                <>
                  <select
                    className="select-youtube-account"
                    value={selectedYoutubeAccountId}
                    onChange={e => setSelectedYoutubeAccountId(e.target.value)}
                  >
                    <option value="">Select YouTube Account</option>
                    <option value="test1">Test Channel 1</option>
                    <option value="test2">Test Channel 2</option>
                    {youtubeAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.displayName || acc.name || acc.clientId}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="send-button"
                    disabled={!videoFile || !selectedYoutubeAccountId}
                    onClick={handlePostVideoToYouTube}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="send-button"
                    onClick={() => setShowYoutubeDropdown(false)}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="video-preview-container">
          <input type="file" accept="video/*" onChange={handleVideoChange} />
          <input
            type="text"
            placeholder="Video Title"
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: 8 }}
          />
          <input
            type="text"
            placeholder="Video Description"
            value={videoDescription}
            onChange={e => setVideoDescription(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: 8 }}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={videoTags}
            onChange={e => setVideoTags(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: 8 }}
          />
          <select
            value={privacyStatus}
            onChange={e => setPrivacyStatus(e.target.value)}
            style={{ marginTop: 10, width: '100%', padding: 8 }}
          >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
          </select>
          {videoURL && (
            <div>
              <video width="480" controls aria-label="Video Preview">
                <source src={videoURL} type={videoFile.type} />
                <track kind="captions" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
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
