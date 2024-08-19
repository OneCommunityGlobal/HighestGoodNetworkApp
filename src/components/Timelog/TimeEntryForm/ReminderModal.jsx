import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap';

/**
 * Modal displaying information about how time entry works
 * @param {*} props
 * @param {Boolean} props.visible
 * @param {Func} props.setVisible
 * @param {*} props.reminder
 * @param {*} props.edit
 * @param {*} props.inputs
 * @param {Func} cancelChange
 */
const ReminderModal = props => {
  const { edit, visible, data, inputs, reminder, cancelChange, setVisible, darkMode } = props;
  return (
    <Modal isOpen={visible} className={darkMode ? 'text-light' : ''}>
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Reminder</ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{reminder.remind}</ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button onClick={() => setVisible(false)} color="danger">
          Continue
        </Button>
        {edit &&
          (data.hours !== inputs.hours ||
            data.minutes !== inputs.minutes) && (
            <Button onClick={cancelChange} color="primary">
              Cancel
            </Button>
          )}
      </ModalFooter>
    </Modal>
  );
};

export default ReminderModal;
