import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useCallback,
  useMemo,
} from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import styles from './LBMessaging.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faLocationArrow, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
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
import PropTypes from 'prop-types';

const Image = React.memo(function Image({ profilePic }) {
  return (
    <img
      src={profilePic || '/pfp-default-header.png'}
      alt="User Profile"
      className={`${styles.profile}`}
      onError={e => {
        e.target.onerror = null;
        e.target.src = '/pfp-default-header.png';
      }}
    />
  );
});

const ContactInfo = React.memo(function ContactInfo({ user }) {
  return (
    <div className={`${styles.lbMessagingContactInfo}`}>
      <div className={`${styles.lbMessagingContactName}`}>
        {user.firstName} {user.lastName}
      </div>
    </div>
  );
});

const Chat = React.memo(function Chat({ user, onSelect, mobileView, setMobileHamMenu }) {
  return (
    <button
      type="button"
      className={`${styles.lbMessagingContact}`}
      onClick={() => {
        onSelect(user);
        if (mobileView) setMobileHamMenu(false);
      }}
    >
      <Image profilePic={user.profilePic} />
      <ContactInfo user={user} />
    </button>
  );
});

const SearchInput = ({
  placeholder,
  darkMode,
  styles,
  searchQuery,
  setSearchQuery,
  setShowContacts,
  setSearchResults,
}) => (
  <>
    <input
      type="text"
      placeholder={placeholder}
      className={`${styles.lbSearchInput} ${darkMode ? styles.lightBackground : ''}`}
      value={searchQuery}
      onChange={e => setSearchQuery(e.target.value)}
    />
    <button
      type="button"
      onClick={() => {
        setShowContacts(false);
        setSearchQuery('');
        setSearchResults([]);
      }}
      className={styles.lbMsgIconBtn}
    >
      ✕
    </button>
  </>
);
import Header from '../../Header/Header';

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
  const messageListRef = useRef(null);
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
    if (!sid || !selectedUser?.firstName) return chats;
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
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const searchUserProfiles = async query => {
    try {
      const { data } = await axios.get(`${ENDPOINTS.LB_SEARCH_USERS}?query=${query}`);
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching user profiles:', error);
    }
  };

  useEffect(() => {
    if (!users?.userProfilesBasicInfo?.length) {
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
          setSelectedOption(defaultPreferences);
        }
      });
    } else {
      setSelectedOption(defaultPreferences);
    }
  }, [dispatch, currentUserId, selectedUser.userId]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileHamMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUserProfiles(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSelectUser = useCallback(
    user => {
      updateSelection(user);
      if (mobileView) setMobileHamMenu(false);
    },
    [mobileView],
  );

  const searchUserProfiles = async query => {
    const requestId = ++latestRequestRef.current;
    try {
      const { data } = await axios.get(`${ENDPOINTS.LB_SEARCH_USERS}?query=${query}`);
      if (requestId === latestRequestRef.current) {
        setSearchResults(data);
      }
    } catch (error) {
      toast.error('Error searching user profiles:', error);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUserProfiles(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSelectUser = useCallback(
    user => {
      updateSelection(user);
      if (mobileView) setMobileHamMenu(false);
    },
    [mobileView],
  );

  const searchUserProfiles = async query => {
    const requestId = ++latestRequestRef.current;
    try {
      const { data } = await axios.get(`${ENDPOINTS.LB_SEARCH_USERS}?query=${query}`);
      if (requestId === latestRequestRef.current) {
        setSearchResults(data);
      }
    } catch (error) {
      toast.error('Error searching user profiles:', error);
    }
  };

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

        dispatch(fetchUserPreferences(currentUserId, selectedUser.userId)).then(response => {
          if (response?.payload) {
            setSelectedOption({
              notifyInApp: response.payload.notifyInApp ?? false,
              notifyEmail: response.payload.notifyEmail ?? false,
            });
          }
        });
      })
      .catch(error => {
        toast.error('Failed to update preferences. Please try again.');
      });
  };

  const handleSendMessage = () => {
    const socket = getMessagingSocket();
    if (!messageText.trim()) return;
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

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContacts = () => {
    if (existingChats?.length === 0) {
      return <p>No chats available.</p>;
    }
    return existingChats.map(user => (
      <Chat
        key={user.userid}
        user={user}
        onSelect={handleSelectUser}
        mobileView={mobileView}
        setMobileHamMenu={setMobileHamMenu}
      />
    ));
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(
      message =>
        (message.sender === auth.userid && message.receiver === selectedUser.userId) ||
        (message.sender === selectedUser.userId && message.receiver === auth.userid),
    );
  }, [messages, auth.userid, selectedUser.userId]);

  const renderChatMessages = () => {
    if (messagesLoading) {
      return <p className={styles.lbNoMsgText}>Loading messages...</p>;
    }

    if (messages.length === 0) {
      return <p className={styles.lbNoMsgText}>No messages to display.</p>;
    }

    const filteredMessages = messages.filter(
      message =>
        (message.sender === currentUserId && message.receiver === selectedUser.userId) ||
        (message.sender === selectedUser.userId && message.receiver === currentUserId),
    );

    if (filteredMessages.length === 0) {
      return <p className={styles.lbNoMsgText}>No messages to display.</p>;
    }

    return (
      <div className={styles.messageList} ref={messageListRef}>
        <div className={styles.messageSpacer} />
        {filteredMessages.map(message => (
          <div
            key={message._id || message.timestamp}
            className={`${styles.messageItem} ${
              message.sender === currentUserId ? styles.sent : styles.received
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
      </div>
    );
  };

  return (
    users.userProfilesBasicInfo.length !== 0 && (
      <div className={`${darkMode ? styles.darkMode : styles.lightMode}`}>
        <div className={`${styles.mainContainer}`}>
          <div className={`${styles.logoContainer} ${darkMode ? styles.noBg : ''}`}>
            <img src={logo} alt="One Community Logo" />
          </div>
          <div className={`${styles.contentContainer} ${darkMode ? styles.darkMode2 : ''}`}>
            <div className={`${styles.containerTop} ${styles.msg}`}>
              {/* Mobile View */}
              {mobileView && (
                <div className={`${styles.lbMobileMessagingMenu}`}>
                  {/* Mobile Header */}
                  <div className={`${styles.lbMobileHeader}`}>
                    <button
                      type="button"
                      className={styles.lbHamBtn}
                      onClick={() => setMobileHamMenu(prev => !prev)}
                    >
                      ☰
                    </button>
                    {/* if showContacts is true, enable search option 
                    in mobile view else Just display Message header and search icon */}
                    {mobileHamMenu && (
                      <div className={styles.lbMobileHamMenu} ref={menuRef}>
                        <div className={styles.lbMobileHamMenuHeader}>
                          <div className={styles.lbMobilePanelTopBar}>
                            <button
                              type="button"
                              className={styles.lbMobileCloseBtn}
                              onClick={() => setMobileHamMenu(false)}
                            >
                              ✕
                            </button>
                          </div>
                          {showContacts ? (
                            <div className={`${styles.lbMessagingContactsHeaderMobile}`}>
                              <SearchInput
                                placeholder={placeholder}
                                darkMode={darkMode}
                                styles={styles}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                setShowContacts={setShowContacts}
                                setSearchResults={setSearchResults}
                              />
                            </div>
                          ) : (
                            <div className={styles.lbMessagingContactsHeaderMobile}>
                              <h3 className={styles.lbContactMsgs}>Messages</h3>
                              <div className={styles.lbMessagingSearchIconsMobile}>
                                <FontAwesomeIcon
                                  icon={faSearch}
                                  className={styles.lbMsgIconMobile}
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
                            {/*if showContacts is enabled, Display names of the user found through search
                            else display existing contacts through RenderContacts functionality */}
                            {showContacts
                              ? searchResults.map(user => (
                                  <Chat
                                    key={user.userid}
                                    user={user}
                                    onSelect={handleSelectUser}
                                    mobileView={mobileView}
                                    setMobileHamMenu={setMobileHamMenu}
                                  />
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
              {/* Desktop version --- Contacts Section(Left Panel) */}
              {!mobileView && (
                <div className={styles.lbMessagingContacts}>
                  {showContacts ? (
                    <div className={`${styles.lbMessagingContactsHeader}`}>
                      <SearchInput
                        placeholder={placeholder}
                        darkMode={darkMode}
                        styles={styles}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        setShowContacts={setShowContacts}
                        setSearchResults={setSearchResults}
                      />
                    </div>
                  ) : (
                    <div className={styles.lbMessagingContactsHeader}>
                      <h3 className={styles.lbContactMsgs}>Messages</h3>
                      <div className={styles.lbMessagingSearchIcons}>
                        <FontAwesomeIcon
                          icon={faSearch}
                          className={styles.lbMsgIcon}
                          onClick={() => setShowContacts(prev => !prev)}
                        />
                      </div>
                    </div>
                  )}
                  {/* if showcontacts is true, means serach bar is active - display search results
                  else show existing contacts through renderContacts functionality */}
                  <div
                    className={`${styles.lbMessagingContactsBody} ${styles.activeInlbMessagingContactsBody}`}
                  >
                    {showContacts
                      ? searchResults.map(user => (
                          <Chat
                            key={user.userid}
                            user={user}
                            onSelect={handleSelectUser}
                            mobileView={mobileView}
                            setMobileHamMenu={setMobileHamMenu}
                          />
                        ))
                      : renderContacts()}
                  </div>
                </div>
              )}

              {/* Chat Window Section--- This is common for both mobile and desktop users */}
              <div className={`${styles.lbMessagingMessageWindow}`}>
                <div className={`${styles.lbMessagingMessageWindowHeader}`}>
                  <div className={`${styles.displayItems}`}>
                    <Image profilePic={selectedUser.profilePic} />
                    {selectedUser.firstName
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : 'Select a user to chat'}
                  </div>
                  {selectedUser.userId && (
                    <div className={styles.lbMessagingHeaderIcons}>
                      <FontAwesomeIcon
                        icon={faBell}
                        onClick={() => {
                          setBellDropdownActive(prev => !prev);
                        }}
                        className={styles.lgMessagingNotificationBell}
                      />
                      {/*  Dropdown menu when bell icon is clicked- two options with save button */}
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

                {/* Body of the Chat section, 
                if user is selected show chat history else show show start messaging */}
                <div
                  className={`${styles.lbMessagingMessageWindowBody} ${
                    darkMode ? styles.darkMode1 : ''
                  }`}
                >
                  {selectedUser.userId ? (
                    renderChatMessages()
                  ) : (
                    <p className={styles.startMsg}>Select a user to start chatting</p>
                  )}
                </div>
                {/* Footer Send message section */}
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
                  <button
                    className={`${styles.sendButton}`}
                    onClick={() => {
                      if (messageText.trim()) handleSendMessage();
                    }}
                  >
                    <FontAwesomeIcon icon={faLocationArrow} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
Image.propTypes = {
  profilePic: PropTypes.string,
};
ContactInfo.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }),
};
Chat.propTypes = {
  user: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  mobileView: PropTypes.bool,
  setMobileHamMenu: PropTypes.func,
};
