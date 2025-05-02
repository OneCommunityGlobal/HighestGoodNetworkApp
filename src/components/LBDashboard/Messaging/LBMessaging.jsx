import { useState } from 'react';
import './LBMessaging.css';
import logo from '../../../assets/images/logo2.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCross, faCrosshairs, faLocationArrow, faSearch, faTimes, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo, userProfilesBasicInfoFetchCompleteACtion } from 'actions/userManagement';
import { fetchUserPreferences, updateUserPreferences } from "actions/lbdashboard/userPreferenceActions";
import { useEffect } from 'react';
import React from 'react';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import { fetchExistingChats, fetchMessages, handleMessageReceived, handleMessageStatusUpdated, sendMessage, updateMessageStatus } from 'actions/lbdashboard/messagingActions';
import { initMessagingSocket, getMessagingSocket, updateChatState } from '../../../utils/messagingSocket';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

export default function LBMessaging() {
  const dispatch = useDispatch();
  const [selectedUser, updateSelectedUser] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [bellDropdownActive, setBellDropdownActive] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [selectedOption, setSelectedOption] = useState({});
  const messageEndRef = useRef(null);

  const users = useSelector((state) => state.allUserProfilesBasicInfo);
  const auth = useSelector((state) => state.auth.user);
  const messagesState = useSelector((state) => state.messages);
  const existingChats = useSelector((state) => state.messages.existingChats);
  const { messages, loading: messagesLoading } = messagesState;

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
  }, [existingChats]);


  const searchUserProfiles = async (query) => {
    try {
      const { data } = await axios.get(`${ENDPOINTS.LB_SEARCH_USERS}?query=${query}`);
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching user profiles:", error);
    }
  };

  useEffect(() => {
    if (users.userProfilesBasicInfo.length === 0) {
      dispatch(getUserProfileBasicInfo());
    }
  }, [dispatch, users.userProfilesBasicInfo, auth.userid]);

  useEffect(() => {
    const token = localStorage.getItem("token");
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
      dispatch(fetchUserPreferences(auth.userid, selectedUser.userId)).then((response) => {
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


  const updateSelection = (user) => {

    const selectedUser = {
      userId: user.userId || user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic || "/pfp-default-header.png",
    };

    updateSelectedUser(selectedUser);

    if (selectedUser.userId) {
      dispatch(fetchMessages(auth.userid, selectedUser.userId));
    } else {
      console.error("Invalid user selected:", user);
      toast.error("Invalid user selected. Please try again.");
    }
  };

  const saveUserPreferences = () => {
    dispatch(updateUserPreferences(auth.userid, selectedUser.userId, selectedOption))
      .then(() => {
        toast.success("Preferences updated successfully!");
        setBellDropdownActive(false);

        // Refresh preferences after saving
        dispatch(fetchUserPreferences(auth.userid, selectedUser.userId)).then((response) => {
          if (response && response.payload) {
            setSelectedOption({
              notifyInApp: response.payload.notifyInApp || false,
              notifyEmail: response.payload.notifyEmail || false,
            });
          }
        });
      })
      .catch((error) => {
        toast.error("Failed to update preferences. Please try again.");
        console.error("Error updating preferences:", error);
      });
  };

  const handleSendMessage = () => {
    const socket = getMessagingSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        action: 'SEND_MESSAGE',
        receiver: selectedUser.userId,
        content: messageText.trim(),
      }));
      setMessageText("");
    } else {
      toast.error("WebSocket is not connected. Please try again later.");
      console.error("WebSocket is not connected or is in an invalid state:", socket);
    }
  };

  const renderContacts = () => {
    if (existingChats.length === 0) {
      return <p>No chats available.</p>;
    }

    return existingChats.map((user) => (
      <div
        key={user.userId}
        className="lb-messaging-contact"
        onClick={() => updateSelection(user)}
      >
        <img
          src={user.profilePic || "/pfp-default-header.png"}
          alt="User Profile"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/pfp-default-header.png";
          }}
        />
        <div className="lb-messaging-contact-info">
          <div className="lb-messaging-contact-name">
            {user.firstName} {user.lastName}
          </div>
        </div>
      </div>
    ));
  };

  const renderChatMessages = () => {
    if (messagesLoading) {
      return <p>Loading messages...</p>;
    }

    if (messages.length === 0) {
      return <p>No messages to display.</p>;
    }

    const filteredMessages = messages.filter(
      (message) =>
        (message.sender === auth.userid && message.receiver === selectedUser.userId) ||
        (message.sender === selectedUser.userId && message.receiver === auth.userid)
    );

    if (filteredMessages.length === 0) {
      return <p>No messages to display.</p>;
    }

    return (
      <div className="message-list">
        <div className="message-spacer"></div>
        {filteredMessages.map((message) => (
          <div
            key={message._id || message.timestamp}
            className={`message-item ${message.sender === auth.userid ? "sent" : "received"}`}
          >
            <p className="message-text">
              {message.content.split("\n").map((line, index) => (
                <span key={index}>
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
      <div className="main-container">
        <div className="logo-container">
          <img src={logo} alt="One Community Logo" />
        </div>
        <div className="content-container">
          <div className="container-top" />
          <div className="container-main-msg">
            {/* Contacts Section */}
            <div className="lb-messaging-contacts">
              {showContacts ? (
                <div className="lb-messaging-contacts-header">
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    className="lb-search-input"
                    value={searchQuery}
                    onChange={(e) => {
                      const query = e.target.value;
                      setSearchQuery(query);
                      if (query.trim() !== "") {
                        searchUserProfiles(query);
                      } else {
                        setSearchResults([]);
                      }
                    }}
                  />
                  <div className='lb-messaging-search-icons'>
                    <img src="https://img.icons8.com/metro/26/multiply.png" alt="multiply" className='lb-msg-icon' onClick={() => setShowContacts(prev => !prev)} />
                  </div>
                </div>
              ) : (
                <div className='lb-messaging-contacts-header'>
                  <h3 className='lb-contact-msgs'>Messages</h3>
                  <div className='lb-messaging-search-icons'>
                    <FontAwesomeIcon icon={faSearch} className='lb-msg-icon' onClick={() => setShowContacts(prev => !prev)} />
                  </div>
                </div>
              )}
              <div className={`lb-messaging-contacts-body active`}>
                {showContacts ? (
                  searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="lb-messaging-contact"
                      onClick={() => updateSelection(user)}
                    >
                      <img
                        src={user.profilePic || "/pfp-default-header.png"}
                        alt="User Profile"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/pfp-default-header.png";
                        }}
                      />
                      <div className="lb-messaging-contact-info">
                        <div className="lb-messaging-contact-name">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  renderContacts()
                )}

              </div>
            </div>

            {/* Chat Window Section */}
            <div className="lb-messaging-message-window">
              <div className="lb-messaging-message-window-header">
                <div>
                  <img
                    src={selectedUser.profilePic || "/pfp-default-header.png"}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/pfp-default-header.png";
                    }}
                    alt="Profile"
                    className='m-1'
                  />
                  {selectedUser.firstName
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : "Select a user to chat"}
                </div>
                {selectedUser.userId && (
                  <div className='lb-messaging-header-icons'>
                    <FontAwesomeIcon
                      icon={faBell}
                      onClick={() => { setBellDropdownActive((prev) => !prev) }}
                      className="lg-messaging-notification-bell"
                    />
                    {bellDropdownActive && (
                      <div className={`lg-messaging-bell-select-dropdown ${bellDropdownActive ? 'active' : ''}`}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedOption.notifyInApp || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedOption((prev) => ({
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
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedOption((prev) => ({
                                ...prev,
                                notifyEmail: isChecked,
                              }));
                            }}
                          />
                          Email
                        </label>
                        <button className="btn btn-primary" onClick={saveUserPreferences}>
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
                  <p className='start-msg'>Select a user to start chatting</p>
                )}
              </div>
              <div className="lb-messaing-message-window-footer">
                <textarea
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className='lb-messaging-textarea'
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
    )
  );
}
