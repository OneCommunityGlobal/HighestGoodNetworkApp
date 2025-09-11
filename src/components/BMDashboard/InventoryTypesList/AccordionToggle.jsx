import { useContext } from 'react';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import styles from './TypesList.module.css';

export default function AccordionToggle({ children, eventKey, callback }) {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(eventKey, () => callback && callback(eventKey));

  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <button type="button" className={`${styles.cardHeader}`} onClick={decoratedOnClick}>
      {isCurrentEventKey ? (
        <FaChevronUp className={`${styles.arrowIcon}`} />
      ) : (
        <FaChevronDown className={`${styles.arrowIcon}`} />
      )}
      {children}
    </button>
  );
}
