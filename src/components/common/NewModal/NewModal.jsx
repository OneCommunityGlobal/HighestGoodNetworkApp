import { useRef } from 'react';
import Popup from 'reactjs-popup';
import styles from './NewModal.module.css';

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
      <div className={`${styles.popupModalWrapper}`}>
        <div className={`${styles.popupHeader}`}>
          <h5 style={{ margin: 0 }}>{header}</h5>
          <div
            onClick={closePopup}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                closePopup();
              }
            }}
            tabIndex={0}
            className={`${styles.closeIcon}`}
            role="button"
          >
            &#x2715;
          </div>
        </div>
        <div className={`${styles.popupContentWrapper}`}>{children}</div>
        <div className={`${styles.popupModalFooter}`}>
          <button type="button" className={`${styles.popupCloseButton}`} onClick={closePopup}>
            Close
          </button>
        </div>
      </div>
    </Popup>
  );
};
export default NewModal;
