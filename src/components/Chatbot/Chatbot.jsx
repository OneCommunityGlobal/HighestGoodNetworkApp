import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCommentDots,
  faMicrophone,
  faPaperPlane,
  faSun,
  faMoon,
  faFileLines,
  faLink,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import chatbotService from '../../services/chatbotService';
import styles from './Chatbot.module.css';

const SpeechRecognitionAPI =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const FAB_SIZE = 56;
const PADDING = 24;
const BACK_TO_TOP_SIZE = 48;
const BACK_TO_TOP_GAP = 12;
const PANEL_MIN_WIDTH = 320;
const PANEL_MIN_HEIGHT = 300;
const PANEL_DEFAULT_WIDTH = 380;
const PANEL_DEFAULT_HEIGHT = 520;

// Extract URLs from text (http/https, optionally mark video-like domains)
const URL_REGEX = /https?:\/\/[^\s)\]>"]+/gi;
const ASSISTANT_METADATA_PREFIXES = [
  'source document:',
  'urls:',
  'video links:',
  'sources & references',
];

const EMPTY_REFERENCE_PATTERN = /^(url|video link)s?:\s*(not provided|not available|not provided in the context|n\/a|na|none)?\s*$/i;

function extractUrls(text) {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(URL_REGEX) || [];
  return [...new Set(matches)];
}

function isVideoUrl(url) {
  if (!url) return false;
  const u = url.toLowerCase();
  return /\.(mp4|webm|mov)(\?|$)/.test(u) || /youtube\.com|youtu\.be|vimeo\.com|dropbox\.com.*\.(mp4|webm|video)/.test(u);
}

