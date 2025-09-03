/* Announcements/Announcements.jsx */
import { useState } from 'react';
import './Announcements.css';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { boxStyle, boxStyleDark } from 'styles';
import { toast } from 'react-toastify';
import ReactDOMServer from 'react-dom/server';
import { sendEmail } from '../../actions/sendEmails';
import WeeklyEmailTemplate from './WeeklyEmailTemplate';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import SocialMediaComposer from './SocialMediaComposer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faLinkedin, faMedium } from '@fortawesome/free-brands-svg-icons';
import ReactTooltip from 'react-tooltip';
import EmailPanel from './platforms/email/index.jsx';

function Announcements({ title, email: initialEmail }) {
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

  const columns = Math.ceil(tabs.length / 2);
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))`,
    padding: '1rem',
    borderBottom: darkMode ? '1px solid #2b3b50' : '1px solid #ccc',
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
    </div>
  );
}

export default Announcements;
