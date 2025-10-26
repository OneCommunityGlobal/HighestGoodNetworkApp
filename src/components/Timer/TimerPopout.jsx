import { FaExternalLinkAlt } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import cs from 'classnames';
import { Provider } from 'react-redux';
import { Modal, ModalBody } from 'reactstrap';
import styles from './Timer.module.css';
import { store } from '../../store';

function TimerPopout({ authUser, darkMode, TimerComponent }) {
  const [isOpen, setIsOpen] = useState(false);
  const originalWindowCloseRef = useRef(null);

  const openPopout = () => setIsOpen(true);
  const closePopout = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!originalWindowCloseRef.current) originalWindowCloseRef.current = window.close;
    window.close = closePopout;
    return () => {
      window.close = originalWindowCloseRef.current || window.close;
    };
  }, [isOpen]);

  if (typeof window !== 'undefined' && window.opener) return null;

  return (
    <>
      <button
        type="button"
        onClick={openPopout}
        className={styles.btnDiv}
        aria-label="Open timer in popout"
        title="Open timer in popout"
      >
        <FaExternalLinkAlt className={cs(styles.transitionColor, styles.btn)} fontSize="1.5rem" />
      </button>

      <Modal
        isOpen={isOpen}
        toggle={closePopout}
        size="sm"
        contentClassName="p-0 border-0 bg-transparent shadow-none"
        modalClassName="d-flex justify-content-center"
        style={{
          maxWidth: 'fit-content',
          marginTop: '20px',
        }}
      >
        <ModalBody
          className="p-0 m-0 bg-transparent"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'visible',
          }}
        >
          <div
            id="timer-root"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Provider store={store}>
              <TimerComponent authUser={authUser} darkMode={darkMode} isPopout />
            </Provider>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}

export default TimerPopout;
