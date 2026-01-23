import RegistrationForm from './RegistrationForm';
import ResourceMonitoring from './ResourceMonitoring';
import LatestRegistration from './LatestRegistration';
import MyEvent from './MyEvent';
import styles from './Activitiesstyles.module.css';

function ActivitiesPage() {
  return (
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
  );
}

export default ActivitiesPage;
