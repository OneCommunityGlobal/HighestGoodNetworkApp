import Collapsible from 'react-collapsible';
import './AccordianWrapper.css';

export default function AccordianWrapper({ children, title }) {
  return <Collapsible trigger={title}>{children}</Collapsible>;
}
