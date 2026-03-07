import Collapsible from 'react-collapsible';
import './AccordianWrapper.module.css';
import { useSelector } from 'react-redux';

export default function AccordianWrapper({ children, title }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <Collapsible
      open
      className={darkMode ? 'bg-space-cadet text-light' : ''}
      openedClassName={darkMode ? 'bg-space-cadet text-light' : ''}
      trigger={title}
      triggerClassName={`accordian-trigger ${darkMode ? 'text-light' : ''}`}
      triggerOpenedClassName={`accordian-trigger ${darkMode ? 'text-light' : ''}`}
    >
      {children}
    </Collapsible>
  );
}
