import { useState, useEffect, useRef } from 'react';
import './LBMessaging.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faLocationArrow, faSearch } from '@fortawesome/free-solid-svg-icons';
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
        className="lb-messaging-contact"
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
        <div className="lb-messaging-contact-info">
          <div className={`lb-messaging-contact-name ${mobileView ? 'black' : ''}`}>
            {user.firstName} {user.lastName}
          </div>
        </div>
      </button>
    ));
  };

  const renderChatMessages = () => {
    if (messagesLoading) {
      return <p className="lb-no-msg-text">Loading messages...</p>;
    }

    if (messages.length === 0) {
      return <p className="lb-no-msg-text">No messages to display.</p>;
    }

    const filteredMessages = messages.filter(
      message =>
        (message.sender === auth.userid && message.receiver === selectedUser.userId) ||
        (message.sender === selectedUser.userId && message.receiver === auth.userid),
    );

    if (filteredMessages.length === 0) {
      return <p className="lb-no-msg-text">No messages to display.</p>;
    }

    return (
      <div className="message-list">
        <div className="message-spacer" />
        {filteredMessages.map(message => (
          <div
            key={message._id || message.timestamp}
            className={`message-item ${message.sender === auth.userid ? 'sent' : 'received'}`}
          >
            <p className="message-text">
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
    <div className="main-container">
      <div className="logo-container">
        <img src={logo} alt="One Community Logo" />
      </div>
      <div className="content-container">
        <div className="container-top msg">
          {mobileView && (
            <div className="lb-mobile-messaging-menu">
              <div className="lb-mobile-header">
                <button
                  type="button"
                  className="lb-ham-btn"
                  onClick={() => setMobileHamMenu(prev => !prev)}
                >
                  ☰
                </button>
                {mobileHamMenu && (
                  <div className="lb-mobile-ham-menu" ref={menuRef}>
                    <div className="lb-mobile-ham-menu-header">
                      {showContacts ? (
                        <div className="lb-messaging-contacts-header-mobile">
                          <input
                            type="text"
                            placeholder={placeholder}
                            className="lb-search-input"
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
                            className="lb-msg-icon-btn" // you can reuse or define styles here
                          >
                            <img
                              src="https://img.icons8.com/metro/26/multiply.png"
                              alt="Close"
                              className="lb-msg-icon"
                            />
                          </button>
                        </div>
                      ) : (
                        <div className="lb-messaging-contacts-header-mobile">
                          <h3 className="lb-contact-msgs">Messages</h3>
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
                              <button
                                key={user.userId}
                                type="button"
                                className="lb-messaging-contact"
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
                                <div className="lb-messaging-contact-info">
                                  <div
                                    className={`lb-messaging-contact-name ${
                                      mobileView ? 'black' : ''
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
        <div className="container-main-msg">
          {/* Contacts Section */}
          {!mobileView && (
            <div className="lb-messaging-contacts">
              {showContacts ? (
                <div className="lb-messaging-contacts-header">
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="lb-search-input"
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
                    className="lb-msg-icon-btn" // you can reuse or define styles here
                  >
                    <img
                      src="https://img.icons8.com/metro/26/multiply.png"
                      alt="Close"
                      className="lb-msg-icon"
                    />
                  </button>
                </div>
              ) : (
                <div className="lb-messaging-contacts-header">
                  <h3 className="lb-contact-msgs">Messages</h3>
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
                      <button
                        key={user._id}
                        type="button"
                        className="lb-messaging-contact"
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
                        <div className="lb-messaging-contact-info">
                          <div className="lb-messaging-contact-name">
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
          <div className="lb-messaging-message-window">
            <div className="lb-messaging-message-window-header">
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
              {selectedUser.userId && (
                <div className="lb-messaging-header-icons">
                  <FontAwesomeIcon
                    icon={faBell}
                    onClick={() => {
                      setBellDropdownActive(prev => !prev);
                    }}
                    className="lg-messaging-notification-bell"
                  />
                  {bellDropdownActive && (
                    <div
                      className={`lg-messaging-bell-select-dropdown ${
                        bellDropdownActive ? 'active' : ''
                      }`}
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
                        className="btn btn-primary"
                        onClick={saveUserPreferences}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="lb-messaging-message-window-body">
              {selectedUser.userId ? (
                renderChatMessages()
              ) : (
                <p className="start-msg">Select a user to start chatting</p>
              )}
            </div>
            <div className="lb-messaing-message-window-footer">
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
                className="lb-messaging-textarea"
                disabled={!selectedUser.userId}
              />
              <FontAwesomeIcon
                icon={faLocationArrow}
                className="send-button"
                onClick={handleSendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
