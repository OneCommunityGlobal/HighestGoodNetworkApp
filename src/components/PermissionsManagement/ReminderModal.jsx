import './PermissionsManagement.css';
import { ModalContext } from 'context/ModalContext';
import { useContext } from 'react';

const ReminderModal = ({ setReminderModal, reminderModal, updateProfileOnSubmit, changedAccount }) => {
  const { modalStatus, updateModalStatus } = useContext(ModalContext);

  return (
    <div className='ContainerReminder'>
      <div className='ReminderTitle'>
        <h2>Remember to save your changes!</h2>
      </div>
      <div className='ReminderBody'>
        <span>Please log out and log back into the {changedAccount} account to see the changes.</span>
      </div>
      <div className='ReminderButton'>
        <button onClick={(e) => { updateProfileOnSubmit(e); setReminderModal(!reminderModal); updateModalStatus(!modalStatus) }}>Save Changes</button>
        
        <button onClick={() => updateModalStatus(!modalStatus)}>Close</button>
        
      </div>
    </div>
  );
}

export default ReminderModal;