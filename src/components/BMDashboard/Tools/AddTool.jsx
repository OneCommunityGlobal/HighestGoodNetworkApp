import AddToolForm from './AddToolForm';
import styles from './AddTool.module.css';

export default function AddTool() {
  return (
    <main className={`${styles.addToolContainer}`}>
      <header className={`${styles.addToolHeader}`}>
        <h2>ADD TYPE: TOOL</h2>
      </header>
      <AddToolForm />
    </main>
  );
}