function normalizeAssistantReply(content) {
  if (typeof content !== 'string') return '';

  const lines = content.split(/\n+/).map(line => line.trim());
  const visibleLines = [];

  for (const line of lines) {
    if (!line) continue;

    const lowerLine = line.toLowerCase();
    if (lowerLine.startsWith('sources & references')) break;
    if (ASSISTANT_METADATA_PREFIXES.some(prefix => lowerLine.startsWith(prefix))) continue;
    if (EMPTY_REFERENCE_PATTERN.test(line)) continue;

    visibleLines.push(
      line
        .replace(/\[([^\]]+)\]\((?:#|https?:)[^)]+\)/g, '$1')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1'),
    );
  }

  return visibleLines
    .join('\n')
    .replace(/\n(?=Based on the context provided,|For more detailed information,|If you have any questions or need assistance, feel free to reach out\.|Let me know how I can assist you further\.)/gi, '\n\n')
    .replace(/\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}:)/g, '\n\n$1')
    .replace(/\n-\s+/g, '\n- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatAssistantReply(content) {
  const normalized = normalizeAssistantReply(content);
  if (!normalized) return '';

  return normalized
    .replace(/(?<!\n)(\d+\.)\s+/g, '\n$1 ')
    .replace(/([:;.])\s+-\s+/g, '$1\n- ')
    .trim();
}

function Chatbot() {
  const isAuthenticated = useSelector(state => state.auth?.isAuthenticated);
  const authFirstName = useSelector(state => state.auth?.user?.firstName);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [fabPosition, setFabPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: null, y: null };

    const bottomOffset = PADDING + BACK_TO_TOP_SIZE + BACK_TO_TOP_GAP;
    return {
      x: window.innerWidth - FAB_SIZE - PADDING,
      y: window.innerHeight - FAB_SIZE - bottomOffset,
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [panelSize, setPanelSize] = useState({
    width: PANEL_DEFAULT_WIDTH,
    height: PANEL_DEFAULT_HEIGHT,
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const didDragRef = useRef(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const appTheme = useSelector(state => state.theme?.theme) || 'light';
  const userProfile = useSelector(state => state.userProfile) || {};
  const userName = (authFirstName || userProfile.firstName || 'there').split(' ')[0];
  const greetingAddedRef = useRef(false);
  const [chatTheme, setChatTheme] = useState(null);
  const isDark = (chatTheme ?? appTheme) === 'dark';
  const toggleChatTheme = () =>
    setChatTheme(prev => ((prev ?? appTheme) === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    const floatingButtons = document.querySelectorAll('.top, .back-to-top');

    floatingButtons.forEach(button => {
      button.style.display = isAuthenticated ? '' : 'none';
    });

    if (!isAuthenticated) {
      setIsOpen(false);
    }

    return () => {
      floatingButtons.forEach(button => {
        if (button.style.display === 'none') {
          button.style.display = '';
        }
      });
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (greetingAddedRef.current) return;
    setMessages([
      {
        role: 'assistant',
        content: `Hello, ${userName}! How can I help you?`,
        id: Date.now(),
      },
    ]);
    greetingAddedRef.current = true;
  }, [userName]);

  useEffect(() => {
    if (fabPosition.x === null || fabPosition.y === null) {
      const bottomOffset = PADDING + BACK_TO_TOP_SIZE + BACK_TO_TOP_GAP;
      setFabPosition({
        x: window.innerWidth - FAB_SIZE - PADDING,
        y: window.innerHeight - FAB_SIZE - bottomOffset,
      });
    }
  }, []);

  const handleFabMouseDown = (e) => {
    if (e.button !== 0) return;
    didDragRef.current = false;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: fabPosition.x,
      posY: fabPosition.y,
    };
  };

  const handleFabTouchStart = (e) => {
    const t = e.touches[0];
    didDragRef.current = false;
    setIsDragging(true);
    dragStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      posX: fabPosition.x,
      posY: fabPosition.y,
    };
  };

  const handleGlobalMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const { x, y, posX, posY } = dragStartRef.current;
    if (Math.abs(clientX - x) > 5 || Math.abs(clientY - y) > 5) didDragRef.current = true;
    let newX = posX + (clientX - x);
    let newY = posY + (clientY - y);
    newX = Math.max(0, Math.min(window.innerWidth - FAB_SIZE, newX));
    newY = Math.max(0, Math.min(window.innerHeight - FAB_SIZE, newY));
    setFabPosition({ x: newX, y: newY });
  };

  const handleGlobalEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchmove', handleGlobalMove, { passive: true });
    window.addEventListener('touchend', handleGlobalEnd);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging]);

  const handleFabClick = e => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      setIsOpen(prev => !prev);
    }
  };

  const handleResizeStart = e => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: panelSize.width,
      height: panelSize.height,
    };
  };

  const handleResizeTouchStart = e => {
    e.preventDefault();
    const t = e.touches[0];
    setIsResizing(true);
    resizeStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      width: panelSize.width,
      height: panelSize.height,
    };
  };

  const handleResizeMove = e => {
    if (!isResizing) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const { x, y, width, height } = resizeStartRef.current;
    const deltaX = clientX - x;
    const deltaY = clientY - y;
    const maxW = Math.min(600, window.innerWidth - 48);
    const maxH = Math.min(Math.floor(window.innerHeight * 0.85), window.innerHeight - 100);
    const newWidth = Math.max(PANEL_MIN_WIDTH, Math.min(maxW, width + deltaX));
    const newHeight = Math.max(PANEL_MIN_HEIGHT, Math.min(maxH, height + deltaY));
    setPanelSize({ width: newWidth, height: newHeight });
  };

  const handleResizeEnd = () => setIsResizing(false);

  useEffect(() => {
    if (!isResizing) return;
    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchmove', handleResizeMove, { passive: false });
    window.addEventListener('touchend', handleResizeEnd);
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleResizeMove);
      window.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages
      .concat(userMessage)
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const { reply, sources } = await chatbotService.sendChatMessage(trimmed, history);
      const normalizedReply = normalizeAssistantReply(reply) || reply;
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: normalizedReply, id: Date.now() + 1, sources },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
          id: Date.now() + 1,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const startListening = () => {
    if (!SpeechRecognitionAPI || isListening) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  const fabStyle =
    fabPosition.x != null && fabPosition.y != null
      ? { left: fabPosition.x, top: fabPosition.y }
      : undefined;

  const panelWidth = panelSize.width;
  const panelHeight = panelSize.height;
  const panelStyle =
    fabPosition.x != null && fabPosition.y != null
      ? {
          left: Math.max(
            PADDING,
            Math.min(
              fabPosition.x + FAB_SIZE - panelWidth,
              window.innerWidth - panelWidth - PADDING,
            ),
          ),
          top: Math.max(PADDING, fabPosition.y - panelHeight - 12),
          right: 'auto',
          bottom: 'auto',
          width: panelWidth,
          height: panelHeight,
        }
      : undefined;

  return (
    <>
      {isAuthenticated && (
      <button
        type="button"
        className={styles['chatbot-fab']}
        style={fabStyle}
        onMouseDown={handleFabMouseDown}
        onTouchStart={handleFabTouchStart}
        onClick={handleFabClick}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        title={isOpen ? 'Close chat' : 'Open chat (drag to move)'}
      >
        <FontAwesomeIcon icon={faCommentDots} className={styles['chatbot-fab-icon']} />
      </button>

      )}

      {isAuthenticated && isOpen && (
        <>
          <div
            className={isDark ? `${styles['chatbot-panel']} ${styles['chatbot-panel-dark']}` : styles['chatbot-panel']}
            style={panelStyle}
          >
            <div className={styles['chatbot-titlebar']}>
              <div className={styles['chatbot-traffic-lights']}>
                <button
                  type="button"
                  className={`${styles['chatbot-traffic']} ${styles['chatbot-traffic-minimize']}`}
                  onClick={() => setIsOpen(false)}
                  aria-label="Minimize"
                />
              </div>
              <span className={styles['chatbot-title']}>Assistant</span>
              <button
                type="button"
                className={styles['chatbot-theme-toggle']}
                onClick={toggleChatTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                <FontAwesomeIcon icon={isDark ? faSun : faMoon} className={styles['chatbot-theme-icon']} />
              </button>
            </div>

            <div className={styles['chatbot-messages']}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles['chatbot-message']} ${styles[`chatbot-message-${msg.role}`]}`}
                >
                  <div className={styles['chatbot-message-bubble']}>
                    {msg.role === 'assistant' ? formatAssistantReply(msg.content) : msg.content}
                    {msg.sources?.length > 0 && (
                      <div className={styles['chatbot-sources']}>
                        <div className={styles['chatbot-sources-label']}>Sources &amp; references</div>
                        {msg.sources.map((s, i) => {
                          const urls = extractUrls(s.text);
                          return (
                            <div key={s.id || i} className={styles['chatbot-source-card']}>
                              <div className={styles['chatbot-source-doc']}>
                                <FontAwesomeIcon icon={faFileLines} className={`${styles['chatbot-source-icon']} ${styles['chatbot-source-icon-doc']}`} aria-hidden />
                                <span className={styles['chatbot-source-doc-name']}>{s.source_document || `Source ${i + 1}`}</span>
                                {s.score != null && (
                                  <span className={styles['chatbot-score']}> (relevance: {Number(s.score).toFixed(2)})</span>
                                )}
                              </div>
                              {urls.length > 0 && (
                                <div className={styles['chatbot-source-links']}>
                                  {urls.map((url, j) => (
                                    <a
                                      key={j}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles['chatbot-source-link']}
                                      title={url}
                                    >
                                      <FontAwesomeIcon
                                        icon={isVideoUrl(url) ? faVideo : faLink}
                                        className={`${styles['chatbot-source-icon']} ${styles['chatbot-source-icon-link']}`}
                                        aria-hidden
                                      />
                                      <span className={styles['chatbot-source-link-text']}>
                                        {isVideoUrl(url) ? 'Video' : 'Link'} {j + 1}
                                      </span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              <div className={styles['chatbot-source-snippet']}>{s.text}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles['chatbot-message']} ${styles['chatbot-message-assistant']}`}>
                  <div className={`${styles['chatbot-message-bubble']} ${styles['chatbot-typing']}`}>
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles['chatbot-input-row']} onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className={styles['chatbot-input']}
                placeholder="Type or use voice..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={isLoading}
                aria-label="Message"
              />
              {SpeechRecognitionAPI && (
                <button
                  type="button"
                  className={isListening ? `${styles['chatbot-mic']} ${styles['chatbot-mic-active']}` : styles['chatbot-mic']}
                  onClick={isListening ? stopListening : startListening}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  <FontAwesomeIcon icon={faMicrophone} />
                </button>
              )}
              <button
                type="submit"
                className={styles['chatbot-send']}
                disabled={isLoading || !input.trim()}
                aria-label="Send"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
            <div
              role="button"
              tabIndex={0}
              className={styles['chatbot-resize-handle']}
              onMouseDown={handleResizeStart}
              onTouchStart={handleResizeTouchStart}
              aria-label="Resize window"
            />
            <div className={styles['chatbot-disclaimer']}>
              This chatbot is for informational purposes only and may not be completely accurate.
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Chatbot;
