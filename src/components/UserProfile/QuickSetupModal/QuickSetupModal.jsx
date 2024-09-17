import { useState, useEffect } from 'react';
import AssignSetUpModal from './AssignSetupModal';
import QuickSetupCodes from './QuickSetupCodes';
import SaveButton from '../UserProfileEdit/SaveButton';
import AddNewTitleModal from './AddNewTitleModal';
import { getAllTitle } from '../../../actions/title';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './QuickSetupModal.css';
import '../../Header/DarkMode.css';
import { useSelector } from 'react-redux';
import { boxStyle, boxStyleDark } from 'styles';

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
  const darkMode = useSelector(state => state.theme.darkMode);

  const [showAddTitle, setShowAddTitle] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [titles, setTitles] = useState([]);
  const [curtitle, setTitleOnClick] = useState('');
  const [titleOnSet, setTitleOnSet] = useState(true);

  const [showMessage, setShowMessage] = useState(false);
  const [warningMessage, setWarningMessage] = useState({});
  const [adminLinks, setAdminLinks] = useState([])
  console.log("userProfile", userProfile,"adminLinks", userProfile.adminLinks)
  useEffect(() => {
    console.log("USER PROFILE",userProfile);

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
        setUserProfile(userProfile)
        setUserProfile(prev => ({ ...prev,adminLinks: adminLinks }));
      })
      .catch(err => console.log(err));
  };

  //handle save changes
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
          <Button
            color="primary"
            onClick={() => setShowAddTitle(true)}
            style={darkMode ? boxStyleDark : boxStyle}
          >
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
            darkMode={darkMode}
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
        <Modal
          isOpen={showMessage}
          toggle={() => setShowMessage(false)}
          className={darkMode ? 'text-light dark-mode' : ''}
        >
          <ModalHeader
            toggle={() => setShowMessage(false)}
            className={darkMode ? 'bg-space-cadet' : ''}
          >
            {warningMessage.title}
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            {warningMessage.content}
          </ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
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
