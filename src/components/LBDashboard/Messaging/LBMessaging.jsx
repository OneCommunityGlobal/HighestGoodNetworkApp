import { useState } from 'react';
import './LBMessaging.css';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from 'actions/userManagement';
import { useEffect } from 'react';
import { fetchMessages } from 'actions/lbdashboard/messagingActions';
import {
  getUserPreferences,
  updateUserPreferences,
} from 'actions/lbdashboard/userPreferenceActions';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { useRef } from 'react';
import { toast } from 'react-toastify';
import { initSocket, getSocket } from '../../../utils/socket';
import config from '../../../config.json';
import { sendINAppNotification,sendEmailNotification, sendSMSNotification } from './NotificationFunctions.js';


export default function LBMessaging() {
  const dispatch = useDispatch();
  const [selectedUser, updateSelectedUser] = useState({});
  const [selectContact, updateSelectContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const users = useSelector(state => state.allUserProfilesBasicInfo);
  const auth = useSelector(state => state.auth.user);
  const darkMode = useSelector(state => state.theme.darkMode);
  const userPreferences = useSelector(state => state.lbuserpreferences);
  // console.log(users)
  const location = useLocation();
  const [bellDropdownActive, setBellDropdownActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState(userPreferences);
  const contactIcon = `lb-messaging-contact-icon${selectContact ? '-select' : ''}${
    darkMode ? '-dark' : ''
  }`;
  const [isFetching, setIsFetching] = useState(false);
  const messagesState = useSelector(state => state.lbmessaging);
  const { messages } = messagesState;
  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const browserNotificationPermission = () => {
    Notification.requestPermission();
  };

  const saveUserPreferences = () => {
    dispatch(updateUserPreferences(selectedOption.user, selectedOption));
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
    if (!auth?.userid) return;
  
    let timeoutId = null;
    let isSubscribed = true; // For cleanup
  
    const fetchMessagesAndSchedule = async () => {
      if (!isSubscribed || isFetching) return;
  
      try {
        setIsFetching(true);
         dispatch(fetchMessages(auth.userid));
        
        // Schedule next fetch only if component is still mounted
        if (isSubscribed) {
          timeoutId = setTimeout(fetchMessagesAndSchedule, 30000);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        if (isSubscribed) {
          setIsFetching(false);
        }
      }
    };
  
    // Initial fetch
    fetchMessagesAndSchedule();
  
    // Cleanup
    return () => {
      isSubscribed = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [auth?.userid, dispatch, isFetching]);
  const markMessagesAsRead = (messages, selectedUserId) => {
    const socket = getSocket();
    if (!socket || socket.readyState !== 1) return;
    
    const unreadMessages = messages.filter(msg => {
      const senderId = typeof msg.sender === 'object' ? 
        msg.sender._id?.toString() : 
        msg.sender?.toString();
      return senderId === selectedUserId && !msg.isRead;
    });
  
    if (unreadMessages.length > 0) {
      socket.send(JSON.stringify({
        action: 'MESSAGES_READ',
        messageIds: unreadMessages.map(msg => msg._id),
        sender: selectedUserId,
        receiver: auth.userid
      }));
    }
  };

  // Add this after your other useEffects
useEffect(() => {
  if (selectedUser.id && messages.length > 0) {
    const conversationMessages = getMessagesBetweenUsers(messages, auth.userid, selectedUser.id);
    markMessagesAsRead(conversationMessages, selectedUser.id);
  }
}, [selectedUser.id, messages]);

  useEffect(() => {
    const { tokenKey } = config;
    const token = localStorage.getItem(tokenKey); // your login JWT
    const socket = initSocket(token);

    socket.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.action === 'RECEIVE_MESSAGE') {
        const senderId = data.payload.sender?.toString();
        const senderUser = users.userProfilesBasicInfo.filter(e => e._id.toString() === senderId);
        if (
          senderUser &&
          senderUser.length === 1 &&
          auth.userid.toString() === data.payload.receiver.toString()
        ) {
          if(userPreferences.notifyInApp === true){
            sendINAppNotification(data,userPreferences,senderUser)
          }else if(userPreferences.notifyEmail === true){
            sendEmailNotification(data,users, userPreferences,senderUser)
          }else if(userPreferences.notifySMS === true){
            sendSMSNotification(data,users,userPreferences,senderUser)
          } 
        }
        dispatch({ type: 'SEND_MESSAGE_END', payload: data.payload });
      }else if (data.action === 'MESSAGE_READ') {
        dispatch({ 
          type: 'UPDATE_MESSAGES_READ_STATUS', 
          payload: {
            messageIds: data.messageIds,
          }
        });
      }else if(data.action === 'SEND_MESSAGE_FAILED'){
        dispatch({ 
          type: 'SEND_MESSAGE_FAILED',
          payload: {
            content: message,
            sender: auth.userid,
            receiver: selectedUser.id,
            timestamp: new Date(),
            status: 'failed'
          }
        });
      }
    };
    socket.onclose = () => {
      dispatch(fetchMessages(auth.userid)); // fallback
      scrollToBottom();
    };
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (users.userProfilesBasicInfo.length === 0) {
      dispatch(getUserProfileBasicInfo());
    }
  }, [dispatch, users.userProfilesBasicInfo]);

  useEffect(() => {
    if (auth && auth.userid && messages.length === 0) {
      dispatch(fetchMessages(auth.userid));
    }
    dispatch(getUserPreferences(auth.userid));
  }, [dispatch, auth.userid]);

  const updateSelection = user => {
    updateSelectedUser(user);
  };

  const toggleContacts = () => {
    const contacts = darkMode
      ? document.querySelector('.lb-messaging-contacts-dark')
      : document.querySelector('.lb-messaging-contacts');
    if (contacts.style.display === 'block') {
      contacts.style.display = 'none';
    } else {
      contacts.style.display = 'block';
    }
  };

  const getUniqueUsersFromMessages = (message, loggedInUserId) => {
    const uniqueUsersMap = new Map();
    const userMessages = new Map();
    // console.log('Message:', message);
    // First pass: collect all messages for each user
    message.forEach(msg => {
      [msg.sender, msg.receiver].forEach(user => {
        if (user && user._id && user._id.toString() !== loggedInUserId) {
          const userId = user._id.toString();
          if (!userMessages.has(userId)) {
            userMessages.set(userId, []);
          }
          userMessages.get(userId).push({
            content: msg.content,
            timestamp: msg.timestamp,
            isFromOther: msg.sender._id.toString() !== loggedInUserId,
            isUnread: msg.sender._id.toString() !== loggedInUserId && !msg.isRead // Check if message is unread
          });
        }
      });
    });
  
    // Second pass: create user objects with last message
    message.forEach(msg => {
      [msg.sender, msg.receiver].forEach(user => {
        if (
          user &&
          user._id &&
          user._id.toString() !== loggedInUserId &&
          !uniqueUsersMap.has(user._id.toString())
        ) {
          const userId = user._id.toString();
          const messages = userMessages.get(userId);
          const lastMessage = messages.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          )[0];
  
          // Count unread messages from this user
          const unreadCount = messages.filter(msg => msg.isUnread).length;
          uniqueUsersMap.set(userId, {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email,
            lastMessage: lastMessage?.content || '',
            lastMessageTime: lastMessage?.timestamp || null,
            isFromOther: lastMessage?.isFromOther || false,
            hasUnreadMessages: unreadCount > 0,
            unreadCount // Add count of unread messages
          });
        }
      });
    });
    
    return Array.from(uniqueUsersMap.values());
  };

  const getMessagesBetweenUsers = (message, loggedInUserId, selectedUserId) => {
    return message.filter(msg => {
      const senderId = msg.sender?._id?.toString?.() || msg.sender?.toString?.();
      const receiverId = msg.receiver?._id?.toString?.() || msg.receiver?.toString?.();

      return (
        (senderId === loggedInUserId && receiverId === selectedUserId) ||
        (senderId === selectedUserId && receiverId === loggedInUserId)
      );
    });
  };

  const formatTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const formatDateLabel = timestamp => {
    const today = new Date();
    const date = new Date(timestamp);
    const isToday = today.toDateString() === date.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = yesterday.toDateString() === date.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const sendMessageData = () => {
    const footer = document.getElementsByClassName('lb-messaing-message-window-footer')[0];
    // Now get the input inside that footer
    const input = footer.getElementsByTagName('input')[0]; // or use querySelector('input')
    const message = input.value.trim();
    if (selectedUser.id && auth.userid && message) {
      const socket = getSocket();
      if (!socket || socket.readyState !== 1) {
        dispatch({ 
          type: 'SEND_MESSAGE_FAILED', 
          payload: {
            content: message,
            sender: auth.userid,
            receiver: selectedUser.id,
            timestamp: new Date(),
            status: 'failed'
          }
        });
        return;
      }
      try {
        const tempMessageId = Date.now().toString(); // Define tempMessageId here
        const messageData = {
          action: 'SEND_MESSAGE',
          receiver: selectedUser.id,
          content: message,
          messageId: tempMessageId, // Temporary ID to track this message
        };
        socket.send(JSON.stringify(messageData));
        input.value = '';
       // Add to Redux with pending status
      dispatch({
        type: 'SEND_MESSAGE_PENDING',
        payload: {
          _id: tempMessageId,
          content: message,
          sender: auth.userid,
          receiver: selectedUser.id,
          timestamp: new Date(),
          status: 'pending'
        }
      });
  
      } catch (error) {
        dispatch({ 
          type: 'SEND_MESSAGE_FAILED',
          payload: {
            content: message,
            sender: auth.userid,
            receiver: selectedUser.id,
            timestamp: new Date(),
            status: 'failed'
          }
        });
      }}
  };

  const getReceiptStatus = (msg, isSender) => {
    if (!isSender) return null;
  const readTicks = "✓\u200B✓";
  const deliveredTicks = "✓\u200B✓";
  const singleTick = "✓";
  const failedIcon = "!"; // Exclamation mark for failed messages
  
  if (msg.status === 'failed') return failedIcon;
  if (msg.isRead) return readTicks;
  if (msg.status === 'delivered') return deliveredTicks;
  return singleTick;
  };

  const renderChatMessages = (conversation, loggedInUserId) => {
    let lastDate = null;
    return (
      <div className="message-list">
        {conversation.map(msg => {
          const isSender = msg.sender._id === loggedInUserId || msg.sender === loggedInUserId;
          const msgDate = new Date(msg.timestamp).toDateString();
          const showDateLabel = msgDate !== lastDate;
          lastDate = msgDate;

          return (
            <React.Fragment key={msg._id}>
              {showDateLabel && (
                <div className="date-divider">{formatDateLabel(msg.timestamp)}</div>
              )}
              <div className={`chat-bubble ${isSender ? 'sent' : 'received'}`}>
                <div className="chat-content">{msg.content}</div>
                <div className="chat-meta">
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  {isSender &&
                  //  <span className="status">{msg.status === 'read' ? '✔✔' : '✔'}</span>
                  <span className={`messaging-message-status ${msg.isRead ? 'read' : ''}`}>
                    {getReceiptStatus(msg, isSender)}
                  </span>
                  }
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messageEndRef} />
      </div>
    );
  };

  return users.userProfilesBasicInfo.length !== 0 && messages.length !== 0  ?  (
    <div className={darkMode ? 'lb-messaging-container-dark' : 'lb-messaging-container'}>
      <div className="lb-messaging-header">
        <img src="/big-sign.png" alt="onecommunity-logo" />
      </div>
      <div className={darkMode ? 'lb-messaging-body-dark' : 'lb-messaging-body'}>
        <div className={darkMode ? 'lb-messaging-navbar-dark' : 'lb-messaging-navbar'}>
          <div
            className={darkMode ? 'hamburger-icon-dark' : 'hamburger-icon'}
            onClick={toggleContacts}
            title="Chats"
          >
            ☰
          </div>
        </div>
        <div className={darkMode ? 'lb-messaging-content-dark' : 'lb-messaging-content'}>
          <div className={darkMode ? 'lb-messaging-contacts-dark' : 'lb-messaging-contacts'}>
            <div
              className={
                darkMode ? 'lb-messaging-contacts-header-dark' : 'lb-messaging-contacts-header'
              }
            >
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
                className={darkMode ? 'contacts-close-button-dark' : 'contacts-close-button'}
                onClick={toggleContacts}
                title="Close"
              />
            </div>
            <div
              className={
                darkMode ? 'lb-messaging-contacts-body-dark' : 'lb-messaging-contacts-body'
              }
            >
              {!selectContact
                ? getUniqueUsersFromMessages(messages, auth.userid)
                    .filter(user =>
                      `${user.firstName} ${user.lastName}`
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    )
                    .map(message => (
                      <div
                        key={`${message.lastName}-${message._id}`}
                        className={darkMode ? 'lb-messaging-contact-dark' : 'lb-messaging-contact'}
                        onClick={() => updateSelection(message)}
                        title="Click to view Conversation"
                      >
                        <img
                          src={message.profilePic ? message.profilePic : '/pfp-default-header.png'}
                          alt="onecommunity-logo"
                        />
                        <div
                          className={
                            darkMode
                              ? 'lb-messaging-contact-info-dark'
                              : 'lb-messaging-contact-info'
                          }
                        >
                          <div
                            className={
                              darkMode
                                ? 'lb-messaging-contact-name-dark'
                                : 'lb-messaging-contact-name'
                            }
                          >{`${message.firstName} ${message.lastName}`}</div>
                         <div className='lb-messaging-contact-preview'>
                            <div className="preview-wrapper">
                              {message.isFromOther ? (
                                message.lastMessage
                              ) : (
                                // Logged in user's last message
                                <div className="sent-message-preview">
                                  <span>You: {message.lastMessage}</span>
                                  <span className={`preview-status ${message.isRead ? 'read' : ''}`}>
                                    {getReceiptStatus(message, true)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="preview-indicators">
                              {message.isFromOther && message.hasUnreadMessages && (
                                <span className="message-counter">{message.unreadCount}</span>
                              )}
                            </div>
                        </div>
                        </div>
                      </div>
                    ))
                : users.userProfilesBasicInfo
                    .filter(user =>
                      `${user.firstName} ${user.lastName}`
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                    )
                    .map(message => (
                      <div
                        key={`${message.firstName}-${message._id}`}
                        className={darkMode ? 'lb-messaging-contact-dark' : 'lb-messaging-contact'}
                        onClick={() => updateSelection(message)}
                        title={`Click to Chat with ${message.firstName}`}
                      >
                        <img
                          src={message.profilePic ? message.profilePic : '/pfp-default-header.png'}
                          alt="onecommunity-logo"
                        />
                        <div
                          className={
                            darkMode
                              ? 'lb-messaging-contact-info-dark'
                              : 'lb-messaging-contact-info'
                          }
                        >
                          <div
                            className={
                              darkMode
                                ? 'lb-messaging-contact-name-dark'
                                : 'lb-messaging-contact-name'
                            }
                          >
                            {message.firstName + message.lastName}
                          </div>
                        </div>
                      </div>
                    ))}
            </div>
          </div>
          {/* we need to check all messages that has */}
          <div
            className={
              darkMode ? 'lb-messaging-message-window-dark' : 'lb-messaging-message-window'
            }
          >
            <div
              className={
                darkMode
                  ? 'lb-messaging-message-window-header-dark'
                  : 'lb-messaging-message-window-header'
              }
            >
              <div>
                <img
                  src={Object.keys(selectedUser).length === 0 ? '' : '/pfp-default-header.png'}
                  alt=""
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
                    <div
                      className={`lg-messaging-bell-select-dropdown ${
                        bellDropdownActive ? 'active' : ''
                      }`}
                      // tabIndex={0}
                      // onBlur={() => setBellDropdownActive(false)}
                    >
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
                        SMS
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
                        Email
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
                <span
                  id={darkMode ? 'lb-messaging-window-nochat-dark' : 'lb-messaging-window-nochat'}
                >
                  Select a chat to get started
                </span>
              ) : (
                renderChatMessages(
                  getMessagesBetweenUsers(messages, auth.userid, selectedUser.id),
                  auth.userid,
                )
              )}
            </div>
            <div className="lb-messaing-message-window-footer">
              <input
                type="text"
                placeholder="Type a message here ....."
                disabled={Object.keys(selectedUser).length === 0}
              />
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="send-button"
                size="2x"
                onClick={sendMessageData}
                title="Send"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p>Loading</p>
  );
}
