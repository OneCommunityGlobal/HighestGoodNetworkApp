import { useRef } from 'react';
import Popup from 'reactjs-popup';
import './NewModal.css';

// eslint-disable-next-line react/function-component-definition
const NewModal = ({ header, children, trigger }) => {
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
      contentStyle={{ height: '85vh', borderRadius: '8px', width: 'auto' }}
    >
      <div className="popup-modal-wrapper">
        <div className="popup-header">
          <h5 style={{ margin: 0 }}>{header}</h5>
          <div onClick={closePopup}
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
        <div className="popup-content-wrapper">{children}</div>
        <div className="popup-modal-footer">
          <button type="button" className="popup-close-button" onClick={closePopup}>
            Close
          </button>
        </div>
      </div>
    </Popup>
  );
};
export default NewModal;
