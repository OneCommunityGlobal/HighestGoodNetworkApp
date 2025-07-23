import React, { useState, useEffect } from 'react';
import '../styles/home.css';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faThreads } from '@fortawesome/free-brands-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { useHistory } from 'react-router-dom';
const loginHelper = require('../components/helpers/loginHelpers');
const pagesHelper = require('../components/helpers/pagesHelpers');
const instagramHelper = require('../components/helpers/instagramHelpers');
const threadsHelper = require('../components/helpers/threadsHelpers');



const HomePage = () => {
  const history = useHistory();


  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [threadsConnectionStatus, setThreadsConnectionStatus] = useState('Disconnected');
  const [tokenInfo, setTokenInfo] = useState({
    status: null,
    message: null,
    userId: null,
    timestamp: null,
    expiresIn: null
  });
  const [pages, setPages] = useState([]);
  const [instagramAccounts, setInstagramAccounts] = useState([]);
  const [threadsAccount, setThreadsAccount] = useState(null);

  useEffect(() => {
    const initializeFacebookSDK = async () => {
      try {
        await loginHelper.loadFacebookSDK();
        console.log('Facebook SDK loaded successfully');

        const loginStatus = await loginHelper.getFacebookAuthStatus();
        console.log('Login status:', loginStatus);

        if (loginStatus.status === 'success' && loginStatus.data.status === 'connected') {
          setConnectionStatus('Connected');
          // console.log('accessToken:', loginStatus.authResponse.accessToken);
          setTokenInfo({
            status: loginStatus.data.status,
            message: loginStatus.data.message,
            userId: loginStatus.data.userId,
            timestamp: new Date().toISOString(),
            expiresIn: new Date(loginStatus.data.tokenExpiresAt).getTime() - new Date().getTime()
          });
        }
      } catch (error) {
        console.error('Error loading Facebook SDK:', error);
      }
    };

    initializeFacebookSDK()
    
  }, []);

  const handleLoginButtonClick = async () => {
    const response = await loginHelper.handleFacebookLogin();

    if (response.status === 'success') {
      toast.success('Logged in successfully!');
      setConnectionStatus('Connected');
      setTokenInfo({
        status: response.data.status,
        message: response.data.message,
        userId: response.data.userId,
        timestamp: response.data.timestamp,
        expiresIn: response.data.expiresIn
      });
    } else if (response.status === 'error') {
      toast.error(response.message);
    }
  };

  const handleThreadsLoginButtonClick = async () => {
    await loginHelper.handleThreadsLogin();
    setThreadsConnectionStatus('Connected');
  };

  const handleGetThreadsAccount = async () => {
    const response = await threadsHelper.getThreadsAccount();
    if (response.status === 'success') {
      toast.success('Fetched Threads account successfully!');
      setThreadsAccount(response.data);
    } else {
      toast.error(response.message);
    }
  }

  const handleLogoutButtonClick = async () => {
    const response = await loginHelper.handleFacebookLogout();
    console.log('Logout response:', response);
    if (response.status === 'success') {
      toast.success('Logged out successfully!');
      setConnectionStatus('Disconnected');
      setTokenInfo({
        status: null,
        message: null,
        userId: null,
        timestamp: null,
        expiresIn: null
      });
    } else if (response.status === 'error') {
      toast.error(response.message);
    }
  };

  const toggleDetails = () => {
    setDetailsExpanded(prev => !prev);
  }

  const handleGetPages = async () => {
    console.log('Fetching Facebook pages...');
    const response = await pagesHelper.getFacebookPages();
    if (response.status === 'success') {
      setPages(response.data);
      toast.success('Fetched Facebook pages successfully!');
    } else {
      toast.error(response.message);
    }
  }

  const handleGetInstagramAccounts = async () => {
    console.log('Fetching Instagram accounts...');
    const response = await instagramHelper.getInstagramAccounts();
    if (response.status === 'success') {
      setInstagramAccounts(response.data);
      toast.success('Fetched Instagram accounts successfully!');
    } else {
      toast.error(response.message);
    }
  }

  return (
    <div className="home-page">
      <header className="header-container">
        <h1>Welcome to My React App</h1>
        
        <div className="status-panel">
          <div className="status-header" onClick={toggleDetails}>
            <div className="status-indicator">
              <div className={`status-dot ${connectionStatus === 'Connected' ? 'connected' : 'disconnected'}`}></div>
              <span className="status-text">{connectionStatus}</span>
            </div>
            {connectionStatus === 'Connected' && (
              <button className="toggle-details">
                {detailsExpanded ? '▲ Hide Details' : '▼ Show Details'}
              </button>
            )}
          </div>
          
          {connectionStatus === 'Connected' && detailsExpanded && (
            <div className="status-details">
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{tokenInfo.userId || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Connected At:</span>
                <span className="detail-value">
                  {tokenInfo.timestamp ? new Date(tokenInfo.timestamp).toLocaleString() : 'Unknown'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Expires In:</span>
                <span className="detail-value">
                  {
                    tokenInfo.expiresIn ? 
                      (() => {
                        const days = Math.floor(tokenInfo.expiresIn / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((tokenInfo.expiresIn % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((tokenInfo.expiresIn % (1000 * 60 * 60)) / (1000 * 60));
                        
                        if (days > 0) {
                          return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
                        } else if (hours > 0) {
                          return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
                        } else {
                          return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
                        }
                      })() : 
                      'Unknown'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="auth-buttons-container">
          <button 
            className="cta-button"
            onClick={handleLoginButtonClick}
            disabled={connectionStatus === 'Connected'}
          >
            {connectionStatus === 'Connected' ? 'Connected' : 'Connect with Facebook'}
          </button>
          {connectionStatus === 'Connected' && (
            <button 
              className="cta-button"
              onClick={handleLogoutButtonClick}
            >
              Disconnect
            </button>
          )}
        </div>
        
      </header>
      { connectionStatus === 'Connected' && (
        <section className="features">
          <div className="feature">
            <h2>Pages</h2>
            <p>See Facebook Pages connected to your account.</p>
            <button 
              className='cta-button'
              onClick={handleGetPages}
            >
              {pages.length > 0 ? 'Refresh Pages' : 'Get My Pages'}
            </button>

            <div className="pages-list-container">
              {pages.length > 0 ? (
                <ul className="pages-list">
                  {pages.map(page => (
                    <li key={page.id} className="page-item">
                      <div className="page-info">
                        <h3 className="page-name">
                          {page.name}
                          {page.instagram_business_account && (
                            <a
                              href={`https://www.instagram.com/accounts/${page.instagram_business_account.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className='instagram-badge'
                              title='View on Instagram'
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <FontAwesomeIcon icon={faInstagram} />
                              <span className="instagram-text">Instagram</span>
                            </a>
                          )}
                        </h3>
                        
                        <div className="page-details">
                          <span className='page-id'>ID: {page.id}</span>
                          
                        </div>
                        <div className='page-tasks'>
                          {page.tasks.map(task => (
                            <span key={task} className='task-badge'>{task}</span>
                          ))}
                        </div>
                        <div className='page-actions'>
                          <a
                            href={`https://www.facebook.com/${page.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className='view-page-link'
                          >
                            View Page
                          </a>
                          <button 
                            className='post-button'
                            onClick={() => {
                              console.log('Navigating to: /createPost/pages/' + page.id);
                              history.push('/createPost/pages/' + page.id)
                            }}
                          >
                            Create Post
                          </button>
                        </div>
                      </div>
                      
                    </li>
                    
                  ))}
                </ul>
              ) : (
                <p className="no-pages-message">No pages found.</p>
              )}
            </div>
          </div>
          <div className="feature">
            <h2>Instagram</h2>
            <p>See your Instagram account connected to your Facebook account.</p>
            <button 
              className='cta-button'
              onClick={handleGetInstagramAccounts}
            >
              {instagramAccounts.length > 0 ? 'Refresh Instagram Accounts' : 'Get My Instagram Accounts'}
            </button>

            <div className="instagram-accounts-container">
              {instagramAccounts.length > 0 ? (
                <ul className="instagram-accounts-list">
                  {instagramAccounts.map(account => (
                    <li key={account.instagramId} className="instagram-account-item">
                      <div className='account-profile'>

                      
                        <div className="account-profile-image-container">
                          <img 
                            src={account.profilePictureUrl} 
                            alt={`@${account.username}`} 
                            className="account-profile-image" 
                          />
                          <div className="instagram-icon-badge">
                            <FontAwesomeIcon icon={faInstagram} />
                          </div>
                        </div>
                        
                        <div className="account-info">
                          
                          <div className="account-details">
                            <h3 className="account-username">@{account.username}</h3>
                            <div className="account-detail">
                              <span className="detail-label">ID:</span>
                              <span className="detail-value">{account.instagramId}</span>
                            </div>
                            <div className="account-detail">
                              <span className="detail-label">Page:</span>
                              <span className="detail-value">{account.pageName}</span>
                            </div>
                          </div>
                          
                        </div>
                      </div>

                      <div className="account-actions">
                        <a 
                          href={`https://www.instagram.com/${account.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className='view-page-link'
                        >
                          View Profile
                        </a>

                        <button 
                          className='post-button'
                          onClick={() => {
                            console.log('Navigating to: /createPost/instagram/' + account.instagramId);
                            history.push('/createPost/instagram/' + account.instagramId)
                          }}
                        >
                          Create Post
                        </button>
                      </div>
                    </li>
                    
                  ))}
                </ul>
              ) : (
                <p className="no-accounts-message">No Instagram accounts found.</p>
              )}
            </div>
          </div>
          <div className="feature">
            <h2>Threads</h2>
            <p>See your Threads account connected to your Facebook account.</p>
            <button 
              className='cta-button'
              onClick={threadsConnectionStatus === 'Connected' ? handleGetThreadsAccount : handleThreadsLoginButtonClick}
            >
              {threadsConnectionStatus === 'Connected' ? 'Refresh Threads Account' : 'Connect with Threads'}
            </button>

            <div className="threads-account-container">
              {threadsAccount ? (
                <div className="threads-account-card">
                  <div className='account-profile'>
                    <div className="account-profile-image-container">
                      <img 
                        src={threadsAccount.threads_profile_picture_url} 
                        alt={`@${threadsAccount.username}`} 
                        className="account-profile-image" 
                      />
                      <div className="threads-icon-badge">
                        <FontAwesomeIcon icon={faThreads} />
                      </div>
                    </div>
                    
                    <div className="account-info">
                      <div className="account-details">
                        <h3 className="account-username">@{threadsAccount.username}</h3>
                        <div className="account-detail">
                          <span className="detail-label">ID:</span>
                          <span className="detail-value">{threadsAccount.id}</span>
                        </div>
                        <div className="account-detail">
                          <span className="detail-label">Name:</span>
                          <span className="detail-value">{threadsAccount.name}</span>
                        </div>
                        
                      </div>
                    </div>
                  </div>

                  <div className="account-actions">
                    <a 
                      href={`https://www.threads.net/@${threadsAccount.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className='view-page-link threads-link'
                    >
                      View Profile
                    </a>

                    <button 
                      className='post-button threads-button'
                      onClick={() => {
                        console.log('Navigating to: /createPost/threads/' + threadsAccount.id);
                        history.push('/createPost/threads/' + threadsAccount.id)
                      }}
                    >
                      Create Thread
                    </button>
                  </div>
                </div>
              ) : (
                <p className="no-accounts-message">
                  {threadsConnectionStatus === 'Connected' ? 'Click "Refresh Threads Account" to load your profile' : 'Connect with Threads to see your account here'}
                </p>
              )}
            </div>
          </div>
        </section>
      )}
      

      
    </div>
  );
};

export default HomePage;