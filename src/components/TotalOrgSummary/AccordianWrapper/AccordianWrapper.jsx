import Collapsible from 'react-collapsible';
import './AccordianWrapper.css';

export default function AccordianWrapper({ children, title, className }) {
  return (
    <Collapsible className={className} trigger={title} triggerClassName={className}>
      {children}
    </Collapsible>
  );
}
