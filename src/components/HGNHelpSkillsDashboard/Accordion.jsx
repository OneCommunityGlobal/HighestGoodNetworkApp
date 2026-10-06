import PropTypes from 'prop-types';
import { useState } from 'react';
import styles from './style/CommunityMembersPage.module.css';

function Accordion({ title, children, defaultOpen = false, darkMode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.accordion}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`${styles.accordionHeader} ${darkMode ? styles.dark : ''}`}
      >
        <span className={styles.accordionTitle}>{title}</span>
        <span className={styles.accordionIcon}>{open ? '−' : '+'}</span>
      </button>
      {open && <div className={styles.accordionContent}>{children}</div>}
    </div>
  );
}

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  darkMode: PropTypes.bool,
};

export default Accordion;
