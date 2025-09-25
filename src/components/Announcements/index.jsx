/* Announcements/Announcements.jsx */
import { useState } from 'react';
import './Announcements.css';
import { useSelector } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import SocialMediaComposer from './SocialMediaComposer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faLinkedin, faMedium } from '@fortawesome/free-brands-svg-icons';
import ReactTooltip from 'react-tooltip';
import EmailPanel from './platforms/email'; // ← new

function Announcements({ title, email: initialEmail }) {
  const [activeTab, setActiveTab] = useState('email');
  const darkMode = useSelector(state => state.theme.darkMode);

  const getIconColor = id => {
    switch (id) {
      case 'facebook':
        return '#1877F2';
      case 'linkedin':
        return '#0077B5';
      case 'medium':
        return '#00ab6c';
      default:
        return null;
    }
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

  const columns = Math.ceil(tabs.length / 2);
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))`,
    padding: '1rem',
    borderBottom: darkMode ? '1px solid #2b3b50' : '1px solid #ccc',
  };

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''} style={{ minHeight: '100%' }}>
      <Nav
        className={classnames('tab-grid', { 'two-rows': columns === 2, dark: darkMode })}
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
