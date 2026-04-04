/* Announcements/Announcements.jsx */
import { useState, useEffect } from 'react';
import styles from './Announcements.module.css';
import { useSelector } from 'react-redux';
import { Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import classnames from 'classnames';
import { useHistory, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faVideo,
  faNewspaper,
  faImage,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faLinkedin, faMedium } from '@fortawesome/free-brands-svg-icons';
import ReactTooltip from 'react-tooltip';
import { EmailPanel, SocialMediaComposer } from './platforms';

function Announcements({ title, email: initialEmail }) {
  const [activeTab, setActiveTab] = useState('email');
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();
  const location = useLocation();

  // Get active tab from URL path
  const getActiveTabFromURL = () => {
    const path = location.pathname;

    // Check for each platform
    const platforms = [
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
    ];

    for (const platform of platforms) {
      if (path.includes(`/${platform}`)) {
        return platform;
      }
    }

    // Check for email platform
    if (path.includes('/email')) {
      return 'email';
    }

    // Default to email for main announcements page
    return 'email';
  };

  // Update URL when activeTab changes
  const updateURL = tab => {
    if (tab === 'email') {
      history.push('/announcements/email');
    } else {
      // For all social media platforms
      history.push(`/announcements/${tab}`);
    }
  };

  // Update activeTab when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newTab = getActiveTabFromURL();
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname]);

  const getIconColor = id => {
    switch (id) {
      case 'facebook':
        return '#1877F2';
      case 'linkedin':
        return '#0077B5';
      case 'medium':
        return '#00ab6c';
      case 'video':
        return '#FF0000';
      case 'article':
        return '#4285f4';
      case 'photo':
        return '#E91E63';
      case 'weeklyreport':
        return '#00C853';
      default:
        return undefined;
    }
  };

  const tabs = [
    { id: 'weeklyreport', icon: faChartLine, label: 'Weekly Report' },
    { id: 'photo', icon: faImage, label: 'Photo' },
    { id: 'video', icon: faVideo, label: 'Video' },
    { id: 'article', icon: faNewspaper, label: 'Article' },
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
    { id: 'myspace', label: 'Myspace', customIconSrc: 'social-media-logos/myspace_icon.png' },
    { id: 'medium', icon: faMedium, label: 'Medium' },
    { id: 'plurk', label: 'Plurk', customIconSrc: 'social-media-logos/plurk_icon.png' },
    {
      id: 'livejournal',
      label: 'LiveJournal',
      customIconSrc: '/social-media-logos/liveJournal_icon.png',
    },
    { id: 'slashdot', label: 'Slashdot', customIconSrc: '/social-media-logos/slashdot_icon.png' },
    { id: 'blogger', label: 'Blogger', customIconSrc: '/social-media-logos/blogger_icon.png' },
    {
      id: 'truthsocial',
      label: 'Truth Social',
      customIconSrc: '/social-media-logos/truthsocial_icon.png',
    },
    { id: 'email', icon: faEnvelope, label: 'Email' },
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
        className={classnames(styles.tabGrid, {
          [styles.twoRows]: columns === 2,
          [styles.dark]: darkMode,
        })}
        style={gridStyle}
      >
        {tabs.map(({ id, icon, label, customIconSrc }) => (
          <NavItem key={id} className={styles.navItem}>
            <NavLink
              data-tip={label}
              className={classnames(styles.navLink, styles.tabNavItem, {
                [styles.active]: activeTab === id,
                [styles.dark]: darkMode,
              })}
              onClick={() => {
                setActiveTab(id);
                updateURL(id);
              }}
              aria-selected={activeTab === id}
            >
              <div className={styles.tabIcon}>
                {customIconSrc ? (
                  <img src={customIconSrc} alt={`${label} icon`} className={styles.tabIcon} />
                ) : (
                  <FontAwesomeIcon
                    icon={icon}
                    style={{ width: '100%', height: '100%', color: getIconColor(id) }}
                  />
                )}
              </div>
              <div className={styles.tabLabel}>{label}</div>
            </NavLink>
          </NavItem>
        ))}
      </Nav>
      <ReactTooltip place="bottom" type="dark" effect="solid" />

      <div style={{ backgroundColor: darkMode ? '#14233a' : '#fff', padding: '1rem' }}>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="email">
            <EmailPanel title={title} initialEmail={initialEmail} />
          </TabPane>

          <TabPane tabId="video">
            <SocialMediaComposer platform="video" />
          </TabPane>

          <TabPane tabId="article">
            <SocialMediaComposer platform="article" />
          </TabPane>

          <TabPane tabId="photo">
            <SocialMediaComposer platform="photo" />
          </TabPane>

          <TabPane tabId="weeklyreport">
            <SocialMediaComposer platform="weeklyreport" />
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
    </div>
  );
}

export default Announcements;
