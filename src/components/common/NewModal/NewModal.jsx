import { useRef } from 'react';
import { Popup } from 'reactjs-popup';
import './NewModal.css';

// eslint-disable-next-line react/function-component-definition
const NewModal = ({ header, children, trigger, darkMode }) => {
  const popupRef = useRef(null);

  const closePopup = () => {
    popupRef.current.close();
  };

  return (
    <Popup
      lockScroll
      trigger={trigger}
      modal
      arrow
      ref={popupRef}
      contentStyle={{
        height: '85vh',
        borderRadius: '8px',
        width: 'auto',
        border: darkMode ? '1.5px solid #444' : undefined,
        background: darkMode ? '#232946' : undefined,
        color: darkMode ? '#fff' : undefined,
      }}
    >
      <div className={`popup-modal-wrapper ${darkMode ? 'popup-modal-dark' : ''}`}>
        <div className={`popup-header ${darkMode ? 'popup-header-dark' : ''}`}>
          <h5 style={{ margin: 0 }}>{header}</h5>
          <div
            onClick={closePopup}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                closePopup();
              }
            }}
            tabIndex={0}
            className="close-icon"
            role="button"
          >
            &#x2715;
          </div>
        </div>
        <div className={`popup-content-wrapper ${darkMode ? 'popup-content-dark' : ''}`}>
          {children}
        </div>
        <div className={`popup-modal-footer ${darkMode ? 'popup-footer-dark' : ''}`}>
          <button type="button" className="popup-close-button" onClick={closePopup}>
            Close
          </button>
        </div>
      </div>
    </Popup>
  );
};
export default NewModal;
