import RegistrationForm from './RegistrationForm';
import ResourceMonitoring from './ResourceMonitoring';
import LatestRegistration from './LatestRegistration';
import MyEvent from './MyEvent';
import styles from './styles.module.css';

function ActivitiesPage() {
  return (
    <div className={`${styles.activitiesPage}`}>
      <header className={`${styles.header}`}>
        <h1 className={styles.headerTitle}>Event Registrations</h1>
      </header>

      <ResourceMonitoring />

      <div className="middle-section">
        <RegistrationForm />
      </div>

      <div className="main-content">
        <LatestRegistration />
        <MyEvent />
      </div>
    </div>
  );
}

export default ActivitiesPage;
