import { FaExternalLinkAlt } from 'react-icons/fa';
import ReactDOM from 'react-dom';
import { useRef, useEffect } from 'react';
import cs from 'classnames';
import styles from './Timer.module.css';

function TimerPopout({ authUser, darkMode, TimerComponent }) {
  const popupRef = useRef(null);

  const openPopoutWindow = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
      return;
    }

    const features = {
      width: 300,
      height: 200,
      right: window.screen.width - 350,
      top: 30,
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
          <link rel="stylesheet" href="${window.location.origin}/Timer.module.css">
          ${darkMode ? '<style>body { background-color: #1a1a2e; color: white; }</style>' : ''}
        </head>
        <body>
          <h1 style="text-align: center;">Timer</h1>
          <div id="timer-root"></div>
        </body>
      </html>
    `);

    const root = popup.document.getElementById('timer-root');
    ReactDOM.render(<TimerComponent authUser={authUser} darkMode={darkMode} />, root);

    popup.onbeforeunload = () => {
      ReactDOM.unmountComponentAtNode(root);
    };
  };

  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

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
