import { useState } from 'react';
import './LBMessaging.css';
import { useLocation } from 'react-router-dom';
import logo from '../../../assets/images/logo2.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faLocationArrow, faTimes, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from 'actions/userManagement';
import { useEffect } from 'react';
import React from 'react';
import { useRef } from 'react';
import { toast } from 'react-toastify';

export default function LBMessaging() {
  const dispatch = useDispatch();
  const [selectedUser, updateSelectedUser] = useState({});
  const [selectContact, updateSelectContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const users = useSelector(state => state.allUserProfilesBasicInfo);
  const auth = useSelector(state => state.auth.user);
  const userPreferences = useSelector(state => state.lbuserpreferences);
  const location = useLocation();
  const [bellDropdownActive, setBellDropdownActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState(userPreferences);
  const contactIcon = `lb-messaging-contact-icon${selectContact ? '-select' : ''}`;
  const messagesState = useSelector(state => state.lbmessaging);
  const { messages } = messagesState;
  const messageEndRef = useRef(null);

  const browserNotificationPermission = () => {
    Notification.requestPermission();
  };

  const saveUserPreferences = () => {
    setBellDropdownActive(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get('chat');

    if (chatId && users.userProfilesBasicInfo.length > 0) {
      const matchedUser = users.userProfilesBasicInfo.find(u => u._id?.toString() === chatId);
      if (matchedUser) {
        matchedUser.id = matchedUser._id;
        updateSelectedUser(matchedUser);
      }
    }
  }, [location.search, users.userProfilesBasicInfo]);


  useEffect(() => {
    if (users.userProfilesBasicInfo.length === 0) {
      dispatch(getUserProfileBasicInfo());
    }
  }, [dispatch, users.userProfilesBasicInfo]);


  const updateSelection = user => {
    updateSelectedUser(user);
  };

  const toggleContacts = () => {
    const contacts = document.querySelector('.lb-messaging-contacts');
    if (contacts.style.display === 'block') {
      contacts.style.display = 'none';
    } else {
      contacts.style.display = 'block';
    }
  };

  const renderChatMessages = (conversation, loggedInUserId) => {
    return (
      <div className='messaging-chat-window'>
        <div className="message-list">
          {/* the chat message come here  */}


          <div ref={messageEndRef} />

        </div>
        <div className="lb-messaing-message-window-footer">
          <input
            type="text"
            placeholder="Type a message here ....."
            disabled={Object.keys(selectedUser).length === 0}
          />
          <FontAwesomeIcon
            icon={faLocationArrow}
            className="send-button"
            size="2x"
            title="Send"
          />
        </div>
      </div>
    );
  };

  return (users.userProfilesBasicInfo.length !== 0) && (
    <div className="main-container">
      <div className="logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className="content-container">
        <div className="container-top" >
          {/* <div
            className={darkMode ? 'hamburger-icon-dark' : 'hamburger-icon'}
            onClick={toggleContacts}
            title="Chats"
          >
            ☰
          </div> */}
        </div>
        <div className=" container-main-msg">
          <div className='lb-messaging-contacts'>
            <div className='lb-messaging-contacts-header'>
              <input
                type="text"
                placeholder="Search contacts..."
                className="lb-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {users.userProfilesBasicInfo?.length !== 0 ? (
                <FontAwesomeIcon
                  className={contactIcon}
                  icon={faUserCircle}
                  size="2x"
                  onClick={() => updateSelectContact(prev => !prev)}
                  title="Contacts"
                />
              ) : (
                <span />
              )}
              <FontAwesomeIcon
                icon={faTimes}
                className='contacts-close-button'
                onClick={toggleContacts}
                title="Close"
              />
            </div>
            <div className='lb-messaging-contacts-body'>
              {!selectContact
                ? (
                  <div>
                    
                  </div>
                )
                : users.userProfilesBasicInfo
                  .filter(user =>
                    `${user.firstName} ${user.lastName}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map(user => (
                    <div
                      key={`${user.firstName}-${user._id}`}
                      className='lb-messaging-contact'
                      onClick={() => updateSelection(user)}
                      title={`Click to Chat with ${user.firstName}`}
                    >
                      <img
                        src={user.profilePic ? user.profilePic : '/pfp-default-header.png'}
                        alt="onecommunity-logo"
                      />
                      <div className='lb-messaging-contact-info'>
                        <div className='lb-messaging-contact-name'>
                          {user.firstName + user.lastName}
                        </div>
                      </div>
                    </div>
                  ))
                  }
            </div>
          </div>
          {/* we need to check all messages that has */}
          <div className='lb-messaging-message-window'>
            <div className='lb-messaging-message-window-header'>
              <div>
                <img
                  src={'/pfp-default-header.png'}
                  alt="profile Image"
                />
                {Object.keys(selectedUser).length === 0
                  ? ''
                  : `${selectedUser.firstName} ${selectedUser.lastName}`}
              </div>
              <div>
                <div className="lg-messaging-notification-wrapper">
                  <FontAwesomeIcon
                    icon={faBell}
                    onClick={() => setBellDropdownActive(prev => !prev)}
                    className="lg-messaging-notification-bell"
                  />
                  {bellDropdownActive && (
                    <div className={(bellDropdownActive ? 'active' : '' )+ ` lg-messaging-bell-select-dropdown `}>
                      <label>
                        <input
                          type="checkbox"
                          className="lg-messaging-notification-checkbox"
                          value="notifications"
                          checked={selectedOption.notifyInApp}
                          onChange={e => {
                            const { checked } = e.target;
                            if (checked) browserNotificationPermission();
                            setSelectedOption(prevState => ({
                              ...prevState,
                              notifyInApp: checked,
                            }));
                          }}
                        />
                        <span>In App</span>
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          className="lg-messaging-notification-checkbox"
                          value="messages"
                          checked={selectedOption.notifySMS}
                          onChange={e => {
                            const { checked } = e.target;
                            if (checked) browserNotificationPermission();
                            setSelectedOption(prevState => ({
                              ...prevState,
                              notifySMS: checked,
                            }));
                          }}
                        />
                        <span>SMS</span>
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          className="lg-messaging-notification-checkbox"
                          value="activity"
                          checked={selectedOption.notifyEmail}
                          onChange={e => {
                            const { checked } = e.target;
                            setSelectedOption(prevState => ({
                              ...prevState,
                              notifyEmail: checked,
                            }));
                          }}
                        />
                        <span>Email</span>
                      </label>
                      <button
                        type="button"
                        className="lg-messaging-submit-button"
                        onClick={saveUserPreferences}
                      >
                        Save Preferences
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="lb-messaging-message-window-body">
              {Object.keys(selectedUser).length === 0 ? (
                <span id={'lb-messaging-window-nochat'}>
                  Select a chat to get started
                </span>
              ) : (
                renderChatMessages(
                  auth.userid,
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
