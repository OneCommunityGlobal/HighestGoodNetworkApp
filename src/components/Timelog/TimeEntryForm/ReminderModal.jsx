import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

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
  const { edit, visible, data, inputs, reminder, cancelChange, setVisible } = props;
  return (
    <Modal isOpen={visible}>
      <ModalHeader>Reminder</ModalHeader>
      <ModalBody>{reminder.remind}</ModalBody>
      <ModalFooter>
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
