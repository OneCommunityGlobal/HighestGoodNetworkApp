import AddActivityForm from './AddActivityForm';
import styles from './AddActivities.module.css';

export default function AddActivies() {
  return (
    <main className={`${styles.addToolContainer}`}>
      <header className={`${styles.addToolHeader}`}>
        <h2>ADD TYPE: TOOL</h2>
      </header>
      <AddActivityForm />
    </main>
  );
}
