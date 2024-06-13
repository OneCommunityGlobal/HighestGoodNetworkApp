import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input } from 'reactstrap';
import AddProjectsAutoComplete from './AddProjectsAutoComplete';
import { boxStyle, boxStyleDark } from 'styles';
import '../../Header/DarkMode.css';
import { postNewProject, fetchAllProjects } from '../../../../src/actions/projects';
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

  const onCreateNewProject = async () => {
    if (searchText !== '' && dropdownText !== '') {
      try {
        await dispatch(postNewProject(searchText, dropdownText));
        await dispatch(fetchAllProjects());
        onInputChange('');
        setDropdownText(dropdownText);
        setIsOpenDropdown(false);
        toast.success('Project created successfully');
      } catch (e) {}
    } else toast.error('project creation failed');
  };

  return (
    <Modal
      isOpen={props.open}
      toggle={closePopup}
      autoFocus={false}
      className={darkMode ? 'text-light dark-mode' : ''}
    >
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={closePopup}>
        Add Project{' '}
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
              color="primary"
              style={darkMode ? {} : { ...boxStyle, marginLeft: '5px' }}
              onClick={isOpenDropdown ? onCreateNewProject : onAssignProject}
            >
              Confirm
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
                Close dropdown
              </Button>
            </div>
          )}
        </>
        <div>
          {!isValidProject && selectedProject && (
            <Alert color="danger">Great idea, but they already have that one! Pick another!</Alert>
          )}
          {!isValidProject && !selectedProject && (
            <Alert color="danger">Hey, You need to pick a project first!</Alert>
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
