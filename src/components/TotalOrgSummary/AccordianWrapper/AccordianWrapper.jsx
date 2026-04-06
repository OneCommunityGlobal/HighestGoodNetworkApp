import Collapsible from 'react-collapsible';
import { useSelector } from 'react-redux';
import './AccordianWrapper.module.css';

export default function AccordianWrapper({ children, title }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <Collapsible
      open
      className={`${styles['accordion-wrapper']} ${darkMode ? 'bg-space-cadet text-light' : ''}`}
      openedClassName={`${styles['accordion-wrapper']} ${
        darkMode ? 'bg-space-cadet text-light' : ''
      }`}
      trigger={title}
      triggerClassName={`accordian-trigger ${darkMode ? 'text-light' : ''}`}
      triggerOpenedClassName={`accordian-trigger ${darkMode ? 'text-light' : ''}`}
    >
      {children}
    </Collapsible>
  );
}
