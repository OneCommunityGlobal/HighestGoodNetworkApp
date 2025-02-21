import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect, useSelector } from 'react-redux';
import hasPermission from '../../../utils/permissions';
import { boxStyle, boxStyleDark } from '../../../styles';
import AssignSetUpModal from './AssignSetupModal';
import QuickSetupCodes from './QuickSetupCodes';
import SaveButton from '../UserProfileEdit/SaveButton';
import AddNewTitleModal from './AddNewTitleModal';
import EditTitlesModal from './EditTitlesModal';
import { getAllTitle } from '../../../actions/title';
import './QuickSetupModal.css';
import '../../Header/DarkMode.css';

function QuickSetupModal(props) {
  const darkMode = useSelector(state => state.theme.darkMode);
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
  const [adminLinks, setAdminLinks] = useState([]);
  const [editModal, showEditModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    getAllTitle()
      .then(res => {
        setTitles(res.data);
      })
      .catch(err => console.log(err));
  }, [editModal, refreshTrigger]);

  // refresh the QSCs after CREATE/DELETE operations on titles
  const refreshModalTitles = async () => {
    try {
      setRefreshTrigger(prev => prev + 1);
      const response = await getAllTitle();
      const sortedData = response.data.sort((a, b) => a.order - b.order);
      setTitles(sortedData);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {canAssignTitle || canEditTitle || canAddTitle ? (
        <QuickSetupCodes
          setSaved={props.setSaved}
          userProfile={props.userProfile}
          setUserProfile={props.setUserProfile}
          titles={titles}
          setShowAssignModal={setShowAssignModal}
          setTitleOnClick={setTitleOnClick}
          editMode={editMode}
          assignMode={canAssignTitle}
          setShowAddTitle={setShowAddTitle}
        />
      ) : (
        ''
      )}

      <div className="col text-center mt-3 flex">
        {canAddTitle ? (
          <Button
            color="primary"
            onClick={() => setShowAddTitle(true)}
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={editMode == true}
            title="Click this to add a new Quick Setup Title"
          >
            Add New QST
          </Button>
        ) : (
          ''
        )}
        {canAddTitle ? (
          <Button
            color="primary mx-2"
            onClick={() => showEditModal(true)}
            style={darkMode ? boxStyleDark : boxStyle}
            disabled={editMode == true}
            title="Click this to change the order of QST codes"
          >
            Change Order
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
            <Button
              color="primary mx-2"
              onClick={() => setEditMode(false)}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              Save
            </Button>
          )
        ) : (
          ''
        )}
        <EditTitlesModal
          isOpen={editModal}
          toggle={() => showEditModal(false)}
          titles={titles}
          refreshModalTitles={refreshModalTitles}
          darkMode={darkMode}
        />
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
      {showAddTitle || editMode ? (
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
