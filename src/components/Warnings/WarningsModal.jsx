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
  numberOfWarnings,
}) {
  // check why passing props.warning errors
  // pass the data from warning icon to here modal displaying it
  // if user cancle reset everything.
  // if user submits the warning the wanring will be issued and sent to the backend

  const { today, id, colorAssigned, warningText, username } = warning;

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
            warning: "{warningText}"
          </p>
          <p>The color will be {colorAssigned}</p>
        </ModalBody>

        <ModalFooter className="warning-modal-footer">
          <Button onClick={() => setToggleModal(false)} color="danger">
            Cancel
          </Button>
          {numberOfWarnings <= 4 && (
            <Button
              onClick={() => {
                handleIssueWarning(warning);
                // subtmit wanring here to backend
                setToggleModal(false);
              }}
            >
              Log Warning Only
            </Button>
          )}

          {numberOfWarnings >= 2 && (
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
          )}

          {numberOfWarnings >= 3 && (
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
          )}
        </ModalFooter>
      </Modal>
    </div>
  );

  // alert("BLUE SQUARE ISSUED!!")
  // handleIssueWarning(warning);
  // setToggleModal(false);

  // would you like to issue a warning?
  // submit warning  cancel log warning
  // 3rd one submit wanring send a warning
  // on 4th one option to submit a blue square icon will be red
  // 4th on will be red

  // log it issue warning or blue square
  // else {
  //   return (
  //     <Modal isOpen={visible} toggle={() => setToggleModal(false)}>
  //       <ModalHeader>Issue Warning</ModalHeader>
  //       <ModalBody>
  //         <h2>Are you sure you want to issue a warning to: {username}?</h2>
  //         <p>
  //           The warning will be because they didn&apos;t meet the criteria for the following
  //           warning: "{warningText}"
  //         </p>
  //         {/* <p>The color will be {colorAssigned}</p> */}
  //       </ModalBody>

  //       <ModalFooter>
  //         <Button onClick={() => setToggleModal(false)} color="danger">
  //           Cancel
  //         </Button>
  //         <button
  //           onClick={() => {
  //             console.log('blue square issued!!');
  //           }}
  //         >
  //           Issue Blue Square
  //         </button>
  //         {/* clicking will submit the warning to the backend */}
  //           color="primary"
  //         <Button
  //           onClick={() => {
  //             submitWarning();
  //             setToggleModal(false);
  //           }}
  //         >
  //           Submit Warning
  //         </Button>
  //       </ModalFooter>
  //     </Modal>
  //   );
  // }
}

export default WarningsModal;
//issue blue square dot will turn red
//log a warning will turn blue
//issue a warning different color yellow?
//
