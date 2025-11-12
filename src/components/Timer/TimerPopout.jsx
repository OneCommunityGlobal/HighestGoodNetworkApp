import { FaExternalLinkAlt } from 'react-icons/fa';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useRef, useEffect } from 'react';
import cs from 'classnames';
import { Provider } from 'react-redux';
import DOMPurify from 'dompurify';
import styles from './Timer.module.css';
import './Countdown.module.css';
import { store } from '../../store';

function TimerPopout({ authUser, darkMode, TimerComponent }) {
  const popupRef = useRef(null);
  const rootRef = useRef(null);

  // Sanitize CSS content to prevent CSS injection attacks
  const sanitizeCSS = cssText => {
    if (!cssText || typeof cssText !== 'string') return '';

    // Remove potentially dangerous CSS properties and values
    const dangerousPatterns = [
      /javascript:/gi,
      /data:/gi,
      /vbscript:/gi,
      /expression\s*\(/gi,
      /@import/gi,
      /behavior\s*:/gi,
      /-moz-binding/gi,
    ];

    let sanitized = cssText;
    dangerousPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return DOMPurify.sanitize(sanitized, { ALLOWED_TAGS: [] });
  };

  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
      }
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  if (typeof window !== 'undefined' && window.opener) {
    return null;
  }

  const openPopoutWindow = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    const features = {
      width: 200,
      height: 200,
      left: window.screen.width / 2 - 200,
      top: window.screen.height / 2 - 220,
      menubar: 'no',
      toolbar: 'no',
      location: 'no',
      status: 'no',
      resizable: 'yes',
    };

    const featuresStr = Object.entries(features)
      .map(([key, value]) => `${key}=${value}`)
      .join(',');

    const popup = window.open('', 'Timer', featuresStr);

    popupRef.current = popup;

    popup.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timer</title>
        </head>
        <body class="timer-popout-body">
          <div id="timer-root"></div>
        </body>
      </html>
    `);

    // Add all stylesheets from the main window to the popout window
    Array.from(window.document.styleSheets).forEach(styleSheet => {
      try {
        const cssRules = Array.from(styleSheet.cssRules)
          .map(rule => sanitizeCSS(rule.cssText))
          .filter(Boolean)
          .join('');
        const style = popup.document.createElement('style');
        style.textContent = cssRules;
        popup.document.head.appendChild(style);
      } catch (e) {
        // This can happen with CORS stylesheets
        // Silently ignore CORS errors when copying stylesheets
      }
    });

    const root = popup.document.getElementById('timer-root');
    const reactRoot = createRoot(root);
    rootRef.current = reactRoot;

    reactRoot.render(
      <Provider store={store}>
        <TimerComponent authUser={authUser} darkMode={darkMode} isPopout />
      </Provider>,
    );

    popup.onbeforeunload = () => {
      if (rootRef.current) {
        rootRef.current.unmount();
      }
    };
  };

  return (
    <button
      type="button"
      onClick={openPopoutWindow}
      className={styles.btnDiv}
      aria-label="Open timer in new window"
    >
      <FaExternalLinkAlt
        className={cs(styles.transitionColor, styles.btn)}
        fontSize="1.5rem"
        title="Open timer in new window"
      />
    </button>
  );
}

export default TimerPopout;
