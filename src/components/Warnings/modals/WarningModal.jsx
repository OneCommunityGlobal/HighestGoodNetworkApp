/* eslint-disable no-alert */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

function WarningModal({
  setToggleModal,
  visible,
  warning,
  handleIssueWarning,
  deleteWarningTriggered,
  deleteWarning,
  numberOfWarnings,
}) {
  const { colorAssigned, warningText, username } = warning || {};

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
          <h3>
            Are you sure you want to issue a {numberOfWarnings >= 3 ? 'blue square' : 'warning'} to:{' '}
            {username}?
          </h3>
          <p>
            The {numberOfWarnings >= 3 ? 'blue square' : 'warning'} will be because they didn&apos;t
            meet the criteria for the following area:{' '}
            <span className="warning__body--bold">{warningText}</span>
          </p>
          {numberOfWarnings >= 3 && (
            <>
              <p className="warning__body--bold warning__body--margin"> Plase Note:</p>
              <p>
                <span className="warning__body--bold">{username}</span> has received{' '}
                {numberOfWarnings} warnings, so by default they should get a blue square. If it has
                been a while since their last warning, you may issue another warning instead.
              </p>
            </>
          )}
          <p>
            Issue a warning and the dot color will be:{' '}
            <span className="warning__body--bold">Yellow</span>
          </p>
          <p>
            Issue a blue square and the dot color will be:{' '}
            <span className="warning__body--bold">Red</span>
          </p>
        </ModalBody>

        <ModalFooter className="warning-modal-footer">
          {/* <Button
            onClick={() => {
              handleIssueWarning(warning);
              // subtmit wanring here to backend
              setToggleModal(false);
            }}
          >
            Log Warning Only
          </Button> */}

          <Button
            onClick={() => {
              // email will be sent and logged
              handleIssueWarning({ ...warning, colorAssigned: 'yellow' });
              setToggleModal(false);
            }}
            color="warning"
            className="warning__modal__footer__btn"
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
            className="warning__modal__footer__btn"
          >
            Issue Blue Square
          </Button>
          <Button
            onClick={() => setToggleModal(false)}
            color="danger"
            className="warning__modal__footer__btn cancel__btn "
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default WarningModal;
