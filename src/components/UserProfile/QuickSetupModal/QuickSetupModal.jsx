import { useState, useEffect } from 'react';
import AssignSetUpModal from './AssignSetupModal';
import QuickSetupCodes from './QuickSetupCodes';
import SaveButton from '../UserProfileEdit/SaveButton';
import AddNewTitleModal from './AddNewTitleModal';
import { getAllTitle } from '../../../actions/title';

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './QuickSetupModal.css';
import '../../Header/DarkMode.css';
import { connect, useSelector } from 'react-redux';
import { boxStyle, boxStyleDark } from 'styles';
import hasPermission from 'utils/permissions';

function QuickSetupModal(props) {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const canEditTitle = props.hasPermission('editTitle');
  const canAddTitle = props.hasPermission('addNewTitle');
  const canAssignTitle = props.hasPermission('assignTitle');
  const [showAddTitle, setShowAddTitle] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [titles, setTitles] = useState([]);
  const [curtitle, setTitleOnClick] = useState({});
  const [titleOnSet, setTitleOnSet] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [warningMessage, setWarningMessage] = useState({});

  //new 
  const [sortBy, setSortBy] = useState('');


  useEffect(() => {
    getAllTitle()
      .then((res) => {
        setTitles(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const sortedTitles = [...titles].sort((a, b) => {
    if (sortBy === 'team-code') {
      return a.teamCode.localeCompare(b.teamCode);
    } 
  });

  // refresh the QSCs after CREATE/DELETE operations on titles
  const refreshModalTitles = () => {
    getAllTitle()
      .then((res) => {
        setTitles(res.data);
      })
      .catch((err) => console.log(err));
  };

  // handle save changes
  const handleSaveChanges = () => {
    handleSubmit()
      .then(() => {
        setTitleOnSet(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    console.log(e.target.value);
  }

  return (
    <div className="container pt-3">
      {(canAssignTitle || canEditTitle || canAddTitle) ? (
        <QuickSetupCodes
          setSaved={props.setSaved}
          userProfile={props.userProfile}
          setUserProfile={props.setUserProfile}
          titles={sortedTitles}
          setShowAssignModal={setShowAssignModal}
          setTitleOnClick={setTitleOnClick}
          editMode={editMode}
          assignMode={canAssignTitle}
          setShowAddTitle={setShowAddTitle}
          setSortBy={setSortBy}
        />
      ) : (
        ''
      )}

      <div className="col text-center mt-3 flex">
        {canAddTitle ? (
          <Button
            color="primary mx-2"
            onClick={() => setShowAddTitle(true)}
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={editMode === true ? true : false}
          >
            Add A New Title
          </Button>
        ) : (
          ''
        )}

        {canEditTitle ? (
          !editMode ? (
              <Button
              color="primary mx-2"
              onClick={() => setEditMode(true)}
              style={darkMode ? boxStyleDark : boxStyle}
              >
                Edit
              </Button>
            
          ) : (
            <div>
              <Button
              color="primary mx-2"
              onClick={() => setEditMode(false)}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Save
            </Button>
    
              
            </div>
            
          )
        ) : (
          ''
        )}
      </div>


      <div className="col text-center mt-3">
        {canAssignTitle ? (
          <SaveButton
            handleSubmit={props.handleSubmit}
            userProfile={props.userProfile}
            disabled={titleOnSet}
            setSaved={() => props.setSaved(true)}
            darkMode={darkMode}
          />
        ) : (
          ''
        )}
      </div>

      {(showAddTitle || editMode) ? (
        <AddNewTitleModal
          teamsData={props.teamsData}
          projectsData={props.projectsData}
          isOpen={showAddTitle}
          setIsOpen={setShowAddTitle}
          refreshModalTitles={refreshModalTitles}
          setWarningMessage={setWarningMessage}
          setShowMessage={setShowMessage}
          editMode={editMode}
          title={curtitle}
        />
      ) : (
        ''
      )}

      {canAssignTitle && showAssignModal && editMode === false ? (
        <AssignSetUpModal
          setSaved={() => props.setSaved(true)}
          handleSubmit={props.handleSubmit}
          userProfile={props.userProfile}
          setUserProfile={props.setUserProfile}
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

export default connect(null, { hasPermission })(QuickSetupModal);


