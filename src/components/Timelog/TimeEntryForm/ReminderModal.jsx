import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { boxStyle } from 'styles';

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
  return (
    <Modal isOpen={props.visible}>
      <ModalHeader>Reminder</ModalHeader>
      <ModalBody>{props.reminder.remind}</ModalBody>
      <ModalFooter>
        <Button onClick={() => props.setVisible(false)} color="danger" style={boxStyle}>
          Continue
        </Button>
        {props.edit &&
          (props.data.hours !== props.inputs.hours ||
            props.data.minutes !== props.inputs.minutes) && (
            <Button onClick={props.cancelChange} color="primary" style={boxStyle}>
              Cancel
            </Button>
          )}
      </ModalFooter>
    </Modal>
  );
};

export default ReminderModal;
