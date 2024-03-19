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
// import AssignPopUp from './AssignPopUp';
// import QuickSetupCodes from './QuickSetUpCodes';
import SaveButton from '../UserProfileEdit/SaveButton';
// import { getAllTitle } from '../../../actions/title';

import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import './QuickSetupModal.css';

function QuickSetupModal({ canAddTitle, canAssignTitle, jobTitle, teamsData, projectsData, userProfile, setUserProfile, handleSubmit, setSaved,}) {
    const [onAddTitle, setAddTitle] = useState(false);
//   const [onAddTitle, setAddTitle] = useState(false);
  const [assignPopUp, setAssignPopup] = useState(false);
  const [titles, setTitles] = useState([]);
  const [curtitle, setTitleOnClick] = useState('');
  const [submittoggler, setSubmit] = useState(false);
  const [titleOnSet, setTitleOnSet] = useState(true);

  useEffect(() => {
    // getAllTitle()
    //   .then(res => {setTitles(res.data)})
    //   .catch(err => console.log(err))
  }, [submittoggler]);

  return (
    <div className="container pt-3">
        {/* <QuickSetupCodes
          setSaved={setSaved}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          titles={titles}
          setAssignPopup={setAssignPopup}
          setTitleOnClick={setTitleOnClick}
        /> */}

      <div className="col text-center">
        {canAddTitle ? (
          <Button color="primary" onClick={() => setAddTitle(true)}>
          Add A New Title
        </Button>
        ) : (
          ''
        )}
      </div>
      <div className="col text-center">
        {canAddTitle ? <SaveButton
          handleSubmit={handleSubmit}
          userProfile={userProfile}
          disabled={titleOnSet}
          setSaved={() => setSaved(true)}
        /> : ''}
      </div>
      {/* {canAddTitle ? <AddNewTitle teamsData={teamsData} projectsData={projectsData} isOpen={onAddTitle} setIsOpen={setAddTitle} toggle={setAddTitle} setSubmit={setSubmit} submittoggler={submittoggler}/> : '' } */}
      {/* {canAssignTitle ? <AssignPopUp
      setSaved={() => setSaved(true)}
      handleSubmit={handleSubmit}
      userProfile={userProfile}
      setUserProfile={setUserProfile}
      isOpen={assignPopUp}
      setIsOpen={setAssignPopup}
      toggle={setAssignPopup}
      title={curtitle}
      setTitleOnSet={setTitleOnSet}
      /> : '' } */}
    </div>
  )
};

export default QuickSetupModal;