import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input } from 'reactstrap';
import AddProjectsAutoComplete from './AddProjectsAutoComplete';
import { boxStyle, boxStyleDark } from 'styles';
import '../../Header/DarkMode.css';
import { postNewProject } from '../../../../src/actions/projects';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';

const AddProjectPopup = React.memo(props => {
  const { darkMode } = props;

  const dispatch = useDispatch();

  const closePopup = () => {
    props.onClose();
    setIsOpenDropdown(false);
  };

  const [selectedProject, onSelectProject] = useState(undefined);
  const [isValidProject, onValidation] = useState(true);
  const [itemsDropdown, setItemsDropdown] = useState([]);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [dropdownText, setDropdownText] = useState('Unspecified');
  const [searchText, onInputChange] = useState('');

  useEffect(() => {
    const categoriesProjects = props.projects.map(item => item.category);
    const uniqueCategoriesProjects = Array.from(new Set(categoriesProjects));
    setItemsDropdown(uniqueCategoriesProjects);
  }, [props.projects]);

  const onAssignProject = async () => {
    if (selectedProject && !props.userProjectsById.some(x => x._id === selectedProject._id)) {
      await props.onSelectAssignProject(selectedProject);
      onSelectProject(undefined);
      toast.success('Project assigned successfully');
    } else {
      onValidation(false);
    }
    if (props.handleSubmit !== undefined) {
      props.handleSubmit();
    }
  };

  const selectProject = project => {
    onSelectProject(project);
    onValidation(true);
  };

  useEffect(() => {
    onValidation(true);
  }, [props.open]);

  const finishFetch = status => {
    setIsOpenDropdown(false);
    toast.success(
      status === 200
        ? 'Project created successfully'
        : 'Project created successfully, but it is not possible to retrieve the new project.',
    );
    setDropdownText(dropdownText);
  };

  const format = result => result.toLowerCase();

  const validationProjectName = () =>
    props.projects.find(project => format(project.projectName) === format(searchText));

  const onCreateNewProject = async () => {
    // prettier-ignore
    if (searchText === '') {onValidation(false); onSelectProject(undefined); return;}

    const validateProjectName = validationProjectName();
    // prettier-ignore
    if (validateProjectName) { toast.error('This project already exists.'); return;}

    const responseAddNewProject = await dispatch(postNewProject(searchText, dropdownText));

    // prettier-ignore
    if (responseAddNewProject !== 201) {toast.error('Project creation failed'); return;}

    const url = ENDPOINTS.PROJECTS;
    const res = await axios.get(url);
    const status = res.status;
    const projects = res.data;
    if (status === 200) {
      const findNewProject = projects.filter((item, i) => i === 0)[0];
      selectProject(findNewProject);
      finishFetch(status);
    } else {
      onInputChange('');
      finishFetch(status);
    }
  };

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      autoFocus={false}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        {isOpenDropdown ? 'Create' : '  Add'} Project{' '}
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''} style={{ textAlign: 'center' }}>
        <>
          <div className="input-group-prepend" style={{ marginBottom: '10px' }}>
            <AddProjectsAutoComplete
              projectsData={props.projects}
              onDropDownSelect={selectProject}
              selectedProject={selectedProject}
              setIsOpenDropdown={setIsOpenDropdown}
              searchText={searchText}
              onInputChange={onInputChange}
            />
            <Button
              color={isOpenDropdown ? 'success' : 'primary'}
              style={darkMode ? {} : { ...boxStyle, marginLeft: '5px' }}
              onClick={isOpenDropdown ? onCreateNewProject : onAssignProject}
            >
              {isOpenDropdown ? 'Create' : 'Confirm'}
            </Button>
          </div>

          {isOpenDropdown && (
            <div
              className="input-group-prepend"
              style={{ marginBottom: '10px', display: 'flex', flexDirection: 'row', gap: '10px' }}
            >
              <Input
                type="select"
                onChange={e => setDropdownText(e.target.value)}
                value={dropdownText}
              >
                {itemsDropdown.map(item => {
                  return <option key={item}>{item}</option>;
                })}
              </Input>

              <Button
                color="danger"
                onClick={() => {
                  setIsOpenDropdown(false), onInputChange('');
                }}
                style={{ width: '100%' }}
              >
                Assign Project
              </Button>
            </div>
          )}
        </>
        <div>
          {!isValidProject && selectedProject && (
            <Alert color="danger">Great idea, but they already have that one! Pick another!</Alert>
          )}
          {!isValidProject && !selectedProject && (
            <Alert color="danger">
              Hey, You need to {isOpenDropdown ? 'write the name of' : 'pick'} a project first!
            </Alert>
          )}
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup} style={darkMode ? boxStyleDark : boxStyle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});
export default AddProjectPopup;
