import { useSelector } from 'react-redux';
import AddToolForm from './AddToolForm';
import styles from './AddTool.module.css';

export default function AddTool() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <main className={`${styles.addToolContainer} ${darkMode ? styles.addToolContainerDark : ''}`}>
      <header className={`${styles.addToolHeader}`}>
        <h2>ADD TYPE: TOOL</h2>
      </header>
      <AddToolForm />
    </main>
  );
}
