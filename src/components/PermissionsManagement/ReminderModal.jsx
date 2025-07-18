/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/button-has-type */
import './PermissionsManagement.css';
import { useContext } from 'react';
import { ModalContext } from '~/context/ModalContext';

function ReminderModal({
  setReminderModal,
  reminderModal,
  updateProfileOnSubmit,
  changedAccount,
  darkMode,
}) {
  const { modalStatus, updateModalStatus } = useContext(ModalContext);

  return (
    <div className="ContainerReminder">
      <div className="ReminderTitle">
        <h2>Remember to Save Your Changes!</h2>
      </div>
      <div className={`ReminderBody ${darkMode ? 'text-space-cadet' : ''}`}>
        <span>
          Please log out and log back in to your account, {changedAccount} to apply the changes.
        </span>
      </div>
      <div className="ReminderButton">
        <button
          onClick={e => {
            updateProfileOnSubmit(e);
            setReminderModal(!reminderModal);
            updateModalStatus(!modalStatus);
          }}
        >
          Save Changes
        </button>

        <button onClick={() => updateModalStatus(!modalStatus)}>Close</button>
      </div>
    </div>
  );
}

export default ReminderModal;
