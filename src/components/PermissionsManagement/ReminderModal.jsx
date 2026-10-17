/* eslint-disable react/button-has-type */
import styles from './PermissionsManagement.module.css';
import { ModalContext } from '~/context/ModalContext';
import { useContext } from 'react';

function ReminderModal({
  setReminderModal,
  reminderModal,
  updateProfileOnSubmit,
  changedAccount,
  darkMode,
}) {
  const { modalStatus, updateModalStatus } = useContext(ModalContext);

  return (
    <div
      className={styles['ContainerReminder']}
      style={darkMode ? { backgroundColor: '#1b2a41', borderColor: '#3a506b' } : {}}
    >
      <div className={styles['ReminderTitle']}>
        <h2 style={darkMode ? { color: '#ffffff' } : {}}>Remember to Save Your Changes!</h2>
      </div>
      <div
        className={`${styles['ReminderBody']} ${darkMode ? styles['text-space-cadet'] : ''}`}
        style={darkMode ? { color: '#e2e8f0', borderColor: '#3a506b' } : {}}
      >
        <span>
          Please log out and log back in to your account, {changedAccount} to apply the changes.
        </span>
      </div>
      <div className={styles['ReminderButton']}>
        <button
          style={darkMode ? { backgroundColor: '#1a6fc4', color: '#fff' } : {}}
          onClick={e => {
            updateProfileOnSubmit(e);
            setReminderModal(!reminderModal);
            updateModalStatus(!modalStatus);
          }}
        >
          Save Changes
        </button>

        <button
          style={darkMode ? { backgroundColor: '#c0392b', color: '#fff' } : {}}
          onClick={() => updateModalStatus(!modalStatus)}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ReminderModal;
