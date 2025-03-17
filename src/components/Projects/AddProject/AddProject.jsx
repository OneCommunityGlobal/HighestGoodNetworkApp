import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import '../../Header/DarkMode.css';
import { addNewWBS } from './../../../actions/wbs';
import { postNewProject } from './../../../actions/projects';
import { findUserProfiles, assignProject } from './../../../actions/projectMembers';

const AddProject = (props) => {
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Unspecified');
  const [showAddButton, setShowAddButton] = useState(false);
  const [wbsName, setWbsName] = useState('');
  const [wbsList, setWbsList] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [membersList, setMembersList] = useState([]);
  const [showFoundUserList, setShowFoundUserList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastTimeoutId, setLastTimeoutId] = useState(null);

  const { darkMode } = props.state.theme;
  const canAssignProjectToUsers = props.hasPermission('assignProjectToUsers');
  const canPostWBS = props.hasPermission('postWbs');

  const resetForm = () => {
    setNewName('');
    setNewCategory('Unspecified');
    setWbsList([]);
    setMembersList([]);
    setShowAddButton(false);
    setLoading(false);
    setWbsName('');
    setMemberName('');
    setShowFoundUserList(false);
  };

  const toggleModal = () => {
    if (!loading) {
      setModal(!modal);
      if (!modal) {
        resetForm();
      }
    }
  };

  const closeModalAndShowNotification = (message) => {
    setModal(false);
    setSuccessMessage(message);
    resetForm();
    setLoading(false);
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000);
  };

  const changeNewName = (name) => {
    setNewName(name);
    setShowAddButton(name.length > 0);
  };

  const addWBS = () => {
    if (wbsName && !wbsList.includes(wbsName)) {
      setWbsList([...wbsList, wbsName]);
      setWbsName('');
    } else if (wbsList.includes(wbsName)) {
      console.log('This WBS already exists');
    }
  };

  const removeWBS = (indexToRemove) => {
    setWbsList(wbsList.filter((_, index) => index !== indexToRemove));
  };

  const addMember = (user) => {
    const newMember = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    const isDuplicate = membersList.some(member => member._id === newMember._id);
    
    if (!isDuplicate) {
      setMembersList([...membersList, newMember]);
    } else {
      console.log('This member is already in the list');
    }
    setMemberName('');
    setShowFoundUserList(false);
  };

  const removeMember = (indexToRemove) => {
    setMembersList(membersList.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = event => {
    const currentValue = event.target.value;
    setMemberName(currentValue);

    if (lastTimeoutId !== null) {
      clearTimeout(lastTimeoutId);
    }

    const timeoutId = setTimeout(() => {
      if (currentValue.trim()) {
        props.findUserProfiles(currentValue);
        setShowFoundUserList(true);
      } else {
        setShowFoundUserList(false);
      }
    }, 300);

    setLastTimeoutId(timeoutId);
  };

  const handleAddProject = async () => {
    if (newName && newCategory && !loading) {
      setLoading(true);
      try {
        const projectId = await props.postNewProject(newName, newCategory);

        // Add WBS
        if (wbsList.length > 0) {
          await Promise.all(wbsList.map(wbs => props.addNewWBS(wbs, projectId)));
        }

        // Assign project to members
        if (membersList.length > 0) {
          await Promise.all(membersList.map(member => 
            props.assignProject(projectId, member._id, 'Assign', member.firstName, member.lastName)
          ));
        }
        
        closeModalAndShowNotification('Project added successfully!');
      } catch (error) {
        console.error("Error adding project:", error);
        setLoading(false);
        closeModalAndShowNotification('Error adding project. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <button
        type="button"
        className="btn btn-outline-success"
        onClick={toggleModal}
        style={{
          borderColor: 'green',
          color: 'green',
          borderWidth: '1px',
        }}
      >
        <i className="fa fa-plus" aria-hidden="true"></i> Add New Project
      </button>

      {successMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            padding: '10px',
            backgroundColor: successMessage.includes('Error') ? '#f44336' : '#4caf50',
            color: 'white',
            borderRadius: '5px',
            textAlign: 'center',
            width: '300px',
          }}
        >
          {successMessage}
        </div>
      )}

      <Modal isOpen={modal} toggle={toggleModal} className={`modal-dialog modal-lg ${darkMode ? 'text-light dark-mode' : ''}`}>
        <ModalHeader 
          toggle={toggleModal} 
          className={darkMode ? 'bg-space-cadet' : ''}
          cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}>
          Add New Project
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className="form-group">
            <label htmlFor="projectName" className={darkMode ? "text-light":" "}>Project Name (required)</label>
            <input
              type="text"
              className={`form-control ${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              id="projectName"
              placeholder="Enter project name"
              value={newName}
              onChange={(e) => changeNewName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className={darkMode ? "text-light":" "}>Select Category</label>
            <select
              className={`form-control ${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              id="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              disabled={loading}
            >
              <option value="Unspecified">Unspecified</option>
              <option value="Food">Food</option>
              <option value="Energy">Energy</option>
              <option value="Housing">Housing</option>
              <option value="Education">Education</option>
              <option value="Society">Society</option>
              <option value="Economics">Economics</option>
              <option value="Stewardship">Stewardship</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {canPostWBS && (
            <div className="form-group">
              <label htmlFor="WBS" className={darkMode ? "text-light":" "}>Add WBS (optional)</label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
                  id="wbsName"
                  placeholder="Enter WBS name"
                  value={wbsName}
                  onChange={(e) => setWbsName(e.target.value)}
                  disabled={loading}
                />
                <div className="input-group-append">
                  <Button color="primary" onClick={addWBS} disabled={loading}>
                    Add WBS
                  </Button>
                </div>
              </div>
              {wbsList.length > 0 && (
                <ul className="list-group mt-2" style={{ maxHeight: '15vh', overflowY: 'auto' }}>
                  {wbsList.map((wbs, index) => (
                    <li key={index} className={`list-group-item d-flex justify-content-between align-items-center ${darkMode ? 'bg-darkmode-liblack text-light border-0' : ''}`} style={{color:"#403e3e"}}>
                      {wbs}
                      <Button color="danger" size="sm" onClick={() => removeWBS(index)} disabled={loading}>
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {canAssignProjectToUsers && (
            <div className="form-group">
              <label htmlFor="members" className={darkMode ? "text-light" : ""}>Add Members (optional)</label>
              <div className="input-group">
                <input
                  type="text"
                  className={`form-control ${darkMode ? 'bg-yinmn-blue border-0 text-light' : ''}`}
                  id="memberName"
                  placeholder="Search for members"
                  value={memberName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              {showFoundUserList && props.state.projectMembers.foundUsers.length > 0 && (
                <ul className="list-group mt-2" style={{ maxHeight: '15vh', overflowY: 'auto' }}>
                  {props.state.projectMembers.foundUsers.map((member) => (
                    <li key={member._id} className="list-group-item d-flex justify-content-between align-items-center" style={{color: darkMode ? '#fff' : '#403e3e'}}>
                      {props.hasPermission('getProjectMembers') ? (
                        <a href={`/userprofile/${member._id}`} className={darkMode ? 'text-azure' : ''} target='_blank'>
                          {member.firstName} {member.lastName}
                        </a>
                      ) : (
                        <span>{member.firstName} {member.lastName}</span>
                      )}
                      <Button color="primary" size="sm" onClick={() => addMember(member)} disabled={loading}>
                        Add
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {membersList.length > 0 && (
                <ul className="list-group mt-2" style={{ maxHeight: '15vh', overflowY: 'auto' }}>
                  {membersList.map((member, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center" style={{color: darkMode ? '#fff' : '#403e3e'}}>
                      {props.hasPermission('getProjectMembers') ? (
                        <a href={`/userprofile/${member._id}`} className={darkMode ? 'text-azure' : ''} target="_blank">
                          {member.firstName} {member.lastName}
                        </a>
                      ) : (
                        <span>{member.firstName} {member.lastName}</span>
                      )}
                      <Button color="danger" size="sm" onClick={() => removeMember(index)} disabled={loading}>
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          {showAddButton && (
            <Button 
              color="primary" 
              onClick={handleAddProject}
              disabled={loading}
            >
              {loading ? (
                <span>
                  <i className="fa fa-spinner fa-spin" /> Adding...
                </span>
              ) : (
                'Add Project'
              )}
            </Button>
          )}
          <Button color="secondary" onClick={toggleModal} disabled={loading}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps, {
  addNewWBS,
  postNewProject,
  findUserProfiles,
  assignProject,
})(AddProject);