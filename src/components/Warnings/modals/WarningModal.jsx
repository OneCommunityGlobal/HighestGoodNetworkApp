/* eslint-disable no-alert */
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Form,
  Input,
  Label,
} from 'reactstrap';
import { useDispatch } from 'react-redux';
import hasPermission from '../../../utils/permissions';
import WarningIcons from '../WarningIcons';
import getOrdinal from '../../../utils/getOrdinal';
import styles from '../Warnings.module.css';

function WarningModal({
  setToggleModal,
  visible,
  warning,
  handleIssueWarning,
  handleDeleteWarning,
  userProfileHeader,
  userProfileModal,
  issueBothWarnings,
  handleWarningChange,
  handleSubmitWarning,
  numberOfWarnings,
  warningSelections,
}) {
  const { id: warningId, warningText, username, deleteWarning } = warning || {};
  const [times, ordinal] = getOrdinal(numberOfWarnings + 1);

  const dispatch = useDispatch();

  const canIssueTrackingWarnings = dispatch(hasPermission('issueTrackingWarnings'));
  const canIssueBlueSquare = dispatch(hasPermission('issueBlueSquare'));
  const canDeleteWarning = dispatch(hasPermission('deleteWarning'));

  const isFormComplete = () => {
    return warning.specialWarnings.every(warn => warningSelections[warn.title]);
  };

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
            disabled={!canDeleteWarning}
          >
            Delete Warning
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <div>
      <Modal
        isOpen={visible}
        toggle={() => setToggleModal(false)}
        size={`${issueBothWarnings ? 'lg' : 'md'}`}
      >
        {userProfileHeader ? (
          <ModalHeader className={`${styles['modal__header--center']}`}>
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
              <p className={`${styles['warning__body--bold']} ${styles['warning__body--margin']}`}>
                {' '}
                Please Note:
              </p>
              <p>
                <span className={`${styles['warning__body--bold']}`}>{username}</span> has received{' '}
                {numberOfWarnings} warnings, so by default they should get a blue square. If it has
                been a while since their last warning, you may issue another warning instead.
              </p>
            </>
          )}
          <p>
            Issue a warning and the dot color will be:{' '}
            <span className={`${styles['warning__body--bold']}`}>Yellow</span>
          </p>
          <p>
            Issue a blue square and the dot color will be:{' '}
            <span className={`${styles['warning__body--bold']}`}>Red</span>
          </p>
          {issueBothWarnings && (
            <div>
              {warning.specialWarnings.map(warn => (
                <div
                  style={{
                    alignItems: 'center',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    justifyContent: 'center',
                  }}
                  key={warn.title}
                >
                  <div
                    style={{
                      display: 'flex',
                      gridTemplate: '1',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <p
                      style={{
                        padding: 0,
                        margin: 0,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {warn.title}
                    </p>

                    <WarningIcons
                      warnings={warn.warnings}
                      userProfileModal
                      warningText={warn.title}
                    />
                  </div>

                  <div
                    style={{
                      gridColumn: 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Form
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {[
                        {
                          condition: warn.warnings.length < 2,
                          label: 'Log Warning',
                          value: 'Log Warning',
                          color: 'blue',
                        },
                        {
                          condition: warn.warnings.length >= 2,
                          label: 'Issue Warning',
                          value: 'Issue Warning',
                          color: 'yellow',
                        },
                        {
                          condition: warn.warnings.length >= 2,
                          label: 'Issue Blue Square',
                          value: 'Issue Blue Square',
                          color: 'red',
                        },
                      ]
                        .filter(item => item.condition) // Only render items where condition is true
                        .map((item, index) => (
                          <FormGroup
                            check
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexDirection: 'column',
                              gap: '0.5rem', // Adds spacing between label and input
                            }}
                          >
                            <Label
                              check
                              style={{
                                fontWeight: 'bold', // Optional for better visibility
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {item.label}
                            </Label>
                            <Input
                              name={`warningGroup-${warn.title}`} // Group by warning title
                              type="radio"
                              value={item.value}
                              onClick={e =>
                                handleWarningChange(warn.title, e.target.value, item.color)
                              }
                              style={{
                                margin: '2.5em 0 auto',
                              }}
                            />
                          </FormGroup>
                        ))}
                    </Form>
                  </div>
                </div>
              ))}
            </div>
          )}

          {userProfileModal && !issueBothWarnings && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
              }}
            >
              <p className={styles.warning__modal__track__record}>Current Track Record</p>
              <WarningIcons warnings={warning.warnings} userProfileModal />
            </div>
          )}
        </ModalBody>

        <ModalFooter className={`${styles['warning-modal-footer']}`}>
          {issueBothWarnings ? (
            <>
              <Button
                onClick={() => setToggleModal(false)}
                color="danger"
                // className="warning__modal__footer__btn cancel__btn "
              >
                Cancel
              </Button>
              <Button
                disabled={!isFormComplete()}
                onClick={() => {
                  handleSubmitWarning();
                  setToggleModal(false);
                }}
                color="primary"
                // className="warning__modal__footer__btn cancel__btn "
              >
                Submit
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  // email will be sent and logged
                  handleIssueWarning({ ...warning, colorAssigned: 'yellow' });
                  setToggleModal(false);
                }}
                color="warning"
                className={styles.warning__modal__footer__btn}
                disabled={!canIssueTrackingWarnings}
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
                className={styles.warning__modal__footer__btn}
                disabled={!canIssueBlueSquare}
              >
                Issue Blue Square
              </Button>
              <Button
                onClick={() => setToggleModal(false)}
                color="danger"
                className={`${styles.warning__modal__footer__btn} cancel__btn`}
              >
                Cancel
              </Button>
            </>
          )}

          {/* {numberOfWarnings >= 8 ? (
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
          )} */}
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default WarningModal;
