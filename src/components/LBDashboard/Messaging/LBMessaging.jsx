import { useState } from 'react';
import './LBMessaging.css';
import { useLocation } from 'react-router-dom';
import logo from '../../../assets/images/logo2.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCross, faCrosshairs, faLocationArrow, faSearch, faTimes, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from 'actions/userManagement';
import { fetchUserPreferences, updateUserPreferences } from "actions/lbdashboard/userPreferenceActions";
import { useEffect } from 'react';
import React from 'react';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import { fetchMessages, sendMessage, updateMessageStatus } from 'actions/lbdashboard/messagingActions';
import { initMessagingSocket, getMessagingSocket } from '../../../utils/socket';

export default function LBMessaging() {
  const dispatch = useDispatch();
  const [selectedUser, updateSelectedUser] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [bellDropdownActive, setBellDropdownActive] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [selectedOption, setSelectedOption] = useState({});
  const messageEndRef = useRef(null);

  const users = useSelector((state) => state.allUserProfilesBasicInfo);
  const auth = useSelector((state) => state.auth.user);
  const messagesState = useSelector((state) => state.messages);
  const { messages, loading: messagesLoading } = messagesState;

  const location = useLocation();

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    // Fetch user profiles and preferences on component mount
    if (users.userProfilesBasicInfo.length === 0) {
      dispatch(getUserProfileBasicInfo());
    }

    // Fetch user preferences
    dispatch(fetchUserPreferences(auth.userid)).then((response) => {
      if (response && response.payload) {
        setSelectedOption({
          notifyInApp: response.payload.notifyInApp,
          notifySMS: response.payload.notifySMS,
          notifyEmail: response.payload.notifyEmail,
        });
      }
    });
  }, [dispatch, users.userProfilesBasicInfo, auth.userid]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve the token from local storage
    if (token) {
      initMessagingSocket(token); // Initialize the Socket.IO connection
    } else {
      console.error("❌ No token available for Socket.IO connection");
    }
  }, [auth.userid]);

  const updateSelection = (user) => {
    updateSelectedUser(user);

    // Fetch messages between the logged-in user and the selected user
    dispatch(fetchMessages(auth.userid, user._id));
  };

  const saveUserPreferences = () => {
    dispatch(updateUserPreferences(auth.userid, selectedOption))
      .then(() => {
        toast.success("Preferences updated successfully!");
        setBellDropdownActive(false);
      })
      .catch((error) => {
        toast.error("Failed to update preferences. Please try again.");
        console.error("Error updating preferences:", error);
      });
  };

  // const handleViewMessage = (messageId) => {
  //   dispatch(updateMessageStatus(messageId, true)); // Update the status to "read"
  // };

  const handleSendMessage = () => {
    const socket = getMessagingSocket();
    if (socket && socket.connected) {
      const messageData = {
        receiver: selectedUser._id,
        content: messageText,
      };
      socket.emit("SEND_MESSAGE", messageData); // Emit the message
      setMessageText("");
    } else {
      console.error("Messaging Socket.IO is not connected. Message not sent.");
      toast.error("Unable to send message. Socket.IO connection is not open.");
    }
  };


// useEffect(() => {
//   const params = new URLSearchParams(location.search);
//   const chatId = params.get('chat');

//   if (chatId && users.userProfilesBasicInfo.length > 0) {
//     const matchedUser = users.userProfilesBasicInfo.find(u => u._id?.toString() === chatId);
//     if (matchedUser) {
//       matchedUser.id = matchedUser._id;
//       updateSelectedUser(matchedUser);
//     }
//   }
// }, [location.search, users.userProfilesBasicInfo]);


// useEffect(() => {
//   if (users.userProfilesBasicInfo.length === 0) {
//     dispatch(getUserProfileBasicInfo());
//   }
// }, [dispatch, users.userProfilesBasicInfo]);

const renderChatMessages = () => {
  if (messagesLoading) {
    return <p>Loading messages...</p>;
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`message-item ${message.sender === auth.userid ? "sent" : "received"}`}
        >
          <p className='message-text'>{message.content}</p>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            <div className={`lb-messaging-contacts-body ${showContacts ? 'active' : ''}`}>
              {users.userProfilesBasicInfo
                .filter((user) =>
                  `${user.firstName} ${user.lastName}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((user) => (
                  <div
                    key={user._id}
                    className="lb-messaging-contact"
                    onClick={() => updateSelection(user)}
                  >
                    <img
                      src={user.profilePic || "/pfp-default-header.png"}
                      alt="User Profile"
                    />
                    <div className="lb-messaging-contact-info">
                      <div className="lb-messaging-contact-name">
                        {user.firstName} {user.lastName}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Chat Window Section */}
          <div className="lb-messaging-message-window">
            <div className="lb-messaging-message-window-header">
              <div>
                <img
                  src={"/pfp-default-header.png"}
                  alt="Profile"
                />
                {selectedUser.firstName
                  ? `${selectedUser.firstName} ${selectedUser.lastName}`
                  : "Select a user to chat"}
              </div>
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
                          const isChecked = e.target.checked; // Capture the value before async operations
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
                        checked={selectedOption.notifySMS || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked; // Capture the value before async operations
                          setSelectedOption((prev) => ({
                            ...prev,
                            notifySMS: isChecked,
                          }));
                        }}
                      />
                      SMS
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedOption.notifyEmail || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked; // Capture the value before async operations
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
            </div>
            <div className="lb-messaging-message-window-body">
              {selectedUser._id ? (
                renderChatMessages()
              ) : (
                <p>Select a user to start chatting</p>
              )}
            </div>
            <div className="lb-messaing-message-window-footer">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={!selectedUser._id}
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
