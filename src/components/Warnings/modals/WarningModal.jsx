/* eslint-disable no-alert */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import WarningItem from '../WarningItem';
import getOrdinal from '../../../utils/getOrdinal';
import '../Warnings.css';
function WarningModal({
  setToggleModal,
  visible,
  warning,
  handleIssueWarning,
  deleteWarningTriggered,
  deleteWarning,
  numberOfWarnings,
  userProfileHeader,
  userProfileModal,
}) {
  const { warningText, username } = warning || {};

  const [times, ordinal] = getOrdinal(numberOfWarnings + 1);
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
        {userProfileHeader ? (
          <ModalHeader className="modal__header--center">
            {times + ordinal} Occurance - Choose an action{' '}
          </ModalHeader>
        ) : (
          <ModalHeader>Issue Warning</ModalHeader>
        )}
        <ModalBody>
          <h3>
            Are you sure you want to issue a {numberOfWarnings >= 3 ? 'blue square' : 'warning'} to:{' '}
            {username}?
          </h3>
          <p>
            The {numberOfWarnings >= 3 ? 'blue square' : 'warning'} will be because they didn&apos;t
            meet the criteria for the following area:{' '}
            <span className="warning__body--bold">
              {times}x {warningText}
            </span>
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

          {userProfileModal && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <p style={{ margin: 0 }}>Current Track Record</p>
              <WarningItem warnings={warning.warnings} userProfileModal={true} />
            </div>
          )}
        </ModalBody>

        <ModalFooter className="warning-modal-footer">
          {numberOfWarnings >= 8 ? (
            <div>
              <p className="warning__body--bold warning__body--margin"> Plase Note:</p>
              <p> the user has received the maximum number of warnings for this category</p>
              <p>please select another one in order to issue a warning</p>
            </div>
          ) : (
            <>
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
                  // alert('BLUE SQUARE ISSUED!!');
                  handleIssueWarning({ ...warning, colorAssigned: 'red' });
                  setToggleModal(false);
                }}
                color="primary"
                className="warning__modal__footer__btn"
              >
                Issue Blue Square
              </Button>
            </>
          )}
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
