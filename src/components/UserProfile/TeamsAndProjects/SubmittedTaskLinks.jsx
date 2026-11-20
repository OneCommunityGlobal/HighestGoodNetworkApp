import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { clsx } from 'clsx';
import appStyles from '~/App.module.css';
import styles from './UserProjectsTable.module.css';

const popupHelp = 'Allow pop-ups for this site or Command/Ctrl-click a link to open it in a tab.';

const isWebLink = link => {
  if (typeof link !== 'string') return false;
  try {
    const { protocol } = new URL(link);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
};

const openLinkWindow = url => {
  // Opening a blank window lets us detect a blocked popup and detach its opener before navigation.
  const popup = window.open('about:blank', '_blank', 'popup,width=1000,height=750');
  if (!popup || popup.closed) return false;

  popup.opener = null;
  popup.location.replace(url);
  return true;
};

const openOnClick = (event, onBlocked) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  event.preventDefault();
  if (!openLinkWindow(event.currentTarget.href)) onBlocked();
};

function SubmittedTaskLinks({ taskName, links, darkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const titleId = useId();
  const urls = Array.isArray(links) ? links.filter(isWebLink) : [];
  if (!urls.length) return null;

  if (urls.length === 1) {
    return (
      <a
        href={urls[0]}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.submittedLinkIcon}
        aria-label={`Open submitted link for ${taskName} (opens in a new window)`}
        onClick={event =>
          openOnClick(event, () => toast.warn(`The browser blocked the window. ${popupHelp}`))
        }
      >
        <FaLink aria-hidden="true" />
      </a>
    );
  }

  const close = () => {
    setIsOpen(false);
    setPopupMessage('');
  };

  const openAll = () => {
    const blocked = urls.filter(url => !openLinkWindow(url)).length;
    setPopupMessage(
      blocked ? `${blocked} of ${urls.length} windows were blocked. ${popupHelp}` : '',
    );
  };

  return (
    <>
      <button
        type="button"
        className={styles.submittedLinkIcon}
        aria-label={`View submitted links for ${taskName}`}
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        <FaLink aria-hidden="true" />
      </button>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          toggle={close}
          labelledBy={titleId}
          backdrop="static"
          keyboard={false}
          trapFocus
          fade={false}
          scrollable
          contentClassName={clsx(darkMode && [appStyles['bg-yinmn-blue'], 'text-light'])}
        >
          <ModalHeader id={titleId} className={clsx(darkMode && appStyles['bg-space-cadet'])}>
            Submitted links for {taskName}
          </ModalHeader>
          <ModalBody>
            <ul className={styles.submittedLinks}>
              {urls.map((url, index) => (
                <li key={`${url}-${index}`}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={event => {
                      setPopupMessage('');
                      openOnClick(event, () =>
                        setPopupMessage(`The browser blocked the window. ${popupHelp}`),
                      );
                    }}
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
            <div role="status">{popupMessage}</div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" color="primary" onClick={openAll}>
              Open All
            </Button>
            <Button type="button" color="secondary" onClick={close}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}

SubmittedTaskLinks.propTypes = {
  taskName: PropTypes.string,
  links: PropTypes.arrayOf(PropTypes.string),
  darkMode: PropTypes.bool,
};

export default SubmittedTaskLinks;
