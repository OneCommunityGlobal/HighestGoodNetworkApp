import React, { useEffect, useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input } from 'reactstrap';
import AddProjectsAutoComplete from './AddProjectsAutoComplete';
import { boxStyle, boxStyleDark } from '~/styles';
import '../../Header/index.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { useDispatch } from 'react-redux';
import { assignProject } from '~/actions/projectMembers';

// eslint-disable-next-line react/display-name
const AddProjectPopup = React.memo((props) => {
  const {
    open,
    onClose,
    darkMode,
    projects = [],
    userProjects = [],
    userId,
    onSelectAssignProject,
  } = props;

  const dispatch = useDispatch();

  const [selectedProject, setSelectedProject] = useState(null);
  const [isValidProject, setIsValidProject] = useState(true);
  const [showDoesNotExistAlert, setShowDoesNotExistAlert] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newProjectCategory, setNewProjectCategory] = useState('Unspecified');
  const [searchText, setSearchText] = useState('');
  const [allProjects, setAllProjects] = useState([]);

  useEffect(() => {
    setAllProjects(projects || []);
    const categories = Array.from(new Set((projects || []).map((p) => p.category).filter(Boolean)));
    setCategoryOptions(categories.length ? categories : ['Unspecified']);
  }, [projects]);

  useEffect(() => {
    if (open) {
      setIsValidProject(true);
      setShowDoesNotExistAlert(false);
      setCreatingNew(false);
      setSelectedProject(null);
      setSearchText('');
      setNewProjectCategory('Unspecified');
    }
  }, [open]);

  const format = (s) => (s || '').toLowerCase().trim();

  const projectByName = (name) =>
    (allProjects || []).find((p) => format(p.projectName) === format(name));

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setIsValidProject(true);
    setShowDoesNotExistAlert(false);
  };

  const close = () => {
    onClose?.();
    setCreatingNew(false);
    setShowDoesNotExistAlert(false);
    setSelectedProject(null);
    setSearchText('');
    setIsValidProject(true);
  };

  const handleConfirm = async () => {
    if (!selectedProject) {
      setIsValidProject(false);
      toast.error('Please select a project from the list.');
      return;
    }

    if (userProjects.some((p) => p?._id === selectedProject._id)) {
      setIsValidProject(false);
      toast.error('Great idea, but they already have that one! Pick another!');
      return;
    }

    try {
      await dispatch(assignProject(selectedProject._id, userId, 'Assign'));
      onSelectAssignProject?.(selectedProject);
      onClose?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error assigning project:', e);
      toast.error('Failed to assign project. Please try again.');
    }
  };

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
        (res.data || []).find((p) => format(p.projectName) === format(searchText)) || null;

      if (!created) {
        toast.success('Project created successfully, but it was not auto-selected.');
        setCreatingNew(false);
        setSearchText('');
        return;
      }

      setSelectedProject(created);
      setAllProjects(res.data || []);
      setCreatingNew(false);
      toast.success('Project created successfully');
    } catch (e) {
      toast.error('Project creation failed');
    }
  };

  return (
    <Modal
      isOpen={open}
      toggle={close}
      centered
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet text-light' : ''} toggle={close}>
        {creatingNew ? 'Create Project' : 'Add Project'}
      </ModalHeader>

      <ModalBody
        className={darkMode ? 'bg-yinmn-blue text-light' : ''}
        style={{ padding: '1.5rem' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '0.75rem',
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                flex: '1 1 420px',
                minWidth: '260px',
              }}
            >
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
            </div>

            <Button
              color={creatingNew ? 'success' : 'primary'}
              style={{
                ...(darkMode ? {} : boxStyle),
                minWidth: '120px',
                height: '38px',
                alignSelf: 'stretch',
              }}
              onClick={creatingNew ? handleCreateNew : handleConfirm}
            >
              {creatingNew ? 'Create' : 'Confirm'}
            </Button>
          </div>

          {creatingNew && (
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                width: '100%',
                flexWrap: 'wrap',
                alignItems: 'stretch',
              }}
            >
              <Input
                type="select"
                value={newProjectCategory}
                onChange={(e) => setNewProjectCategory(e.target.value)}
                className={darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}
                style={{
                  flex: '1 1 240px',
                  minWidth: '220px',
                }}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </Input>

              <Button
                color="danger"
                onClick={() => {
                  setCreatingNew(false);
                  setShowDoesNotExistAlert(false);
                  setSearchText('');
                  setSelectedProject(null);
                  setIsValidProject(true);
                }}
                style={{
                  minWidth: '180px',
                }}
              >
                Cancel project creation
              </Button>
            </div>
          )}

          {!isValidProject && selectedProject && (
            <Alert color="danger" style={{ marginBottom: 0 }}>
              Great idea, but they already have that one! Pick another!
            </Alert>
          )}

          {!isValidProject && !selectedProject && (
            <Alert color="danger" style={{ marginBottom: 0 }}>
              Hey, You need to {creatingNew ? 'write the name of' : 'pick'} a project first!
            </Alert>
          )}

          {showDoesNotExistAlert && (
            <Alert color="danger" style={{ marginBottom: 0 }}>
              This project does not exist.
            </Alert>
          )}
        </div>
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