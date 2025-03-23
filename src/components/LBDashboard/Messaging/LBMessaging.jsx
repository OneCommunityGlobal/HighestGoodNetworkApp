import { useState } from 'react';
import './LBMessaging.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from 'actions/userManagement';
import { useEffect } from 'react';
import { fetchMessages, sendMessage } from 'actions/lbdashboard/messagingActions';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import React from 'react';

export default function LBMessaging() {

  const dispatch=useDispatch();
  const [selectedUser,updateSelectedUser]=useState({});
  const [selectContact,updateSelectContact]=useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const users=useSelector(state=>state.allUserProfilesBasicInfo)
  const auth=useSelector(state=>state.auth.user);
  const {messages}=useSelector(state=>state.lbmessaging);

  useEffect(()=>{
    if(users.userProfilesBasicInfo.length===0){
      dispatch(getUserProfileBasicInfo());   
    }
  },[dispatch,users.userProfilesBasicInfo]);

  useEffect(()=>{
    if(auth && auth.userid && messages.length===0){
      dispatch(fetchMessages(auth.userid));   
    }
  },[dispatch,messages]);
  const updateSelection = (user) =>{
    updateSelectedUser(user)
  }
  
  const getUniqueUsersFromMessages = (messages, loggedInUserId) => {
    const uniqueUsersMap = new Map();
    messages.forEach((msg) => {
      [msg.sender, msg.receiver].forEach((user) => {
        if (
          user &&
          user._id &&
          user._id.toString() !== loggedInUserId &&
          !uniqueUsersMap.has(user._id.toString())
        ) {
          uniqueUsersMap.set(user._id.toString(), {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          });
        }
      });
    });
    return Array.from(uniqueUsersMap.values());
  };
  const getMessagesBetweenUsers = (messages, loggedInUserId, selectedUserId) => {
    return messages.filter((msg) => {
      const senderId = msg.sender?._id?.toString?.() || msg.sender?.toString?.();
      const receiverId = msg.receiver?._id?.toString?.() || msg.receiver?.toString?.();
  
      return (
        (senderId === loggedInUserId && receiverId === selectedUserId) ||
        (senderId === selectedUserId && receiverId === loggedInUserId)
      );
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const formatDateLabel = (timestamp) => {
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
  
  const sendMessageData = ()=>{
    const footer = document.getElementsByClassName('lb-messaing-message-window-footer')[0];
    // Now get the input inside that footer
    const input = footer.getElementsByTagName('input')[0]; // or use querySelector('input')
    const message = input.value.trim();
    const data={
      "sender":auth.userid,
      "receiver":selectedUser.id,
      "content":message
    }
    if(selectedUser.id && auth.userid && message){
      dispatch(sendMessage(data))
    }
  }

  const renderChatMessages = (conversation, loggedInUserId) => {
    let lastDate = null;
  
    return (
      <div className="message-list">
        {conversation.map((msg, idx) => {
          const isSender = msg.sender._id === loggedInUserId || msg.sender === loggedInUserId;
          const msgDate = new Date(msg.timestamp).toDateString();
          const showDateLabel = msgDate !== lastDate;
          lastDate = msgDate;
  
          return (
            <React.Fragment key={msg._id}>
              {showDateLabel && (
                <div className="date-divider">
                  {formatDateLabel(msg.timestamp)}
                </div>
              )}
              <div className={`chat-bubble ${isSender ? 'sent' : 'received'}`}>
                <div className="chat-content">{msg.content}</div>
                <div className="chat-meta">
                  <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  {isSender && (
                    <span className="status">
                      {msg.status === 'read' ? '✔✔' : '✔'}
                    </span>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };
  
  
  return (
    users.userProfilesBasicInfo.length!==0 && messages.length!==0?<div className="lb-messaging-container">
      <div className='lb-messaging-body'>
        <div className='lb-messaging-header'>
          <img src="/big-sign.png" alt="onecommunity-logo" />
        </div>
        <div className='lb-messaging-navbar'></div>
        <div className='lb-messaging-content'>
          <div className='lb-messaging-contacts'>
            <div className='lb-messaging-contacts-header'>
              <input
                type="text"
                placeholder="Search contacts..."
                className="lb-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
              {users.userProfilesBasicInfo?.length!==0?<FontAwesomeIcon icon={faUserCircle} size="2x" onClick={()=>updateSelectContact(prev=>!prev)}/>:<span></span>}
            </div>
            <div className='lb-messaging-contacts-body'>
            {
              !selectContact? 
              (getUniqueUsersFromMessages(messages,auth.userid)).filter((user) =>
                (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchQuery.toLowerCase())
              ).map((message) => (
                <div key={`${message.lastName}-${message._id}`}
                className='lb-messaging-contact' onClick={()=>updateSelection(message)}>
                  <img src={message.profilePic? message.profilePic : '/pfp-default-header.png'} alt="onecommunity-logo" />
                  <div className='lb-messaging-contact-info'>
                    <div className='lb-messaging-contact-name'>{`${message.firstName} ${message.lastName}`}</div>
                    {/* <div className='lb-messaging-contact-preview'>{message.preview}</div> */}
                  </div>
                </div>
              )) 
              :
              users.userProfilesBasicInfo.filter((user) =>
                (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchQuery.toLowerCase())
              ).map((message) => (
                <div key={`${message.firstName}-${message._id}`} className='lb-messaging-contact' onClick={()=>updateSelection(message)}>
                  <img src={message.profilePic? message.profilePic : '/pfp-default-header.png'} alt="onecommunity-logo" />
                  <div className='lb-messaging-contact-info'>
                    <div className='lb-messaging-contact-name'>{message.firstName + message.lastName}</div>
                    {/* <div className='lb-messaging-contact-preview'>{message.preview}</div> */}
                  </div>
                </div>
              ))
            }
            </div>
          </div>
          {/* we need to check all messages that has */}
          <div className='lb-messaging-message-window'>
            <div className='lb-messaging-message-window-header'>
              <img src={Object.keys(selectedUser).length==0? "":'/pfp-default-header.png'} alt=""/>
              {Object.keys(selectedUser).length==0? "": `${selectedUser.firstName} ${selectedUser.lastName}`}
            </div>
            <div className='lb-messaging-message-window-body'>
              {renderChatMessages(getMessagesBetweenUsers(messages,auth.userid,selectedUser.id), auth.userid)}
            </div>
            <div className='lb-messaing-message-window-footer'>
              <input type="text" placeholder='Enter Message' />
              <FontAwesomeIcon icon={faPaperPlane} className='send-button' size='2x' onClick={sendMessageData}/>
            </div>
          </div>
          </div>
      </div>
    </div>: <p>Loading</p>
  )
}

