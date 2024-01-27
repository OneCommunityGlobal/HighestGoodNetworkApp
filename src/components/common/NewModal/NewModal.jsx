import { useRef } from 'react';
import Popup from 'reactjs-popup';
import './NewModal.css';

export default function NewModal({ header, children, trigger }) {
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
          <button onClick={closePopup} className="close-icon" type="button">
            &#x2715;
          </button>
        </div>
        <div className="popup-content-wrapper">{children}</div>
        <div className="popup-modal-footer">
          <button className="popup-close-button" onClick={closePopup} type="button">
            Close
          </button>
        </div>
      </div>
    </Popup>
  );
}
