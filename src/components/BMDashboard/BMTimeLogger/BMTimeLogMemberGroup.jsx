import { useState } from 'react';
import { Collapse } from 'reactstrap';
import styles from './BMTimeLogCard.module.css';

// Collapse keeps its children mounted, so running timers keep their state while a group is closed
function BMTimeLogMemberGroup({ label, memberCount, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className={`${styles.memberGroup}`}>
      <button
        type="button"
        className={`${styles.memberGroupHeader}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(open => !open)}
      >
        <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span> {label} ({memberCount})
      </button>
      <Collapse isOpen={isOpen}>{children}</Collapse>
    </section>
  );
}

export default BMTimeLogMemberGroup;
