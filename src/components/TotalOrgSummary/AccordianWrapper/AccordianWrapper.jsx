import Collapsible from 'react-collapsible';
import { useSelector } from 'react-redux';
import './AccordianWrapper.module.css';

export default function AccordianWrapper({ children, title }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <Collapsible
      open
      className={darkMode ? 'bg-space-cadet text-light' : ''}
      openedClassName={darkMode ? 'bg-space-cadet text-light' : ''}
      trigger={title}
    >
      {children}
    </Collapsible>
  );
}
