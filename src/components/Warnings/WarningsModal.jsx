/* eslint-disable no-unused-vars */
/* eslint-disable spaced-comment */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/destructuring-assignment */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row } from 'reactstrap';

/**
 * Modal displaying information about how time entry works
 * @param {*} props
 * @param {Boolean} props.visible
 * @param {Func} props.setVisible
 */
function WarningsModal({
  setToggleModal,
  visible,
  deleteWarning,
  deleteWarningTriggered,
  warning,
  handleIssueWarning,
  warningsModal,
  warningDescriptions,
  setWarningsModal,
  handleDeleteDescription,
}) {
  const { today, id, colorAssigned, warningText, username } = warning || {};

  console.log('delete warnings', deleteWarning);
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
  } else if (warningsModal) {
    console.log('inside warnifns modal');
    return (
      <Modal isOpen={warningsModal} toggle={() => setWarningsModal(false)}>
        <ModalHeader>Current Warning Descriptions</ModalHeader>
        <ModalBody>
          {warningDescriptions.map((warning, index) => (
            <div className="warnings__descriptions" key={warning}>
              <p>{warning}</p>
              <Button color="danger" onClick={handleDeleteDescription}>
                x
              </Button>
            </div>
          ))}

          <Button>Add new</Button>
        </ModalBody>

        <ModalFooter>
          <Button color="danger" onClick={() => setWarningsModal(false)}>
            Cancel
          </Button>

          {/* <Button
            onClick={() => {
              setToggleModal(false);
            }}
            color="primary"
          >
            Delete Warning
          </Button> */}
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
            warning: "{warningText}"
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
              //email will be sent and logged
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

export default WarningsModal;
