import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'

/**
 * Modal displaying information about how time entry works
 * @param {*} props 
 * @param {Boolean} props.visible 
 * @param {Func} props.setVisible
 * @param {*} props.reminder 
 * @param {*} props.edit 
 * @param {*} props.inputs
 */
const ReminderModal = (props) => {
  return (
    <Modal isOpen={props.visible}>
      <ModalHeader>Reminder</ModalHeader>
      <ModalBody>{props.reminder.remind}</ModalBody>
      <ModalFooter>
        <Button onClick={() => props.setVisible(false)} color="primary">
          Close
        </Button>
        {props.edit &&
          (props.data.hours !== props.inputs.hours || props.data.minutes !== props.inputs.minutes) && (
            <Button onClick={cancelChange} color="secondary">
              Cancel
            </Button>
          )}
      </ModalFooter>
    </Modal>
  );
};

export default ReminderModal;
