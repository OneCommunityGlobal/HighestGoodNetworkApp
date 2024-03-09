import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

function WarningModal({
  setToggleModal,
  visible,
  warning,
  handleIssueWarning,
  deleteWarningTriggered,
  deleteWarning,
}) {
  const { today, id, colorAssigned, warningText, username } = warning || {};

  if (deleteWarning) {
    return (
      <Modal isOpen={visible} toggle={() => setToggleModal(false)}>
        <ModalHeader>Delete Warning</ModalHeader>
        <ModalBody>
          <h2>Are you sure you want to delete this warning?</h2>
        </ModalBody>

        <ModalFooter>
          <Button onClick={() => setToggleModal(false)} color="danger">
            Cancel
          </Button>

          <Button
            onClick={() => {
              deleteWarningTriggered();
              setToggleModal(false);
            }}
            color="primary"
          >
            Delete Warning
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <div>
      <Modal isOpen={visible} toggle={() => setToggleModal(false)}>
        <ModalHeader>Issue Warning</ModalHeader>
        <ModalBody>
          <h3>Are you sure you want to issue a warning to: {username}?</h3>
          <p>
            The warning will be because they didn&apos;t meet the criteria for the following
            warning: {warningText}
          </p>
          <p>The color will be {colorAssigned}</p>
        </ModalBody>

        <ModalFooter className="warning-modal-footer">
          <Button
            onClick={() => {
              handleIssueWarning(warning);
              // subtmit wanring here to backend
              setToggleModal(false);
            }}
          >
            Log Warning Only
          </Button>

          <Button
            onClick={() => {
              // email will be sent and logged
              alert('EMAIL SENT!!');
              handleIssueWarning({ ...warning, colorAssigned: 'yellow' });
              setToggleModal(false);
            }}
            color="warning"
          >
            Issue Warning
          </Button>

          <Button
            onClick={() => {
              alert('BLUE SQUARE ISSUED!!');
              handleIssueWarning({ ...warning, colorAssigned: 'red' });
              setToggleModal(false);
            }}
            color="primary"
          >
            Issue Blue Square
          </Button>
          <Button onClick={() => setToggleModal(false)} color="danger">
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default WarningModal;
