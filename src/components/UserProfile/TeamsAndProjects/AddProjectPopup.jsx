import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input } from 'reactstrap';
import AddProjectsAutoComplete from './AddProjectsAutoComplete';
import { boxStyle, boxStyleDark } from '~/styles';
import '../../Header/index.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { useDispatch } from 'react-redux';

import { assignProject } from '~/actions/projectMembers';
 
 const createUserProjectMembership = async (userId, projectId) => {
   // If your ENDPOINTS key is named differently, use that one.
   // Typical: POST /userProjects  body: { userId, projectId, isActive }
   return axios.post(ENDPOINTS.USER_PROJECTS, {
     userId,
     projectId,
     isActive: true,
   });
 };
/*const AddProjectPopup = React.memo(function AddProjectPopup(props) {
  const {
    open,
    onClose,
    userId,
    darkMode,
    // projects already in DB (for autocomplete / create-new check)
    projects = [],
    // projects already assigned to this user (to block duplicates)
    userProjects = [],
    // optional: parent callback to update its local table immediately
    onSelectAssignProject, // (project) => void
  } = props;
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeUserProjects = Array.isArray(userProjects) ? userProjects : [];

  // set data from props
  useEffect(() => {
    setAllProjects(safeProjects);
    const categories = Array.from(
      new Set(safeProjects.map(p => p?.category).filter(Boolean))
    );
    setCategoryOptions(categories.length ? categories : ['Unspecified']);
  }, [projects]);*/

// eslint-disable-next-line react/display-name
const AddProjectPopup = React.memo(props => {
  const { darkMode, projects = [], onClose } = props;

  const dispatch = useDispatch();

  // ---------- local state ----------
  const [selectedProject, setSelectedProject] = useState(null);
  const [isValidProject, setIsValidProject] = useState(true);
  const [showDoesNotExistAlert, setShowDoesNotExistAlert] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newProjectCategory, setNewProjectCategory] = useState('Unspecified');
  const [searchText, setSearchText] = useState('');
  const [allProjects, setAllProjects] = useState([]);

  // set data from props
  useEffect(() => {
    setAllProjects(projects || []);
    const categories = Array.from(new Set((projects || []).map(p => p.category).filter(Boolean)));
    setCategoryOptions(categories.length ? categories : ['Unspecified']);
  }, [projects]);

  // reset validation each time the modal opens
  useEffect(() => {
    if (open) {
      setIsValidProject(true);
      setShowDoesNotExistAlert(false);
      setCreatingNew(false);
      setSelectedProject(null);
      setSearchText('');
    }
  }, [open]);

 


  // ---------- helpers ----------
  const format = s => (s || '').toLowerCase().trim();
  const projectByName = name => (allProjects || []).find(p => format(p.projectName) === format(name));

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setIsValidProject(true);
    setShowDoesNotExistAlert(false);
  };

  const close = () => {
    onClose?.();
    setCreatingNew(false);
    setShowDoesNotExistAlert(false);
  };

  // ---------- Confirm existing project ----------
 const handleConfirm = async () => {
   if (!selectedProject) {
     setIsValidProject(false);
     toast.error('Please select a project from the list.');
     return;
   }
   if ((props.userProjects || []).some(p => p?._id === selectedProject._id)) {
     setIsValidProject(false);
     toast.error('Great idea, but they already have that one! Pick another!');
     return;
   }
   try {
    await dispatch(assignProject(selectedProject._id, props.userId, 'Assign'));
    // ✅ Make sure we're passing the complete project object
    props.onSelectAssignProject?.(selectedProject);
    props.onClose?.();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error Assigning Project:', e);
    toast.error('Failed to assign project. Please try again.');
  }
};

  // ---------- Create new project, then confirm ----------
  const handleCreateNew = async () => {
    if (!searchText.trim()) {
      setIsValidProject(false);
      setSelectedProject(null);
      return;
    }
    if (projectByName(searchText)) {
      toast.error('This project already exists.');
      return;
    }

    const newProject = {
      projectName: searchText.trim(),
      projectCategory: newProjectCategory,
      isActive: true,
    };

    try {
      await axios.post(ENDPOINTS.PROJECTS, newProject);
      const res = await axios.get(ENDPOINTS.PROJECTS);
      const created =
        (res.data || []).find(p => format(p.projectName) === format(searchText)) ||
        null;

      if (!created) {
        toast.success('Project created successfully, but it was not auto-selected.');
        setCreatingNew(false);
        setSearchText('');
        return;
      }

      // select the newly created project so pressing Confirm assigns it
      setSelectedProject(created);
      setAllProjects(res.data || []);
      setCreatingNew(false);
      toast.success('Project created successfully');
    } catch {
      toast.error('Project creation failed');
    }
  };

  return (
    <Modal
      isOpen={props.open}
      toggle={onClose}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={false}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={onClose}>
        {creatingNew ? 'Create' : '  Add'} Project{' '}
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
        <div className="input-group-prepend" style={{ marginBottom: 10 }}>
          <AddProjectsAutoComplete
            projectsData={allProjects}
            onDropDownSelect={handleSelectProject}
            selectedProject={selectedProject}
            setIsOpenDropdown={setCreatingNew}
            searchText={searchText}
            onInputChange={setSearchText}
            isSetUserIsNotSelectedAutoComplete={setShowDoesNotExistAlert}
            formatText={(s) => format(s).replace(/\s+/g, '')}
          />
          <Button
            color={creatingNew ? 'success' : 'primary'}
            style={darkMode ? {} : { ...boxStyle, marginLeft: 5 }}
            onClick={creatingNew ? handleCreateNew : handleConfirm}
          >
            {creatingNew ? 'Create' : 'Confirm'}
          </Button>
        </div>

        {creatingNew && (
          <div className="input-group-prepend" style={{ marginBottom: 10, display: 'flex', gap: 10 }}>
            <Input type="select" value={newProjectCategory} onChange={e => setNewProjectCategory(e.target.value)}>
              {categoryOptions.map(opt => (
                <option key={opt}>{opt}</option>
              ))}
            </Input>

            <Button
              color="danger"
              onClick={() => {
                setCreatingNew(false);
                setShowDoesNotExistAlert(false);
                setSearchText('');
              }}
              style={{ width: '100%' }}
            >
              Cancel project creation
            </Button>
          </div>
        )}

        {!isValidProject && selectedProject && (
          <Alert color="danger">Great idea, but they already have that one! Pick another!</Alert>
        )}
        {!isValidProject && !selectedProject && (
          <Alert color="danger">
            Hey, You need to {creatingNew ? 'write the name of' : 'pick'} a project first!
          </Alert>
        )}
        {showDoesNotExistAlert && <Alert color="danger">This project does not exist.</Alert>}
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={close} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default AddProjectPopup;
