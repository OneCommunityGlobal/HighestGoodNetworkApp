/* eslint-disable no-alert */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import WarningIcons from '../WarningIcons';
import getOrdinal from '../../../utils/getOrdinal';
import '../Warnings.css';
import SliderToggle from './SliderToggle';

function WarningModal({
  setToggleModal,
  visible,
  warning,
  handleIssueWarning,
  handleDeleteWarning,
  userProfileHeader,
  userProfileModal,
  issueBothWarnings,
}) {
  const { id: warningId, numberOfWarnings, warningText, username, deleteWarning } = warning || {};

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
              handleDeleteWarning(warningId);
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
  if (issueBothWarnings) {
    return (
      <div>
        <Modal isOpen={visible} toggle={() => setToggleModal(false)}>
          {userProfileHeader ? (
            <ModalHeader className="modal__header--center">
              {issueBothWarnings ? null : `${times} + ${ordinal} occurance -`} Choose an action{' '}
            </ModalHeader>
          ) : (
            <ModalHeader>Issue Warning</ModalHeader>
          )}
          <ModalBody>
            <h3>
              Are you sure you want to issue a {numberOfWarnings >= 3 ? 'blue square' : 'warning'}{' '}
              to: {username}?
            </h3>
            <p>
              The {numberOfWarnings >= 3 ? 'blue square' : 'warning'} will be because they
              didn&apos;t meet the criteria for the following area:{' '}
              <span className="warning__body--bold">
                {issueBothWarnings ? null : `${times} + ${ordinal}`} {warningText}
              </span>
            </p>
            {numberOfWarnings >= 3 && (
              <>
                <p className="warning__body--bold warning__body--margin"> Plase Note:</p>
                <p>
                  <span className="warning__body--bold">{username}</span> has received{' '}
                  {numberOfWarnings} warnings, so by default they should get a blue square. If it
                  has been a while since their last warning, you may issue another warning instead.
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
                  justifyContent: 'start',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {warning.specialWarnings.map(warn => (
                  <div
                  // style={{
                  //   display: 'flex',
                  //   justifyContent: 'center',
                  //   alignItems: 'center',
                  // }}
                  >
                    <div
                      style={{
                        display: 'flex',
                      }}
                    >
                      <WarningIcons
                        warnings={warn.warnings}
                        userProfileModal={true}
                        warningText={warn.title}
                        key={warn.title}
                      />
                      <p>{warn.title}</p>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <SliderToggle />
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>

          <ModalFooter className="warning-modal-footer">
            <Button
              onClick={() => setToggleModal(false)}
              color="danger"
              className="warning__modal__footer__btn cancel__btn "
            >
              Cancel
            </Button>
            <Button
              onClick={() => setToggleModal(false)}
              color="primary"
              className="warning__modal__footer__btn cancel__btn "
            >
              Submit
            </Button>
          </ModalFooter>
        </Modal>
      </div>
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
              <p className="warning__modal__track__record">Current Track Record</p>
              <WarningIcons warnings={warning.warnings} userProfileModal />
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
