// import {
//     Button,
//     Modal,
//     ModalBody,
//     ModalFooter,
//     ModalHeader,
//   } from 'reactstrap';
//   import styles from './QuickSetupModal.css';

// function QuickSetupModal({pop}) {
//     return (  );
// }

// export default QuickSetupModal;

import { useState, useEffect } from 'react';
// import AddNewTitle from './AddNewTitle';
import AssignSetUpModal from './AssignSetupModal';
import QuickSetupCodes from './QuickSetupCodes';
import SaveButton from '../UserProfileEdit/SaveButton';
import AddNewTitleModal from './AddNewTitleModal';
import { getAllTitle } from '../../../actions/title';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './QuickSetupModal.css';

function QuickSetupModal({
  canAddTitle,
  canAssignTitle,
  teamsData,
  projectsData,
  userProfile,
  setUserProfile,
  handleSubmit,
  setSaved,
}) {
  const [showAddTitle, setShowAddTitle] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [titles, setTitles] = useState([]);
  const [curtitle, setTitleOnClick] = useState('');
  const [titleOnSet, setTitleOnSet] = useState(true);

  const [showMessage, setShowMessage] = useState(false);
  const [warningMessage, setWarningMessage] = useState({});

  useEffect(() => {
    getAllTitle()
      .then(res => {
        setTitles(res.data);
      })
      .catch(err => console.log(err));
    

  }, []);

  // refresh the QSCs after CREATE/DELETE operations on titles
  const refreshModalTitles = () => {
    getAllTitle()
      .then(res => {
        setTitles(res.data);
      })
      .catch(err => console.log(err));
  };

  //handle
  const handleSaveChanges = () => {
    handleSubmit()
      .then(() => {
        setTitleOnSet(true);
      })
      .catch(e => {
        console.log(e);
      });
  };

  return (
    <div className="container pt-3">
      <QuickSetupCodes
        setSaved={setSaved}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        titles={titles}
        setShowAssignModal={setShowAssignModal}
        setTitleOnClick={setTitleOnClick}
      />

      <div className="col text-center mt-3">
        {canAddTitle ? (
          <Button color="primary" onClick={() => setShowAddTitle(true)}>
            Add A New Title
          </Button>
        ) : (
          ''
        )}
      </div>
      <div className="col text-center mt-3">
        {canAddTitle ? (
          <SaveButton
            handleSubmit={handleSaveChanges}
            userProfile={userProfile}
            disabled={titleOnSet}
            setSaved={() => setSaved(true)}
          />
        ) : (
          ''
        )}
      </div>
      {showAddTitle ? (
        <AddNewTitleModal
          teamsData={teamsData}
          projectsData={projectsData}
          isOpen={showAddTitle}
          setIsOpen={setShowAddTitle}
          refreshModalTitles={refreshModalTitles}
          setWarningMessage={setWarningMessage}
          setShowMessage={setShowMessage}
        />
      ) : (
        ''
      )}
      {canAssignTitle && showAssignModal ? (
        <AssignSetUpModal
          setSaved={() => setSaved(true)}
          handleSubmit={handleSubmit}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          isOpen={showAssignModal}
          setIsOpen={setShowAssignModal}
          toggle={setShowAssignModal}
          title={curtitle}
          setTitleOnSet={setTitleOnSet}
          refreshModalTitles={refreshModalTitles}
        />
      ) : (
        ''
      )}
      {showMessage && (
        <Modal isOpen={showMessage} toggle={() => setShowMessage(false)}>
          <ModalHeader toggle={() => setShowMessage(false)}>{warningMessage.title}</ModalHeader>
          <ModalBody>{warningMessage.content}</ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => setShowMessage(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default QuickSetupModal;
