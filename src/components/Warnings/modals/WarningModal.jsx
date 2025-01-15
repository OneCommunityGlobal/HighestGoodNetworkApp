/* eslint-disable no-alert */
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Form,
  Col,
  Row,
  Input,
  Label,
} from 'reactstrap';
import WarningIcons from '../WarningIcons';
import getOrdinal from '../../../utils/getOrdinal';
import '../Warnings.css';
import { useState } from 'react';

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
        <Modal isOpen={visible} toggle={() => setToggleModal(false)} size="lg">
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
                        userProfileModal={true}
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
          </ModalBody>

          <ModalFooter>
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
{
  /* <FormGroup
                          check
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
                              // marginBottom: '0.5rem', // Ensures spacing
                            }}
                          >
                            Issue Warning
                          </Label>
                          <Input
                            name="radio1"
                            type="radio"
                            style={{
                              marginTop: '2.5rem', // Fine-tune the distance
                            }}
                          />
                        </FormGroup> */
}
{
  /* <FormGroup
                            check
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexDirection: 'column',
                              gap: '2rem', // Adds spacing between label and input
                            }}
                          >
                            <Label
                              check
                              style={{
                                fontWeight: 'bold', // Optional for better visibility
                                // marginBottom: '0.5rem', // Ensures spacing
                              }}
                            >
                              Log Warning
                            </Label>
                            <Input
                              name="radio1"
                              type="radio"
                              style={{
                                marginTop: '2rem', // Fine-tune the distance
                              }}
                            />
                          </FormGroup>
                          <FormGroup
                            check
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexDirection: 'column',
                              gap: '2rem', // Adds spacing between label and input
                            }}
                          >
                            <Label
                              check
                              style={{
                                fontWeight: 'bold', // Optional for better visibility
                                // marginBottom: '0.5rem', // Ensures spacing
                              }}
                            >
                              Log Warning
                            </Label>
                            <Input
                              name="radio1"
                              type="radio"
                              style={{
                                marginTop: '2rem', // Fine-tune the distance
                              }}
                            />
                          </FormGroup> */
}

{
  /* <FormGroup>
                          <FormGroup>
                            <Label check>Log Warning </Label>
                            <Input name="radio2" type="radio" />
                          </FormGroup>
                          <FormGroup check>
                            <Input
                              name="radio2"
                              type="radio"
                              // style={{
                              //   display: 'block', // This makes the input field a block element
                              //   marginBottom: '0.5rem', // Optional spacing between input and label
                              // }}
                            />{' '}
                            <Label check>Issue Warning</Label>
                          </FormGroup>
                          <FormGroup check>
                            <Input
                              name="radio2"
                              type="radio"
                              // style={{
                              //   display: 'block', // This makes the input field a block element
                              //   marginBottom: '0.5rem', // Optional spacing between input and label
                              // }}
                            />{' '}
                            <Label check>Issue Blue Square</Label>
                          </FormGroup>
                          {/* </Row> */
}
{
  /* </Form> */
}
{
  /* <SliderToggle />
                      <Button
                        onClick={() => {
                          // email will be sent and logged
                          handleIssueWarning({ ...warning, colorAssigned: 'yellow' });
                          setToggleModal(false);
                        }}
                        color="warning"
                        className="warning__modal__footer__btn"
                        style={{
                          fontSize: '8px',
                          width: '100px',
                        }}
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
                        style={{
                          fontSize: '8px',
                          width: '100px',
                        }}
                      >
                        Issue Blue Square
                      </Button> */
}
