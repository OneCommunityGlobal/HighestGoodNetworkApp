import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import styles from './LBMessaging.module.css';
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
  const location = useLocation();
  const history = useHistory();
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
  const appliedListingSelectionRef = useRef(null);

  const users = useSelector(state => state.allUserProfilesBasicInfo);
  const wishlists = useSelector(state => state.wishlistItem?.wishlists);
  const auth = useSelector(state => state.auth.user);
  const currentUserId = auth?.userid ?? auth?.userId ?? auth?._id;
  const messagesState = useSelector(state => state.messages) ?? {};
  const existingChats = Array.isArray(messagesState.existingChats)
    ? messagesState.existingChats
    : [];
  const messages = Array.isArray(messagesState.messages) ? messagesState.messages : [];
  const messagesLoading = messagesState.loading ?? false;
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  const sidebarContacts = useMemo(() => {
    const chats = [...existingChats];
    const sid = selectedUser?.userId;
    if (!sid) return chats;
    const exists = chats.some(c => String(c.userId ?? c._id) === String(sid));
    if (!exists) {
      chats.unshift({
        userId: sid,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        profilePic: selectedUser.profilePic,
      });
    }
    return chats;
  }, [existingChats, selectedUser]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const searchUserProfiles = async query => {
    try {
      const { data } = await axios.get(`${ENDPOINTS.LB_SEARCH_USERS}?query=${query}`);
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      Error('Error searching user profiles:', error);
    }
  };

  useEffect(() => {
    if ((users?.userProfilesBasicInfo?.length ?? 0) === 0) {
      dispatch(getUserProfileBasicInfo());
    }
  }, [dispatch, users?.userProfilesBasicInfo?.length, currentUserId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    initMessagingSocket(token);

    return () => {
      const socket = getMessagingSocket();
      if (socket) {
        socket.close();
      }
    };
  }, [currentUserId]);

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
    if (currentUserId) {
      dispatch(fetchExistingChats(currentUserId));
    }
  }, [dispatch, currentUserId]);

  useEffect(() => {
    if (selectedUser.userId) {
      dispatch(fetchUserPreferences(currentUserId, selectedUser.userId)).then(response => {
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
  }, [dispatch, currentUserId, selectedUser.userId]);

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

  const updateSelection = useCallback(
    user => {
      const newSelectedUser = {
        userId: user.userId || user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic || '/pfp-default-header.png',
      };

      updateSelectedUser(newSelectedUser);

      if (newSelectedUser.userId && currentUserId) {
        dispatch(fetchMessages(currentUserId, newSelectedUser.userId));
      } else if (!newSelectedUser.userId) {
        toast.error('Invalid user selected. Please try again.');
      }
    },
    [currentUserId, dispatch],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const listingId = params.get('listingId');
    if (!listingId) {
      appliedListingSelectionRef.current = null;
      return;
    }
    if (!wishlists?.length || !currentUserId) return;

    const wishItem = wishlists.find(w => String(w.id) === String(listingId));
    const host = wishItem?.host;
    if (!host?.userId) return;

    if (appliedListingSelectionRef.current === listingId) return;
    appliedListingSelectionRef.current = listingId;

    const profiles = users?.userProfilesBasicInfo ?? [];
    const matched = profiles.find(p => String(p._id) === String(host.userId));

    updateSelection({
      userId: host.userId,
      firstName: matched?.firstName ?? host.firstName,
      lastName: matched?.lastName ?? host.lastName,
      profilePic: matched?.profilePic || host.profilePic || '/pfp-default-header.png',
    });

    params.delete('listingId');
    const nextSearch = params.toString();
    history.replace({
      pathname: location.pathname,
      search: nextSearch ? `?${nextSearch}` : '',
      hash: location.hash,
    });
  }, [
    location.search,
    location.pathname,
    location.hash,
    wishlists,
    users?.userProfilesBasicInfo,
    currentUserId,
    updateSelection,
    history,
  ]);

  useEffect(() => {
    const uid = selectedUser?.userId;
    if (!uid) return;
    const profiles = users?.userProfilesBasicInfo ?? [];
    if (!profiles.length) return;
    const matched = profiles.find(p => String(p._id) === String(uid));
    if (!matched) return;
    updateSelectedUser(prev => {
      const nextPic = matched.profilePic || prev.profilePic;
      const nextFirst = matched.firstName ?? prev.firstName;
      const nextLast = matched.lastName ?? prev.lastName;
      if (
        prev.firstName === nextFirst &&
        prev.lastName === nextLast &&
        prev.profilePic === nextPic
      ) {
        return prev;
      }
      return {
        ...prev,
        firstName: nextFirst,
        lastName: nextLast,
        profilePic: nextPic,
      };
    });
  }, [users?.userProfilesBasicInfo, selectedUser?.userId]);

  const saveUserPreferences = () => {
    dispatch(updateUserPreferences(currentUserId, selectedUser.userId, selectedOption))
      .then(() => {
        toast.success('Preferences updated successfully!');
        setBellDropdownActive(false);

        // Refresh preferences after saving
        dispatch(fetchUserPreferences(currentUserId, selectedUser.userId)).then(response => {
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
    if (sidebarContacts.length === 0) {
      return (
        <p className={styles.sidebarHint}>No contacts yet. Use the search icon to find someone.</p>
      );
    }

    return sidebarContacts.map(user => (
      <button
        key={user.userId || user._id}
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
        (message.sender === currentUserId && message.receiver === selectedUser.userId) ||
        (message.sender === selectedUser.userId && message.receiver === currentUserId),
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
              message.sender === currentUserId ? styles.sent : styles.received
            }`}
          >
            <p className={`${styles.messageText}`}>
              {String(message.content ?? '')
                .split('\n')
                .map((line, lineIdx) => (
                  <span key={`${message._id || message.timestamp}-${lineIdx}`}>
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
    (users?.userProfilesBasicInfo?.length ?? 0) !== 0 && (
      <div className={`${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.mainContainer}`}>
          <div className={`${styles.logoContainer}`}>
            <img src={logo} alt="One Community Logo" />
          </div>
          <div className={`${styles.contentContainer}`}>
            {mobileView ? (
              <div className={`${styles.containerTop} ${styles.msg}`}>
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
                                className={`${styles.lbSearchInput}`}
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
                                <img
                                  src="https://img.icons8.com/metro/26/multiply.png"
                                  alt="Close"
                                  className={`${styles.lbMsgIcon}`}
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
                            className={`${styles.lbMessagingContactsBody} ${styles.activeInlbMessagingContactsBody}`}
                          >
                            {showContacts
                              ? safeSearchResults.map(user => (
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
              </div>
            ) : null}
            <div className={`${styles.containerMainMsg}`}>
              {/* Contacts Section */}
              {!mobileView && (
                <div className={`${styles.lbMessagingContacts}`}>
                  {showContacts ? (
                    <div className={`${styles.lbMessagingContactsHeader}`}>
                      <input
                        type="text"
                        placeholder={placeholder}
                        className={`${styles.lbSearchInput}`}
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
                        <img
                          src="https://img.icons8.com/metro/26/multiply.png"
                          alt="Close"
                          className={`${styles.lbMsgIcon}`}
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
                      ? safeSearchResults.map(user => (
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
                  <div className={`${styles.lbMessagingHeaderIdentity}`}>
                    <img
                      src={selectedUser.profilePic || '/pfp-default-header.png'}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = '/pfp-default-header.png';
                      }}
                      alt="Profile"
                    />
                    <span className={`${styles.lbMessagingHeaderTitle}`}>
                      {selectedUser.firstName
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : 'Select a user to chat'}
                    </span>
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
                <div className={`${styles.lbMessagingMessageWindowBody}`}>
                  {selectedUser.userId ? (
                    renderChatMessages()
                  ) : (
                    <p className={`${styles.startMsg}`}>Select a user to start chatting</p>
                  )}
                </div>
                <div className={`${styles.lbMessaingMessageWindowFooter}`}>
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
                    className={`${styles.lbMessagingTextarea}`}
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
