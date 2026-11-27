import Collapsible from 'react-collapsible';
import { useSelector } from 'react-redux';
import styles from './AccordianWrapper.module.css';

export default function AccordianWrapper({ children, title, section }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const triggerClasses = `accordian-trigger ${
    section ? `org-section-header org-section-${section}` : ''
  } ${darkMode ? 'text-light' : ''}`;

  return (
    <Collapsible
      open
      className={`${styles['accordion-wrapper']} ${darkMode ? 'bg-space-cadet text-light' : ''}`}
      openedClassName={`${styles['accordion-wrapper']} ${
        darkMode ? 'bg-space-cadet text-light' : ''
      }`}
      trigger={title}
      triggerClassName={triggerClasses}
      triggerOpenedClassName={triggerClasses}
    >
      {children}
    </Collapsible>
  );
}
