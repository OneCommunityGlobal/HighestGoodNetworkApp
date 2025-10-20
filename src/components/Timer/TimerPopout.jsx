import { FaExternalLinkAlt } from 'react-icons/fa';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useRef, useEffect } from 'react';
import cs from 'classnames';
import { Provider } from 'react-redux';
import styles from './Timer.module.css';
import './Countdown.module.css';
import { store } from '../../store';

function TimerPopout({ authUser, darkMode, TimerComponent }) {
  const popupRef = useRef(null);

  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  if (typeof window !== 'undefined' && window.opener) {
    return null;
  }

  const openPopoutWindow = () => {
    try {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.focus();
        return;
      }

      const features = {
        width: 350,
        height: 500,
        left: window.screen.width / 2 - 175,
        top: window.screen.height / 2 - 250,
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

      if (!popup) {
        // Popup was blocked
        return;
      }

      popupRef.current = popup;

      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Timer</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                width: 100%;
                height: 100%;
              }
              #timer-root {
                width: 100vw;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
                position: relative;
              }
              /* Perfect timer alignment and centering */
              #timer-root > div {
                transform-origin: center center !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) scale(1) !important;
              }
            </style>
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
            .map(rule => rule.cssText)
            .join('');
          const style = popup.document.createElement('style');
          style.textContent = cssRules;
          popup.document.head.appendChild(style);
        } catch (e) {
          // This can happen with CORS stylesheets
          // Silently ignore CORS errors when copying stylesheets
        }
      });

      const rootElement = popup.document.getElementById('timer-root');
      const root = createRoot(rootElement);

      root.render(
        <Provider store={store}>
          <TimerComponent authUser={authUser} darkMode={darkMode} isPopout />
        </Provider>,
      );

      // Perfect responsive scaling and centering function
      const updateTimerScale = () => {
        const timerElement = popup.document.querySelector('#timer-root > div');
        if (timerElement) {
          const windowWidth = popup.innerWidth;
          const windowHeight = popup.innerHeight;

          // Calculate optimal scale to fit popup perfectly
          const timerWidth = 280; // Base timer width
          const timerHeight = 400; // Base timer height

          const scaleX = windowWidth / timerWidth;
          const scaleY = windowHeight / timerHeight;

          // Use smaller scale to ensure it fits in both dimensions
          const scale = Math.min(scaleX, scaleY) * 0.9; // 90% for better margin

          // Apply constraints
          const finalScale = Math.max(0.3, Math.min(scale, 2.0));

          // Apply transform with perfect centering
          timerElement.style.transform = `translate(-50%, -50%) scale(${finalScale})`;
          timerElement.style.position = 'absolute';
          timerElement.style.top = '50%';
          timerElement.style.left = '50%';
        }
      };

      // Apply scaling with multiple attempts
      setTimeout(updateTimerScale, 50);
      setTimeout(updateTimerScale, 200);

      // Update on resize
      popup.addEventListener('resize', updateTimerScale);

      popup.onbeforeunload = () => {
        root.unmount();
      };
    } catch (error) {
      // Handle popup errors silently
    }
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
