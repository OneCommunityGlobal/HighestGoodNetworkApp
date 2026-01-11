import { useState, useEffect, useRef } from 'react';
import styles from './LBMessaging.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faLocationArrow, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from '../../../actions/userManagement';
import {
  fetchUserPreferences,
  updateUserPreferences,
} from '../../../actions/lbDashboard/userPreferenceActions';
import { toast } from 'react-toastify';
import { fetchExistingChats, fetchMessages } from '../../../actions/lbDashboard/messagingActions';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import {
  initMessagingSocket,
  getMessagingSocket,
  updateChatState,
  markMessagesAsReadViaSocket,
} from '../../../utils/messagingSocket';
import logo from '../../../assets/images/logo2.png';
import Header from '../../Header/Header';

export default function LBMessaging() {
  const dispatch = useDispatch();
  const [selectedUser, updateSelectedUser] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [placeholder, setPlaceholder] = useState('Search Contacts...');
  const [mobileView, setMobileView] = useState(false);
  const [mobileHamMenu, setMobileHamMenu] = useState(false);

  const [bellDropdownActive, setBellDropdownActive] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    notifyInApp: false,
    notifyEmail: false,
    notifySms: false,
    smsPhone: '',
    smsPhoneMasked: '',
  });
  const messageEndRef = useRef(null);
  const menuRef = useRef(null);
  const lastSendAtRef = useRef(0);
  const lastMessageRef = useRef('');
  const lastNotificationCountRef = useRef(0);

  const users = useSelector(state => state.allUserProfilesBasicInfo) || {
    userProfilesBasicInfo: [],
  };
  const userProfilesBasicInfo = users.userProfilesBasicInfo || [];
  const auth = useSelector(state => state.auth.user) || {};
  const authUserId = auth?.userid || auth?.userId || auth?._id;
  const messagesState = useSelector(state => state.messages) || {};
  const existingChats = messagesState.existingChats || [];
  const {
    messages = [],
    loading: messagesLoading = false,
    notifications = [],
    error,
  } = messagesState;
  const unreadNotificationsCount = notifications.length;

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const searchUserProfiles = async query => {
    try {
      const { data } = await axios.get(`${ENDPOINTS.LB_SEARCH_USERS}?query=${query}`);
      setSearchResults(data);
    } catch (error) {
      Error('Error searching user profiles:', error);
    }
  };

  useEffect(() => {
    if (userProfilesBasicInfo.length === 0) {
      dispatch(getUserProfileBasicInfo());
    }
  }, [dispatch, userProfilesBasicInfo, authUserId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    initMessagingSocket(token);

    return () => {
      const socket = getMessagingSocket();
      if (socket) {
        socket.close();
      }
    };
  }, [authUserId]);

  useEffect(() => {
    if (selectedUser.userId) {
      markMessagesAsReadViaSocket(selectedUser.userId);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser.userId) {
      updateChatState(true, selectedUser.userId);
    } else {
      updateChatState(true, null);
    }

    return () => {
      updateChatState(false, null);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (authUserId) {
      dispatch(fetchExistingChats(authUserId));
    }
  }, [dispatch, authUserId]);

  useEffect(() => {
    if (!authUserId) {
      setNotificationSettings({
        notifyInApp: false,
        notifyEmail: false,
        notifySms: false,
        smsPhone: '',
      });
      return;
    }

    dispatch(fetchUserPreferences(authUserId, null)).then(response => {
      if (response) {
        setNotificationSettings({
          notifyInApp: response.notifyInApp || false,
          notifyEmail: response.notifyEmail || false,
          notifySms: response.notifySms || false,
          smsPhone: '',
          smsPhoneMasked: response.smsPhoneMasked || getMaskedPhone(response.smsPhone) || '',
        });
      } else {
        setNotificationSettings({
          notifyInApp: false,
          notifyEmail: false,
          notifySms: false,
          smsPhone: '',
          smsPhoneMasked: '',
        });
      }
    });
  }, [dispatch, authUserId]);

  useEffect(() => {
    if (notifications.length > lastNotificationCountRef.current) {
      toast.info('New message received.');
    }
    lastNotificationCountRef.current = notifications.length;
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileHamMenu(false); // Close the menu if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateSelection = user => {
    const newSelectedUser = {
      userId: user.userId || user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic || '/pfp-default-header.png',
    };

    updateSelectedUser(newSelectedUser);

    if (newSelectedUser.userId) {
      if (authUserId) {
        dispatch(fetchMessages(authUserId, newSelectedUser.userId));
      }
    } else {
      Error('Invalid user selected:', user);
      toast.error('Invalid user selected. Please try again.');
    }
  };

  const persistNotificationPreferences = () => {
    if (!authUserId) {
      toast.error('Unable to update preferences without a valid user.');
      return Promise.reject(new Error('Missing user ID'));
    }
    const cleanedPhone = notificationSettings.smsPhone.replace(/[^\d+]/g, '');
    const digits = cleanedPhone.replace(/\D/g, '');
    if (notificationSettings.notifySms && digits.length > 0 && digits.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number for SMS notifications.');
      return Promise.reject(new Error('Invalid phone number'));
    }

    const payload = {
      notifyInApp: notificationSettings.notifyInApp,
      notifyEmail: notificationSettings.notifyEmail,
      notifySms: notificationSettings.notifySms,
    };
    if (digits.length > 0) {
      payload.smsPhone = cleanedPhone;
    }

    return dispatch(updateUserPreferences(authUserId, null, payload)).then(() => {
      // Refresh preferences after saving
      return dispatch(fetchUserPreferences(authUserId, null)).then(response => {
        const refreshed = response?.payload || response;
        if (refreshed) {
          setNotificationSettings(prev => ({
            ...prev,
            notifyInApp: refreshed.notifyInApp || false,
            notifyEmail: refreshed.notifyEmail || false,
            notifySms: refreshed.notifySms || false,
            smsPhoneMasked: refreshed.smsPhoneMasked || getMaskedPhone(refreshed.smsPhone) || '',
          }));
        }
      });
    });
  };

  const saveUserPreferences = () => {
    persistNotificationPreferences()
      .then(() => {
        toast.success('Preferences updated successfully!');
        setBellDropdownActive(false);
      })
      .catch(error => {
        if (error?.message !== 'Missing user ID' && error?.message !== 'Invalid phone number') {
          toast.error('Failed to update preferences. Please try again.');
        }
        Error('Error updating preferences:', error);
      });
  };

  const saveSmsPreferences = () => {
    if (!authUserId) {
      toast.error('Unable to update SMS settings without a valid user.');
      return;
    }

    persistNotificationPreferences()
      .then(() => {
        toast.success('SMS settings updated successfully!');
      })
      .catch(error => {
        if (error?.message !== 'Missing user ID' && error?.message !== 'Invalid phone number') {
          toast.error('Failed to update SMS settings. Please try again.');
        }
        Error('Error updating SMS settings:', error);
      });
  };

  const handleSendMessage = () => {
    const socket = getMessagingSocket();
    const trimmedMessage = messageText.trim();
    if (!selectedUser.userId) {
      toast.error('Select a user before sending a message.');
      return;
    }
    if (!trimmedMessage) {
      toast.error('Message cannot be empty.');
      return;
    }
    if (trimmedMessage.length > 1000) {
      toast.error('Message is too long. Please keep it under 1000 characters.');
      return;
    }

    const now = Date.now();
    if (now - lastSendAtRef.current < 1500) {
      toast.error('You are sending messages too quickly. Please wait a moment.');
      return;
    }
    if (trimmedMessage === lastMessageRef.current && now - lastSendAtRef.current < 10000) {
      toast.error('Please avoid sending duplicate messages.');
      return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: 'SEND_MESSAGE',
          receiver: selectedUser.userId,
          content: trimmedMessage,
        }),
      );
      setMessageText('');
      lastSendAtRef.current = now;
      lastMessageRef.current = trimmedMessage;
    } else {
      toast.error('WebSocket is not connected. Please try again later.');
      Error('WebSocket is not connected or is in an invalid state:', socket);
    }
  };

  function getPlaceholder() {
    return window.innerWidth <= 870 ? 'Search' : 'Search Contacts...';
  }

  function getView() {
    return window.innerWidth <= 720;
  }

  useEffect(() => {
    const handleResize = () => {
      setPlaceholder(getPlaceholder());
      setMobileView(getView());
    };

    setMobileView(getView());

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContacts = () => {
    if (existingChats.length === 0) {
      return <p>No chats available.</p>;
    }

    return existingChats.map(user => (
      <div
        key={user.userId}
        className={styles.lbMessagingContact}
        role="button"
        tabIndex={0}
        onClick={() => {
          updateSelection(user);
          setMobileHamMenu(false);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            updateSelection(user);
            setMobileHamMenu(false);
          }
        }}
      >
        <img
          src={user.profilePic || '/pfp-default-header.png'}
          alt="User Profile"
          onError={e => {
            e.target.onerror = null;
            e.target.src = '/pfp-default-header.png';
          }}
        />
        <div className={styles.lbMessagingContactInfo}>
          <div className={`${styles.lbMessagingContactName} ${mobileView ? styles.black : ''}`}>
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>
    ));
  };

  const getMaskedPhone = phone => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 4) {
      return digits;
    }
    const lastFour = digits.slice(-4);
    return `••• ••• ${lastFour}`;
  };

  const maskSensitiveText = text => {
    if (!text) return '';
    return text.replace(/(\+?\d[\d\s().-]{6,}\d)/g, match => {
      const digits = match.replace(/\D/g, '');
      if (digits.length < 8) return match;
      const lastFour = digits.slice(-4);
      return `••• ••• ${lastFour}`;
    });
  };

  const renderChatMessages = () => {
    if (messagesLoading) {
      return <p className={styles.lbNoMsgText}>Loading messages...</p>;
    }

    if (messages.length === 0) {
      return <p className={styles.lbNoMsgText}>No messages to display.</p>;
    }

    const uniqueMessages = [];
    const seenKeys = new Set();
    for (const message of messages) {
      const key =
        message._id ||
        `${message.sender}-${message.receiver}-${message.timestamp}-${message.content}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueMessages.push(message);
      }
    }

    const filteredMessages = uniqueMessages.filter(
      message =>
        (message.sender === authUserId && message.receiver === selectedUser.userId) ||
        (message.sender === selectedUser.userId && message.receiver === authUserId),
    );

    if (filteredMessages.length === 0) {
      return <p className={styles.lbNoMsgText}>No messages to display.</p>;
    }

    return (
      <div className={styles.messageList}>
        <div className={styles.messageSpacer} />
        {filteredMessages.map(message => (
          <div
            key={message._id || message.timestamp}
            className={`${styles.messageItem} ${
              message.sender === authUserId ? styles.sent : styles.received
            }`}
          >
            <p className={styles.messageText}>
              {maskSensitiveText(message.content)
                .split('\n')
                .map(line => (
                  <span key={message._id + line}>
                    {line}
                    <br />
                  </span>
                ))}
            </p>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
    );
  };

  return (
    userProfilesBasicInfo.length !== 0 && (
      <div className={`main-container ${styles.mainContainer}`}>
        <Header />
        <div className={`logo-container ${styles.logoContainer}`}>
          <img src={logo} alt="One Community Logo" />
        </div>
        <div className={`content-container ${styles.contentContainer}`}>
          <div className={`container-top msg ${styles.containerTop} ${styles.msg}`}>
            {mobileView && (
              <div className={`lb-mobile-messaging-menu ${styles.lbMobileMessagingMenu}`}>
                <div className={`lb-mobile-header ${styles.lbMobileHeader}`}>
                  <button
                    type="button"
                    className="lb-ham-btn"
                    onClick={() => setMobileHamMenu(prev => !prev)}
                  >
                    ☰
                  </button>
                  {mobileHamMenu && (
                    <div
                      className={`lb-mobile-ham-menu ${styles.lbMobileContactsPanel}`}
                      ref={menuRef}
                    >
                      <div className="lb-mobile-ham-menu-header">
                        {showContacts ? (
                          <div
                            className={`lb-messaging-contacts-header-mobile ${styles.lbMessagingContactsHeaderMobile}`}
                          >
                            <input
                              type="text"
                              placeholder={placeholder}
                              className={`lb-search-input ${styles.lbSearchInput}`}
                              value={searchQuery}
                              onChange={e => {
                                const query = e.target.value;
                                setSearchQuery(query);
                                if (query.trim() !== '') {
                                  searchUserProfiles(query);
                                } else {
                                  setSearchResults([]);
                                }
                              }}
                            />
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setShowContacts(prev => !prev)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  setShowContacts(prev => !prev);
                                }
                              }}
                            >
                              <img
                                src="https://img.icons8.com/metro/26/multiply.png"
                                alt="multiply"
                                className="lb-msg-icon"
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`lb-messaging-contacts-header-mobile ${styles.lbMessagingContactsHeaderMobile}`}
                          >
                            <h3 className={`lb-contact-msgs ${styles.lbContactMsgs}`}>Messages</h3>
                            <div className="lb-messaging-search-icons-mobile">
                              <FontAwesomeIcon
                                icon={faSearch}
                                className="lb-msg-icon-mobile"
                                onClick={() => setShowContacts(prev => !prev)}
                              />
                            </div>
                          </div>
                        )}
                        <div className="lb-messaging-contacts-body active">
                          {showContacts
                            ? searchResults.map(user => (
                                <div
                                  key={user._id}
                                  className={`lb-messaging-contact ${styles.lbMessagingContact}`}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    updateSelection(user);
                                    setMobileHamMenu(false);
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      updateSelection(user);
                                      setMobileHamMenu(false);
                                    }
                                  }}
                                >
                                  <img
                                    src={user.profilePic || '/pfp-default-header.png'}
                                    alt="User Profile"
                                    onError={e => {
                                      e.target.onerror = null;
                                      e.target.src = '/pfp-default-header.png';
                                    }}
                                  />
                                  <div className="lb-messaging-contact-info">
                                    <div
                                      className={`lb-messaging-contact-name ${
                                        mobileView ? 'black' : ''
                                      }`}
                                    >
                                      {user.firstName} {user.lastName}
                                    </div>
                                  </div>
                                </div>
                              ))
                            : renderContacts()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className={`${styles.lbMessagingHeaderIcons} ${styles.lbTopBarBell}`}>
              <button
                type="button"
                className={styles.lbTopBarMenuButton}
                onClick={() => {
                  setBellDropdownActive(prev => !prev);
                }}
              >
                ☰
              </button>
              {bellDropdownActive && (
                <div
                  className={`${styles.lgMessagingBellSelectDropdown} ${
                    bellDropdownActive ? styles.activeInlgMessagingBellSelectDropdown : ''
                  }`}
                >
                  <div className={styles.lgMessagingSectionTitle}>Notification Settings</div>
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationSettings.notifyInApp || false}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setNotificationSettings(prev => ({
                          ...prev,
                          notifyInApp: isChecked,
                        }));
                      }}
                    />
                    In App
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationSettings.notifyEmail || false}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setNotificationSettings(prev => ({
                          ...prev,
                          notifyEmail: isChecked,
                        }));
                      }}
                    />
                    Email
                  </label>
                  <div className={styles.lgMessagingDivider} />
                  <div className={styles.lgMessagingSectionTitle}>SMS Notifications</div>
                  <label className={styles.lgMessagingSmsCheckbox}>
                    <input
                      type="checkbox"
                      checked={notificationSettings.notifySms}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setNotificationSettings(prev => ({
                          ...prev,
                          notifySms: isChecked,
                        }));
                      }}
                    />
                    Enable SMS notifications
                  </label>
                  <div className={styles.lgMessagingSmsField}>
                    <span className={styles.lgMessagingSmsLabel}>SMS Phone</span>
                    <input
                      type="tel"
                      placeholder={notificationSettings.smsPhoneMasked || '+11234567890'}
                      className={styles.lgMessagingSmsInput}
                      value={notificationSettings.smsPhone}
                      onChange={e => {
                        const nextValue = e.target.value;
                        setNotificationSettings(prev => ({
                          ...prev,
                          smsPhone: nextValue,
                        }));
                      }}
                    />
                    {notificationSettings.smsPhoneMasked && (
                      <span className={styles.lgMessagingSmsMask}>
                        Saved as {notificationSettings.smsPhoneMasked}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={`btn btn-secondary ${styles.lgMessagingSmsSaveButton}`}
                    onClick={saveSmsPreferences}
                  >
                    Save SMS Settings
                  </button>
                  <button
                    type="button"
                    className={`btn btn-primary ${styles.lgMessagingSubmitButton}`}
                    onClick={saveUserPreferences}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={`container-main-msg ${styles.containerMainMsg}`}>
            {/* Contacts Section */}
            {!mobileView && (
              <div className="lb-messaging-contacts">
                {showContacts ? (
                  <div
                    className={`lb-messaging-contacts-header ${styles.lbMessagingContactsHeader}`}
                  >
                    <input
                      type="text"
                      placeholder={placeholder}
                      className={`lb-search-input ${styles.lbSearchInput}`}
                      value={searchQuery}
                      onChange={e => {
                        const query = e.target.value;
                        setSearchQuery(query);
                        if (query.trim() !== '') {
                          searchUserProfiles(query);
                        } else {
                          setSearchResults([]);
                        }
                      }}
                    />
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowContacts(prev => !prev)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setShowContacts(prev => !prev);
                        }
                      }}
                    >
                      <img
                        src="https://img.icons8.com/metro/26/multiply.png"
                        alt="multiply"
                        className="lb-msg-icon"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`lb-messaging-contacts-header ${styles.lbMessagingContactsHeader}`}
                  >
                    <h3 className={`lb-contact-msgs ${styles.lbContactMsgs}`}>Messages</h3>
                    <div className="lb-messaging-search-icons">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="lb-msg-icon"
                        onClick={() => setShowContacts(prev => !prev)}
                      />
                    </div>
                  </div>
                )}
                <div className="lb-messaging-contacts-body active">
                  {showContacts
                    ? searchResults.map(user => (
                        <div
                          key={user._id}
                          className={`lb-messaging-contact ${styles.lbMessagingContact}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => updateSelection(user)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              updateSelection(user);
                            }
                          }}
                        >
                          <img
                            src={user.profilePic || '/pfp-default-header.png'}
                            alt="User Profile"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = '/pfp-default-header.png';
                            }}
                          />
                          <div className="lb-messaging-contact-info">
                            <div className="lb-messaging-contact-name">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      ))
                    : renderContacts()}
                </div>
              </div>
            )}

            {/* Chat Window Section */}
            <div className={`lb-messaging-message-window ${styles.lbMessagingMessageWindow}`}>
              <div
                className={`lb-messaging-message-window-header ${styles.lbMessagingMessageWindowHeader}`}
              >
                <div>
                  <img
                    src={selectedUser.profilePic || '/pfp-default-header.png'}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = '/pfp-default-header.png';
                    }}
                    alt="Profile"
                    className="m-1"
                  />
                  {selectedUser.firstName
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : 'Select a user to chat'}
                </div>
                {selectedUser.userId && null}
              </div>
              <div className={styles.lbMessagingMessageWindowBody}>
                {selectedUser.userId ? (
                  renderChatMessages()
                ) : (
                  <p className={styles.startMsg}>Select a user to start chatting</p>
                )}
              </div>
              <div
                className={`lb-messaing-message-window-footer ${styles.lbMessagingMessageWindowFooter}`}
              >
                <textarea
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className={`lb-messaging-textarea ${styles.lbMessagingTextarea}`}
                  disabled={!selectedUser.userId}
                />
                <FontAwesomeIcon
                  icon={faLocationArrow}
                  className={`send-button ${styles.sendButton}`}
                  onClick={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
