import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import '../../Header/DarkMode.css';
import { addNewWBS } from './../../../actions/wbs';
import {postNewProject} from './../../../actions/projects';
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
  const { darkMode } = props.state.theme;
  const canAssignProjectToUsers = props.hasPermission('assignProjectToUsers');
  const canPostWBS = props.hasPermission('postWbs');
  const [lastTimeoutId, setLastTimeoutId] = useState(null); 
  // toggle modal open/close
  const toggleModal = () => setModal(!modal);

  //  project name change and show/hide add button
  const changeNewName = (name) => {
    setNewName(name);
    setShowAddButton(name.length > 0);
  };

  // adding a new WBS
  const addWBS = () => {
    if (wbsName && !wbsList.includes(wbsName)) {
      setWbsList([...wbsList, wbsName]);
    } else if (wbsList.includes(wbsName)) {
      console.log('This WBS already exists');
    }
    setWbsName('');
  };

  // adding a new member
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

  const removeWBS = (indexToRemove) => {
    setWbsList(wbsList.filter((_, index) => index !== indexToRemove));
  };

  const removeMember = (indexToRemove) => {
    setMembersList(membersList.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = event => {
    const currentValue = event.target.value;
    setMemberName(currentValue);

    if (lastTimeoutId !== null) clearTimeout(lastTimeoutId);

    const timeoutId = setTimeout(() => {
      props.findUserProfiles(currentValue);
      setShowFoundUserList(true);
    }, 300);

    setLastTimeoutId(timeoutId);
  };

  //  adding a new project
  const handleAddProject = async () => {
    if (newName && newCategory) {
      try {
        const projectId = await props.postNewProject(newName, newCategory);

        // Add WBS
        wbsList.map((_, index) => props.addNewWBS(wbsList[index], projectId));

        //assing project to members in member list
        membersList.map((member =>  props.assignProject(projectId, member._id, 'Assign', member.firstName, member.lastName)));
        
        toggleModal();
        setNewName('');
        setNewCategory('Unspecified');
        setWbsList([]);
        setMembersList([]);
      } catch (error) {
        console.error("Error adding project:", error);
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
              className="form-control"
              id="projectName"
              placeholder="Enter project name"
              value={newName}
              onChange={(e) => changeNewName(e.target.value)}
            />
          </div>


          <div className="form-group">
            <label htmlFor="category" className={darkMode ? "text-light":" "}>Select Category</label>
            <select
              className="form-control"
              id="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
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

          {canPostWBS ?

            <div className="form-group">
              <label htmlFor="WBS" className={darkMode ? "text-light":" "}>Add WBS (optional)</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="wbsName"
                  placeholder="Enter WBS name"
                  value={wbsName}
                  onChange={(e) => setWbsName(e.target.value)}
                />
                <div className="input-group-append">
                  <Button color="primary" onClick={addWBS}>
                    Add WBS
                  </Button>
                </div>
              </div>
              {/* Display added WBS list */}
              {wbsList.length > 0 && (
                <ul className="list-group mt-2" style={{ maxHeight: '15vh', overflowY: 'auto' }}>
                  {wbsList.map((wbs, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center " style={{color:"#403e3e"}}>
                      {wbs}
                      <Button color="danger" size="sm" onClick={() => removeWBS(index)}>
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          :null }

          {canAssignProjectToUsers ? 
          
          <div className="form-group">
              <label htmlFor="members" className={darkMode ? "text-light" : ""}>Add Members (optional)</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="memberName"
                  placeholder="Search for members"
                  value={memberName}
                  onChange={handleInputChange}
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
                  <Button color="primary" size="sm" onClick={() => addMember(member)}>
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
                  <Button color="danger" size="sm" onClick={() => removeMember(index)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
          </div>
          : null }
          
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          {showAddButton && (
            <Button color="primary" onClick={handleAddProject}>
              Add Project
            </Button>
          )}
          <Button color="secondary" onClick={toggleModal}>
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
