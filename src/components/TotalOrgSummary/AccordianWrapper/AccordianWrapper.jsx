import Collapsible from 'react-collapsible';
import styles from './AccordianWrapper.module.css';
import { useSelector } from 'react-redux';

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
    >
      {children}
    </Collapsible>
  );
}
