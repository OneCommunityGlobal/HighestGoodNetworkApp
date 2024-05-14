import './PermissionsManagement.css';
import { ModalContext } from 'context/ModalContext';
import { useContext } from 'react';

const ReminderModal = ({ setReminderModal, reminderModal, updateProfileOnSubmit }) => {
  const { modalStatus, updateModalStatus } = useContext(ModalContext);

  return (
    <div className='ContainerReminder'>
      <div className='ReminderTitle'>
        <h2>Remember to save your changes?</h2>
      </div>
      <div className='ReminderBody'>
        <span>Remind people they need to log out and back in to see them take effect.</span>
      </div>
      <div className='ReminderButton'>
        <button onClick={() => updateModalStatus(!modalStatus)}>Close</button>
        <button onClick={(e) => { updateProfileOnSubmit(e); setReminderModal(!reminderModal); updateModalStatus(!modalStatus) }}>Save Changes</button>
      </div>
    </div>
  );
}

export default ReminderModal;