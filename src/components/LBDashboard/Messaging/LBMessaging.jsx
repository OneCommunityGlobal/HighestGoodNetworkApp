<<<<<<< Updated upstream
=======
// src/components/LBDashboard/Messaging/LBMessaging.jsx
>>>>>>> Stashed changes
import { useState, useEffect, useRef } from 'react';
import './LBMessaging.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faLocationArrow, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfileBasicInfo } from '~/actions/userManagement';
import {
  fetchUserPreferences,
  updateUserPreferences,
<<<<<<< Updated upstream
} from '~/actions/lbdashboard/userPreferenceActions';
=======
} from 'actions/lbdashboard/userPreferenceActions';
>>>>>>> Stashed changes
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

  // --------- GLOBAL (user-level) SMS settings (simple save, no OTP) ---------
  const [globalSms, setGlobalSms] = useState({ phoneNumber: '', notifySMS: false });
  const [savingGlobalSms, setSavingGlobalSms] = useState(false);

  // Per-chat UI state (bell menu)
  const [selectedOption, setSelectedOption] = useState({
    notifyInApp: false,
    notifyEmail: false,
  });

  // Unread badge counts per userId (string -> number)
  const [unreadCounts, setUnreadCounts] = useState({});

  // Local refs
  const messageEndRef = useRef(null);
  const menuRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const lastMsgHashRef = useRef('');
  const wsListenerAttachedRef = useRef(false);

  const users = useSelector(state => state.allUserProfilesBasicInfo);
  const auth = useSelector(state => state.auth.user);
  const messagesState = useSelector(state => state.messages);
  const existingChats = useSelector(state => state.messages.existingChats);
  const { messages, loading: messagesLoading } = messagesState;

  // ---------- Phone helpers ----------
  const isPlausibleE164 = (v) => /^\+?\d{10,15}$/.test((v || '').trim());
  const normalizeToE164Guess = (raw) => {
    const digits = (raw || '').replace(/[^\d+]/g, '');
    if (!digits) return '';
    if (digits.startsWith('+')) return digits;
    if (/^\d{10}$/.test(digits)) return `+1${digits}`; // naive US default
    if (/^1\d{10}$/.test(digits)) return `+${digits}`;
    return digits.startsWith('+') ? digits : `+${digits}`;
  };

  // ---------- Security: PII obfuscation & spam checks ----------
  const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const PHONE_RE = /(\+?\d[\d\-\s().]{8,}\d)/g;
  const obfuscatePII = (text) =>
    (text || '')
      .replace(EMAIL_RE, '[email hidden]')
      .replace(PHONE_RE, (m) => {
        const digits = (m.match(/\d/g) || []).join('');
        if (digits.length < 10) return m;
        return `[phone ****${digits.slice(-4)}]`;
      });

  const MAX_MSG_LEN = 1000;
  const MAX_LINKS = 3;
  const RATE_LIMIT_MS = 1500;
  const linkCount = (t) => ((t || '').match(/https?:\/\/|www\./gi) || []).length;
  const hasRepeatRun = (t) => /(.)\1{9,}/.test(t);
  const containsPII = (t) => EMAIL_RE.test(t) || PHONE_RE.test(t);
  const msgHash = (t) => {
    let h = 0; for (let i = 0; i < t.length; i++) { h = (h * 31 + t.charCodeAt(i)) | 0; }
    return String(h);
  };

  // ---------- Effects ----------
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const searchUserProfiles = async query => {
    try {
      const { data } = await axios.get(`${ENDPOINTS.LB_SEARCH_USERS}?query=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch (error) {
      const isNet = !error.response;
      const msg = isNet ? 'Network error. Check your connection.' : 'Failed to search users.';
      toast.error(msg);
      // eslint-disable-next-line no-console
      console.error('LB_SEARCH_USERS failed:', error?.response?.data || error);
    }
  };

  useEffect(() => {
    if (users.userProfilesBasicInfo.length === 0) {
      dispatch(getUserProfileBasicInfo());
    }
  }, [dispatch, users.userProfilesBasicInfo, auth.userid]);

  // Init socket + global listeners (in-app notifications, unread counts, send failures)
  useEffect(() => {
    const token = localStorage.getItem('token');
    initMessagingSocket(token);

    const sock = getMessagingSocket();
    if (sock && !wsListenerAttachedRef.current) {
      wsListenerAttachedRef.current = true;

      // Ask for initial unread counts (if backend supports it)
      try { sock.send(JSON.stringify({ action: 'GET_UNREAD_COUNTS' })); } catch (_) {}

      const onError = () => toast.error('Message connection error. Trying to reconnect…');
      const onClose = (e) => { if (e.code !== 1000) toast.error('Disconnected from messages. Reconnecting…'); };
      const onMessage = (ev) => {
        try {
          const evt = JSON.parse(ev.data);
          switch (evt?.action) {
            case 'UNREAD_COUNTS':
              if (evt.payload && typeof evt.payload === 'object') {
                setUnreadCounts(evt.payload); // { [userId]: number }
              }
              break;
            case 'NEW_NOTIFICATION':
              toast.info(evt.payload || 'New message');
              break;
            case 'RECEIVE_MESSAGE': {
              const msg = evt.payload;
              // If viewing that sender, mark read & clear badge
              if (selectedUser?.userId && String(msg?.sender) === String(selectedUser.userId)) {
                markMessagesAsReadViaSocket(selectedUser.userId);
                setUnreadCounts((prev) => ({ ...prev, [selectedUser.userId]: 0 }));
              } else if (msg?.sender) {
                // Otherwise bump the sender's badge
                setUnreadCounts((prev) => ({
                  ...prev,
                  [msg.sender]: (prev[msg.sender] || 0) + 1,
                }));
              }
              break;
            }
            case 'SEND_MESSAGE_FAILED':
              toast.error('Message could not be sent.');
              break;
            default:
              break;
          }
        } catch {}
      };

      sock.addEventListener('message', onMessage);
      sock.addEventListener('error', onError);
      sock.addEventListener('close', onClose);

      return () => {
        try {
          sock.removeEventListener('message', onMessage);
          sock.removeEventListener('error', onError);
          sock.removeEventListener('close', onClose);
        } catch (_) {}
      };
    }
    return undefined;
  }, [auth.userid, selectedUser?.userId, dispatch]);

  useEffect(() => {
    if (selectedUser.userId) {
      markMessagesAsReadViaSocket(selectedUser.userId);
      setUnreadCounts((prev) => ({ ...prev, [selectedUser.userId]: 0 }));
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser.userId) {
      updateChatState(true, selectedUser.userId);
    } else {
      updateChatState(true, null);
    }
    return () => updateChatState(false, null);
  }, [selectedUser]);

  useEffect(() => {
    dispatch(fetchExistingChats(auth.userid));
  }, [dispatch, auth.userid]);

  // Per-chat preferences (bell menu) – only in-app & email now
  useEffect(() => {
    if (selectedUser.userId) {
      dispatch(fetchUserPreferences(auth.userid, selectedUser.userId)).then(response => {
        const payload = response?.payload || response || {};
        const notifyEmail =
          payload.notifyEmail ??
          payload.emailEnabled ??
          payload.enableEmail ??
          payload.notify_by_email ??
          false;
        const notifyInApp =
          payload.notifyInApp ??
          payload.inAppEnabled ??
          payload.enableInApp ??
          payload.notify_in_app ??
          false;
        setSelectedOption({
          notifyInApp: !!notifyInApp,
          notifyEmail: !!notifyEmail,
        });
      });
    } else {
      setSelectedOption({
        notifyInApp: false,
        notifyEmail: false,
      });
    }
  }, [dispatch, auth.userid, selectedUser.userId]);

  // Global online/offline toasts
  useEffect(() => {
    const onOffline = () => toast.error('You are offline. Messages will not send.');
    const onOnline = () => toast.success('Back online.');
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  // Click-away for hamburger
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileHamMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------- Await socket ACK for sends ----------
  function awaitAck(tempId, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
      const sock = getMessagingSocket();
      if (!sock) return reject(new Error('No socket'));
      const onMsg = (ev) => {
        try {
          const evt = JSON.parse(ev.data);
          if (evt?.action === 'SEND_MESSAGE_ACK' && evt?.payload?.tempId === tempId) {
            clearTimeout(timer);
            sock.removeEventListener('message', onMsg);
            resolve(true);
          }
        } catch {}
      };
      const timer = setTimeout(() => {
        sock.removeEventListener('message', onMsg);
        reject(new Error('ACK timeout'));
      }, timeoutMs);
      sock.addEventListener('message', onMsg);
    });
  }

  // ---------- GLOBAL SMS: load once for the user ----------
  useEffect(() => {
    if (!auth?.userid) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          ENDPOINTS.LB_USER_SMS_SETTINGS(auth.userid),
          { headers: { Authorization: `${token}` } }
        );
        const phone = data?.phoneNumber || '';
        const enabled = !!data?.notifySMS;
        setGlobalSms({ phoneNumber: phone, notifySMS: enabled });
      } catch (e) {
        // non-fatal
        // eslint-disable-next-line no-console
        console.warn('Load global SMS settings failed:', e?.response?.data || e);
      }
    })();
  }, [auth?.userid]);

  async function saveGlobalSms() {
    try {
      setSavingGlobalSms(true);
      const normalized = normalizeToE164Guess(globalSms.phoneNumber);
      if (globalSms.notifySMS && !isPlausibleE164(normalized)) {
        toast.error('Enter a valid phone (E.164, e.g., +11234567890) to enable SMS.');
        return;
      }
      const token = localStorage.getItem('token');
      await axios.post(
        ENDPOINTS.LB_USER_SMS_SETTINGS(auth.userid),
        { phoneNumber: normalized || '', notifySMS: !!globalSms.notifySMS },
        { headers: { Authorization: `${token}` } }
      );
      setGlobalSms((p) => ({ ...p, phoneNumber: normalized }));
      toast.success('SMS settings saved.');
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to save SMS settings.';
      toast.error(msg);
    } finally {
      setSavingGlobalSms(false);
    }
  }

  // ---------- Event handlers ----------
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
      // Clear badge locally so UI updates immediately
      setUnreadCounts(prev => ({ ...prev, [newSelectedUser.userId]: 0 }));
    } else {
      toast.error('Invalid user selected. Please try again.');
    }
  };

  const saveUserPreferences = () => {
    // Per-chat only: do not send SMS/phone here
    const payload = {
      // In-app (cover common variants)
      notifyInApp: !!selectedOption.notifyInApp,
      inAppEnabled: !!selectedOption.notifyInApp,
      enableInApp: !!selectedOption.notifyInApp,
      notify_in_app: !!selectedOption.notifyInApp,
      // Email (cover common variants)
      notifyEmail: !!selectedOption.notifyEmail,
      emailEnabled: !!selectedOption.notifyEmail,
      enableEmail: !!selectedOption.notifyEmail,
      notify_by_email: !!selectedOption.notifyEmail,
    };

    return dispatch(updateUserPreferences(auth.userid, selectedUser.userId, payload))
      .then(() => {
        toast.success('Preferences updated successfully!');
        setBellDropdownActive(false);
        return dispatch(fetchUserPreferences(auth.userid, selectedUser.userId));
      })
      .then((response) => {
        const p = response?.payload || response || {};
        const notifyEmail =
          p.notifyEmail ?? p.emailEnabled ?? p.enableEmail ?? p.notify_by_email ?? false;
        const notifyInApp =
          p.notifyInApp ?? p.inAppEnabled ?? p.enableInApp ?? p.notify_in_app ?? false;
        setSelectedOption({
          notifyInApp: !!notifyInApp,
          notifyEmail: !!notifyEmail,
        });
      })
      .catch((error) => {
        const serverMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.response?.statusText ||
          'Unknown server error';
        // eslint-disable-next-line no-console
        console.error('updateUserPreferences failed:', error?.response?.data || error);
        toast.error(`Failed to update preferences. ${serverMsg}`);
      });
  };

  const handleSendMessage = async () => {
    const raw = messageText || '';
    const text = raw.trim();
    if (!text) return;

    // Anti-spam validations
    const now = Date.now();
    if (now - lastSentAtRef.current < RATE_LIMIT_MS) {
      toast.error('You are sending messages too quickly. Please wait a moment.');
      return;
    }
    if (text.length > MAX_MSG_LEN) {
      toast.error(`Message is too long (max ${MAX_MSG_LEN} characters).`);
      return;
    }
    if (linkCount(text) > MAX_LINKS) {
      toast.error(`Too many links (max ${MAX_LINKS} per message).`);
      return;
    }
    if (hasRepeatRun(text)) {
      toast.error('Message contains excessive repeated characters.');
      return;
    }
    if (containsPII(text)) {
      toast.error('Please do not share phone numbers or emails in chat.');
      return;
    }
    const hash = msgHash(text);
    if (hash === lastMsgHashRef.current) {
      toast.error('Duplicate message blocked.');
      return;
    }

    const socket = getMessagingSocket();
    if (socket && socket.readyState === WebSocket.OPEN) {
      const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const payload = { action: 'SEND_MESSAGE', receiver: selectedUser.userId, content: text, tempId };
      try {
        socket.send(JSON.stringify(payload));
        setMessageText('');
        await awaitAck(tempId, 5000);
        lastSentAtRef.current = now;
        lastMsgHashRef.current = hash;
      } catch (err) {
        toast.error('Message may not have been delivered. Please retry.');
      }
    } else {
      toast.error('WebSocket is not connected. Please try again later.');
      // eslint-disable-next-line no-console
      console.error('WebSocket not open:', socket?.readyState, socket);
    }
  };

  // ---------- UI utils ----------
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

  // ---------- Render helpers ----------
  const renderContacts = () => {
<<<<<<< Updated upstream
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
=======
    if (existingChats.length === 0) return <p>No chats available.</p>;
    return existingChats.map(user => {
      const uid = user.userId;
      const count = unreadCounts?.[uid] || 0;
      return (
        <div
          key={uid}
          className="lb-messaging-contact"
          onClick={() => { updateSelection(user); setMobileHamMenu(false); }}
        >
          <img
            src={user.profilePic || '/pfp-default-header.png'}
            alt="User Profile"
            onError={e => { e.target.onerror = null; e.target.src = '/pfp-default-header.png'; }}
          />
          <div className="lb-messaging-contact-info">
            <div className={`lb-messaging-contact-name ${mobileView ? 'black' : ''}`}>
              {user.firstName} {user.lastName}
              {count > 0 && <span className="lb-unread-badge">{count > 99 ? '99+' : count}</span>}
            </div>
          </div>
        </div>
      );
    });
>>>>>>> Stashed changes
  };

  const renderChatMessages = () => {
    if (messagesLoading) return <p className="lb-no-msg-text">Loading messages...</p>;
    if (messages.length === 0) return <p className="lb-no-msg-text">No messages to display.</p>;
    const filteredMessages = messages.filter(
      m =>
        (m.sender === auth.userid && m.receiver === selectedUser.userId) ||
        (m.sender === selectedUser.userId && m.receiver === auth.userid),
    );
    if (filteredMessages.length === 0) return <p className="lb-no-msg-text">No messages to display.</p>;

    return (
      <div className="message-list">
        <div className="message-spacer" />
        {filteredMessages.map(message => (
          <div
            key={message._id || message.timestamp}
            className={`message-item ${message.sender === auth.userid ? 'sent' : 'received'}`}
          >
            <p className="message-text">
              {obfuscatePII(message.content).split('\n').map(line => (
                <span key={(message._id || message.timestamp) + line}>
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

  // ---------- Component ----------
  return (
    users.userProfilesBasicInfo.length !== 0 && (
      <div className="main-container">
        <div className="logo-container">
          <img src={logo} alt="One Community Logo" />
        </div>
        <div className="content-container">
          <div className="container-top msg">
            {mobileView && (
              <div className="lb-mobile-messaging-menu">
                <div className="lb-mobile-header">
                  <button type="button" className="lb-ham-btn" onClick={() => setMobileHamMenu(prev => !prev)}>
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
                              onChange={(e) => {
                                const query = e.currentTarget.value;
                                setSearchQuery(query);
                                if (query.trim() !== '') searchUserProfiles(query);
                                else setSearchResults([]);
                              }}
                            />
<<<<<<< Updated upstream
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
=======
                            <div onClick={() => setShowContacts(prev => !prev)}>
                              <img src="https://img.icons8.com/metro/26/multiply.png" alt="multiply" className="lb-msg-icon" />
                            </div>
>>>>>>> Stashed changes
                          </div>
                        ) : (
                          <div className="lb-messaging-contacts-header-mobile">
                            <h3 className="lb-contact-msgs">Messages</h3>
                            <div className="lb-messaging-search-icons-mobile">
                              <FontAwesomeIcon icon={faSearch} className="lb-msg-icon-mobile" onClick={() => setShowContacts(prev => !prev)} />
                            </div>
                          </div>
                        )}
                        <div className="lb-messaging-contacts-body active">
                          {showContacts
<<<<<<< Updated upstream
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
=======
                            ? searchResults.map(user => 
                              {
                                const count = unreadCounts?.[user._id] || 0;
                                return (
                                  <div
                                    key={user._id}
                                    className="lb-messaging-contact"
                                    onClick={() => { updateSelection(user); setMobileHamMenu(false); }}
                                  >
                                    <img
                                      src={user.profilePic || '/pfp-default-header.png'}
                                      alt="User Profile"
                                      onError={e => { e.target.onerror = null; e.target.src = '/pfp-default-header.png'; }}
                                    />
                                    <div className="lb-messaging-contact-info">
                                      <div className={`lb-messaging-contact-name ${mobileView ? 'black' : ''}`}>
                                        {user.firstName} {user.lastName}
                                        {count > 0 && (
                                          <span className="lb-unread-badge">{count > 99 ? '99+' : count}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
>>>>>>> Stashed changes
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
            {/* Contacts / Left column */}
            {!mobileView && (
              <div className="lb-messaging-contacts">
                {/* ---- Global Notification Settings panel ---- */}
                <div className="lb-global-notify card">
                  <div className="lb-global-notify__header">Notification Settings (Global)</div>
                  <div className="lb-global-notify__body">
                    <label style={{ display: 'block', marginBottom: 8, width: '100%' }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>SMS Phone</div>
                      <input
                        type="tel"
                        className="lb-sms-phone-input"
                        placeholder="+11234567890"
                        value={globalSms.phoneNumber}
                        onChange={(e) => setGlobalSms((p) => ({ ...p, phoneNumber: e.currentTarget.value }))}
                        onBlur={(e) =>
                          setGlobalSms((p) => ({ ...p, phoneNumber: normalizeToE164Guess(e.currentTarget.value) }))
                        }
                      />
                      <small className="lb-sms-phone-help">
                        Saved once for your account. We’ll use this number for SMS notifications.
                      </small>
                    </label>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                      <input
                        type="checkbox"
                        checked={globalSms.notifySMS}
                        onChange={(e) => setGlobalSms((p) => ({ ...p, notifySMS: e.currentTarget.checked }))}
                      />
                      Enable SMS notifications
                    </label>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={saveGlobalSms}
                      disabled={savingGlobalSms}
                    >
                      {savingGlobalSms ? 'Saving…' : 'Save SMS Settings'}
                    </button>
                  </div>
                </div>

                {/* Contacts header/search */}
                {showContacts ? (
                  <div className="lb-messaging-contacts-header">
                    <input
                      type="text"
                      placeholder={placeholder}
                      className="lb-search-input"
                      value={searchQuery}
                      onChange={(e) => {
                        const query = e.currentTarget.value;
                        setSearchQuery(query);
                        if (query.trim() !== '') searchUserProfiles(query);
                        else setSearchResults([]);
                      }}
                    />
<<<<<<< Updated upstream
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
=======
                    <div onClick={() => setShowContacts(prev => !prev)}>
                      <img src="https://img.icons8.com/metro/26/multiply.png" alt="multiply" className="lb-msg-icon" />
                    </div>
>>>>>>> Stashed changes
                  </div>
                ) : (
                  <div className="lb-messaging-contacts-header">
                    <h3 className="lb-contact-msgs">Messages</h3>
                    <div className="lb-messaging-search-icons">
                      <FontAwesomeIcon icon={faSearch} className="lb-msg-icon" onClick={() => setShowContacts(prev => !prev)} />
                    </div>
                  </div>
                )}
                <div className="lb-messaging-contacts-body active">
                  {showContacts
<<<<<<< Updated upstream
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
=======
                    ? searchResults.map(user => {
                        const count = unreadCounts?.[user._id] || 0;
                        return (
                          <div key={user._id} className="lb-messaging-contact" onClick={() => updateSelection(user)}>
                            <img
                              src={user.profilePic || '/pfp-default-header.png'}
                              alt="User Profile"
                              onError={e => { e.target.onerror = null; e.target.src = '/pfp-default-header.png'; }}
                            />
                            <div className="lb-messaging-contact-info">
                              <div className="lb-messaging-contact-name">
                                {user.firstName} {user.lastName}
                                {count > 0 && (
                                  <span className="lb-unread-badge">{count > 99 ? '99+' : count}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
>>>>>>> Stashed changes
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
                    onError={e => { e.target.onerror = null; e.target.src = '/pfp-default-header.png'; }}
                    alt="Profile"
                    className="m-1"
                  />
                  {selectedUser.firstName ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'Select a user to chat'}
                </div>

                {selectedUser.userId && (
                  <div className="lb-messaging-header-icons">
                    <FontAwesomeIcon
                      icon={faBell}
                      onClick={() => setBellDropdownActive(prev => !prev)}
                      className="lg-messaging-notification-bell"
                      title="Per-chat notification settings"
                    />
                    {bellDropdownActive && (
                      <div className={`lg-messaging-bell-select-dropdown ${bellDropdownActive ? 'active' : ''}`}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedOption.notifyInApp || false}
                            onChange={(e) => {
                              const checked = e.currentTarget.checked;
                              setSelectedOption((p) => ({ ...p, notifyInApp: checked }));
                            }}
                          />
                          In App
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={selectedOption.notifyEmail || false}
                            onChange={(e) => {
                              const checked = e.currentTarget.checked;
                              setSelectedOption((p) => ({ ...p, notifyEmail: checked }));
                            }}
                          />
                          Email
                        </label>

                        <div className="lb-sms-hint">
                          SMS is managed in “Notification Settings (Global)” on the left.
                        </div>

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
                {selectedUser.userId ? renderChatMessages() : <p className="start-msg">Select a user to start chatting</p>}
              </div>

              <div className="lb-messaing-message-window-footer">
                <textarea
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.currentTarget.value)}
                  onPaste={(e) => {
                    const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
                    if (containsPII(pasted)) {
                      e.preventDefault();
                      toast.error('Pasting emails or phone numbers is blocked.');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="lb-messaging-textarea"
                  disabled={!selectedUser.userId || navigator.onLine === false}
                />
                <FontAwesomeIcon
                  icon={faLocationArrow}
                  className="send-button"
                  style={{ opacity: getMessagingSocket()?.readyState === WebSocket.OPEN ? 1 : 0.4 }}
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
