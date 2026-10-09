import { useRef, useState } from 'react';
import { Tooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './Participation.module.css';

function InfoTooltip({ content, placement = 'right' }) {
  const [isOpen, setIsOpen] = useState(false);
  const targetRef = useRef(null);

  return (
    <>
      <button
        ref={targetRef}
        type="button"
        className={styles.infoIcon}
        aria-label="More information"
        aria-expanded={isOpen}
        style={{
          border: 'none',
          padding: 0,
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <FontAwesomeIcon icon={faInfoCircle} />
      </button>

      <Tooltip
        target={() => targetRef.current}
        placement={placement}
        delay={{ show: 0, hide: 500 }}
        autohide={false}
        isOpen={isOpen}
        toggle={() => setIsOpen(prev => !prev)}
      >
        {content}
      </Tooltip>
    </>
  );
}

export default InfoTooltip;
