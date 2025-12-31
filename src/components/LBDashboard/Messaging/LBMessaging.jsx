import { useState, useEffect, useRef } from 'react';
import styles from './LBMessaging.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faLocationArrow, faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from '~/actions/userManagement';
import {
  fetchUserPreferences,
  updateUserPreferences,
} from '~/actions/lbdashboard/userPreferenceActions';
import { toast } from 'react-toastify';
import { fetchExistingChats, fetchMessages } from '~/actions/lbdashboard/messagingActions';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  initMessagingSocket,
  getMessagingSocket,
  updateChatState,
  markMessagesAsReadViaSocket,
} from '../../../utils/messagingSocket';
import logo from '../../../assets/images/logo2.png';

export default function LBMessaging() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedUser, updateSelectedUser] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [placeholder, setPlaceholder] = useState('Search Contacts...');
  const [mobileView, setMobileView] = useState(false);
  const [mobileHamMenu, setMobileHamMenu] = useState(false);

  const [bellDropdownActive, setBellDropdownActive] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [selectedOption, setSelectedOption] = useState({});
  const messageEndRef = useRef(null);
  const menuRef = useRef(null);

  const users = useSelector(state => state.allUserProfilesBasicInfo);
  const auth = useSelector(state => state.auth.user);
  const messagesState = useSelector(state => state.messages);
  const existingChats = useSelector(state => state.messages.existingChats);
  const { messages, loading: messagesLoading } = messagesState;

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const searchUserProfiles = async query => {
    try {
      const { data } = await axios.get(`${ENDPOINTS.LB_SEARCH_USERS}?query=${query}`);
      setSearchResults(data);
    } catch (error) {
      Error('Error searching user profiles:', error);
    }
  };

  useEffect(() => {
    if (users.userProfilesBasicInfo.length === 0) {
      dispatch(getUserProfileBasicInfo());
    }
  }, [dispatch, users.userProfilesBasicInfo, auth.userid]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    initMessagingSocket(token);

    return () => {
      const socket = getMessagingSocket();
      if (socket) {
        socket.close();
      }
    };
  }, [auth.userid]);

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
    dispatch(fetchExistingChats(auth.userid));
  }, [dispatch, auth.userid]);

  useEffect(() => {
    if (selectedUser.userId) {
      dispatch(fetchUserPreferences(auth.userid, selectedUser.userId)).then(response => {
        if (response) {
          setSelectedOption({
            notifyInApp: response.notifyInApp || false,
            notifyEmail: response.notifyEmail || false,
          });
        } else {
          setSelectedOption({
            notifyInApp: false,
            notifyEmail: false,
          });
        }
      });
    } else {
      setSelectedOption({
        notifyInApp: false,
        notifyEmail: false,
      });
    }
  }, [dispatch, auth.userid, selectedUser.userId]);

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
      dispatch(fetchMessages(auth.userid, newSelectedUser.userId));
    } else {
      Error('Invalid user selected:', user);
      toast.error('Invalid user selected. Please try again.');
    }
  };

  const saveUserPreferences = () => {
    dispatch(updateUserPreferences(auth.userid, selectedUser.userId, selectedOption))
      .then(() => {
        toast.success('Preferences updated successfully!');
        setBellDropdownActive(false);

        // Refresh preferences after saving
        dispatch(fetchUserPreferences(auth.userid, selectedUser.userId)).then(response => {
          if (response && response.payload) {
            setSelectedOption({
              notifyInApp: response.payload.notifyInApp || false,
              notifyEmail: response.payload.notifyEmail || false,
            });
          }
        });
      })
      .catch(error => {
        toast.error('Failed to update preferences. Please try again.');
        Error('Error updating preferences:', error);
      });
  };

  const handleSendMessage = () => {
    const socket = getMessagingSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: 'SEND_MESSAGE',
          receiver: selectedUser.userId,
          content: messageText.trim(),
        }),
      );
      setMessageText('');
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
      <button
        key={user.userId}
        type="button"
        className={`${styles.lbMessagingContact}`}
        onClick={() => {
          updateSelection(user);
          setMobileHamMenu(false);
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
        <div className={`${styles.lbMessagingContactInfo}`}>
          <div className={`${styles.lbMessagingContactName} ${mobileView ? styles.black : ''}`}>
            {user.firstName} {user.lastName}
          </div>
        </div>
      </button>
    ));
  };

  const renderChatMessages = () => {
    if (messagesLoading) {
      return <p className={`${styles.lbNoMsgText}`}>Loading messages...</p>;
    }

    if (messages.length === 0) {
      return <p className={`${styles.lbNoMsgText}`}>No messages to display.</p>;
    }

    const filteredMessages = messages.filter(
      message =>
        (message.sender === auth.userid && message.receiver === selectedUser.userId) ||
        (message.sender === selectedUser.userId && message.receiver === auth.userid),
    );

    if (filteredMessages.length === 0) {
      return <p className={`${styles.lbNoMsgText}`}>No messages to display.</p>;
    }

    return (
      <div className={`${styles.messageList}`}>
        <div className={`${styles.messageSpacer}`} />
        {filteredMessages.map(message => (
          <div
            key={message._id || message.timestamp}
            className={`${styles.messageItem} ${
              message.sender === auth.userid ? styles.sent : styles.received
            }`}
          >
            <p className={`${styles.messageText} ${darkMode ? styles.lightBackground : ''}`}>
              {message.content.split('\n').map(line => (
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
    users.userProfilesBasicInfo.length !== 0 && (
      <div className={`${darkMode ? styles.darkMode : styles.lightMode}`}>
        <div className={`${styles.mainContainer}`}>
          <div className={`${styles.logoContainer}`}>
            <img src={logo} alt="One Community Logo" />
          </div>
          <div className={`${styles.contentContainer} ${darkMode ? styles.darkMode2 : ''}`}>
            <div className={`${styles.containerTop} ${styles.msg}`}>
              {mobileView && (
                <div className={`${styles.lbMobileMessagingMenu}`}>
                  <div className={`${styles.lbMobileHeader}`}>
                    <button
                      type="button"
                      className={`${styles.lbHamBtn}`}
                      onClick={() => setMobileHamMenu(prev => !prev)}
                    >
                      ☰
                    </button>
                    {mobileHamMenu && (
                      <div className={`${styles.lbMobileHamMenu}`} ref={menuRef}>
                        <div className={`${styles.lbMobileHamMenuHeader}`}>
                          {showContacts ? (
                            <div className={`${styles.lbMessagingContactsHeaderMobile}`}>
                              <input
                                type="text"
                                placeholder={placeholder}
                                className={`${styles.lbSearchInput} ${
                                  darkMode ? styles.lightBackground : ''
                                }`}
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
                              <button
                                type="button"
                                onClick={() => setShowContacts(prev => !prev)}
                                className={`${styles.lbMsgIconBtn}`} // you can reuse or define styles here
                              >
                                {/* Removed Image and used Font Awesome icon for DarkMode support */}
                                <FontAwesomeIcon
                                  icon={faXmark}
                                  alt="Close"
                                  className={`${styles.lbClose}`}
                                />
                              </button>
                            </div>
                          ) : (
                            <div className={`${styles.lbMessagingContactsHeaderMobile}`}>
                              <h3 className={`${styles.lbContactMsgs}`}>Messages</h3>
                              <div className={`${styles.lbMessagingSearchIconsMobile}`}>
                                <FontAwesomeIcon
                                  icon={faSearch}
                                  className={`${styles.lbMsgIconMobile}`}
                                  onClick={() => setShowContacts(prev => !prev)}
                                />
                              </div>
                            </div>
                          )}
                          <div
                            className={`${styles.lbMessagingContactsBody} ${
                              styles.activeInlbMessagingContactsBody
                            } ${darkMode ? styles.darkMode2 : ''}`}
                          >
                            {showContacts
                              ? searchResults.map(user => (
                                  <button
                                    key={user.userId}
                                    type="button"
                                    className={`${styles.lbMessagingContact}`}
                                    onClick={() => {
                                      updateSelection(user);
                                      setMobileHamMenu(false);
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
                                    <div className={`${styles.lbMessagingContactInfo}`}>
                                      <div
                                        className={`${styles.lbMessagingContactName} ${
                                          mobileView ? styles.black : ''
                                        }`}
                                      >
                                        {user.firstName} {user.lastName}
                                      </div>
                                    </div>
                                  </button>
                                ))
                              : renderContacts()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className={`${styles.containerMainMsg}`}>
              {/* Contacts Section */}
              {!mobileView && (
                <div className={`${styles.lbMessagingContacts}`}>
                  {showContacts ? (
                    <div className={`${styles.lbMessagingContactsHeader}`}>
                      <input
                        type="text"
                        placeholder={placeholder}
                        className={`${styles.lbSearchInput} ${
                          darkMode ? styles.lightBackground : ''
                        }`}
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
                      <button
                        type="button"
                        onClick={() => setShowContacts(prev => !prev)}
                        className={`${styles.lbMsgIconBtn}`} // you can reuse or define styles here
                      >
                        {/* Removed Image and used Font Awesome icon for DarkMode support */}
                        <FontAwesomeIcon
                          icon={faXmark}
                          alt="Close"
                          className={`${styles.lbClose}`}
                        />
                      </button>
                    </div>
                  ) : (
                    <div className={`${styles.lbMessagingContactsHeader}`}>
                      <h3 className={`${styles.lbContactMsgs}`}>Messages</h3>
                      <div className={`${styles.lbMessagingSearchIcons}`}>
                        <FontAwesomeIcon
                          icon={faSearch}
                          className={`${styles.lbMsgIcon}`}
                          onClick={() => setShowContacts(prev => !prev)}
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={`${styles.lbMessagingContactsBody} ${styles.activeInlbMessagingContactsBody}`}
                  >
                    {showContacts
                      ? searchResults.map(user => (
                          <button
                            key={user._id}
                            type="button"
                            className={`${styles.lbMessagingContact}`}
                            onClick={() => updateSelection(user)}
                          >
                            <img
                              src={user.profilePic || '/pfp-default-header.png'}
                              alt="User Profile"
                              onError={e => {
                                e.target.onerror = null;
                                e.target.src = '/pfp-default-header.png';
                              }}
                            />
                            <div className={`${styles.lbMessagingContactInfo}`}>
                              <div className={`${styles.lbMessagingContactName}`}>
                                {user.firstName} {user.lastName}
                              </div>
                            </div>
                          </button>
                        ))
                      : renderContacts()}
                  </div>
                </div>
              )}

              {/* Chat Window Section */}
              <div className={`${styles.lbMessagingMessageWindow}`}>
                <div className={`${styles.lbMessagingMessageWindowHeader}`}>
                  <div className={`${styles.displayItems}`}>
                    <img
                      src={selectedUser.profilePic || '/pfp-default-header.png'}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = '/pfp-default-header.png';
                      }}
                      alt="Profile"
                      className={`${styles.profile}`}
                    />
                    {selectedUser.firstName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : 'Select a user to chat'}
                  </div>
                  {selectedUser.userId && (
                    <div className={`${styles.lbMessagingHeaderIcons}`}>
                      <FontAwesomeIcon
                        icon={faBell}
                        onClick={() => {
                          setBellDropdownActive(prev => !prev);
                        }}
                        className={`${styles.lgMessagingNotificationBell}`}
                      />
                      {bellDropdownActive && (
                        <div
                          className={`${styles.lgMessagingBellSelectDropdown} ${
                            bellDropdownActive ? styles.activeInlgMessagingBellSelectDropdown : ''
                          }
                          ${darkMode ? styles.darkMode2 : ''}`}
                        >
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedOption.notifyInApp || false}
                              onChange={e => {
                                const isChecked = e.target.checked;
                                setSelectedOption(prev => ({
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
                              checked={selectedOption.notifyEmail || false}
                              onChange={e => {
                                const isChecked = e.target.checked;
                                setSelectedOption(prev => ({
                                  ...prev,
                                  notifyEmail: isChecked,
                                }));
                              }}
                            />
                            Email
                          </label>
                          <button
                            type="button"
                            //Todo: Need to fix color
                            className={`${styles.lgMessagingSaveBtn}`}
                            onClick={saveUserPreferences}
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div
                  className={`${styles.lbMessagingMessageWindowBody} ${
                    darkMode ? styles.darkMode1 : ''
                  }`}
                >
                  {selectedUser.userId ? (
                    renderChatMessages()
                  ) : (
                    <p className={`${styles.startMsg}`}>Select a user to start chatting</p>
                  )}
                </div>
                <div className={`${styles.lbMessaingMessageWindowFooter} `}>
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
                    className={`${styles.lbMessagingTextarea} ${darkMode ? styles.darkMode2 : ''}`}
                    disabled={!selectedUser.userId}
                  />
                  <FontAwesomeIcon
                    icon={faLocationArrow}
                    className={`${styles.sendButton}`}
                    onClick={handleSendMessage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
