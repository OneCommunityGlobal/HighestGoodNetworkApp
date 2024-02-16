/* eslint-disable no-unused-vars */
/* eslint-disable spaced-comment */
/* eslint-disable no-undef */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-alert */
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
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
  handleAddNewWarning,
  handleDeactivate,
}) {
  const { today, id, colorAssigned, warningText, username } = warning || {};
  const [toggeleWarningInput, setToggeleWarningInput] = useState(false);
  const [newWarning, setNewWarning] = useState('');

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
  if (warningsModal) {
    return (
      <Modal isOpen={warningsModal} toggle={() => setWarningsModal(false)}>
        <ModalHeader>
          Current Warning Descriptions
          <i
            data-toggle="tooltip"
            title="Click to refresh the leaderboard"
            style={{ fontSize: 24, cursor: 'pointer' }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </ModalHeader>
        <ModalBody>
          {warningDescriptions.map(warning => (
            <div className="warnings__descriptions" key={warning._id}>
              <Button className="warning__descriptions__btn" color="secondary">
                adjust
              </Button>
              {warning.activeWarning ? (
                <Button
                  color="warning"
                  className="warning__descriptions__btn"
                  onClick={() => handleDeactivate(warning._id)}
                >
                  <i className="fa fa-minus" />
                </Button>
              ) : (
                <Button
                  color="success"
                  className="warning__descriptions__btn"
                  onClick={() => handleDeactivate(warning._id)}
                >
                  <i className="fa fa-plus" />
                </Button>
              )}

              <Button
                color="danger"
                className="warning__descriptions__btn"
                onClick={() => handleDeleteDescription(warning._id)}
              >
                x
              </Button>
              <p
                className={`warnings__descriptions__title ${
                  warning.activeWarning ? '' : 'warnings__descriptions__title--gray'
                }`}
              >
                {warning.warningTitle}
              </p>
            </div>
          ))}
          <div className="btn__container">
            {!toggeleWarningInput && (
              <Button
                className="add__btn"
                color="primary"
                onClick={() => setToggeleWarningInput(true)}
              >
                <i className="fa fa-plus" />
              </Button>
            )}

            {toggeleWarningInput && (
              <form
                className="warning__form"
                onSubmit={e => {
                  handleAddNewWarning(e, newWarning);
                  setNewWarning('');
                }}
              >
                <label htmlFor="warning" className="warning__title">
                  Warning Title
                </label>
                <input
                  type="text"
                  id="warning"
                  required
                  className="warning__input"
                  value={newWarning}
                  onChange={e => {
                    setNewWarning(e.target.value);
                  }}
                />
                <div>
                  <Button color="primary" type="submit">
                    Add
                  </Button>
                  <Button
                    color="danger"
                    className="cancel__btn"
                    onClick={() => {
                      setNewWarning(null);
                      setWarningsModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="danger" onClick={() => setWarningsModal(false)}>
            Close
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
