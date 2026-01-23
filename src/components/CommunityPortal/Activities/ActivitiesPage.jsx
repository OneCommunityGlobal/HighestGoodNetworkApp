import RegistrationForm from './RegistrationForm';
import ResourceMonitoring from './ResourceMonitoring';
import LatestRegistration from './LatestRegistration';
import MyEvent from './MyEvent';
import styles from './Activitiesstyles.module.css';
import { useSelector } from 'react-redux';
function ActivitiesPage() {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div className={`${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.activitiesPage}`}>
        <header className={`${styles.header}`}>
          <h1>Event Registrations</h1>
        </header>

        <ResourceMonitoring />

        <div className={`${styles.middleSection}`}>
          <RegistrationForm />
        </div>

        <div className={`${styles.mainContent}`}>
          <LatestRegistration />
          <MyEvent />
        </div>
      </div>
    </div>
  );
}

export default ActivitiesPage;
