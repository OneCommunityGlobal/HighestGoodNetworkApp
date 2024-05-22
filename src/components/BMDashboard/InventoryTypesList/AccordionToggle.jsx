import { useContext } from 'react';
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

export default function AccordionToggle({ children, eventKey, callback }) {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(eventKey, () => callback && callback(eventKey));

  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <button type="button" className="card-header" onClick={decoratedOnClick}>
      {isCurrentEventKey ? (
        <FaChevronUp className="arrow-icon " />
      ) : (
        <FaChevronDown className="arrow-icon " />
      )}
      {children}
    </button>
  );
}
