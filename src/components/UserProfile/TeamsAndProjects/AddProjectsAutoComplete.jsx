import React, { useEffect, useState } from 'react';
import { Dropdown, Input } from 'reactstrap';
import './TeamsAndProjects.css';

const AddProjectsAutoComplete = React.memo(props => {
  const [isOpen, toggle] = useState(false);

  useEffect(() => {
    if (!props.selectedProject) props.onInputChange('');
    else props.onInputChange(props.selectedProject.projectName);
  }, [props.selectedProject]);

  return (
    <Dropdown
      isOpen={isOpen}
      toggle={() => {
        toggle(!isOpen);
      }}
      style={{ width: '100%', marginRight: '5px' }}
    >
      <Input
        type="text"
        value={props.searchText}
        autoFocus={true}
        onChange={e => {
          props.onInputChange(e.target.value);
          toggle(true);
          props.isSetUserIsNotSelectedAutoComplete(true);
        }}
      />

      {props.searchText !== '' && props.projectsData && props.projectsData.length > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.projectsData
            .filter(project => {
              if (project.projectName.toLowerCase().indexOf(props.searchText.toLowerCase()) > -1) {
                return project;
              }
            })
            .slice(0, 10)
            .map(item => (
              <div
                className="project-auto-complete"
                key={item._id}
                onClick={() => {
                  props.onInputChange(item.projectName);
                  toggle(false);
                  props.onDropDownSelect(item);
                }}
              >
                {item.projectName}
              </div>
            ))}

          {props.projectsData.every(
            item => item.projectName.toLowerCase() !== props.searchText.toLowerCase(),
          ) && (
            <div
              className="project-auto-complete"
              onClick={() => {
                toggle(false);
                props.setIsOpenDropdown(true);
              }}
            >
              Create new project: {props.searchText}
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
    </Dropdown>
  );
});

export default AddProjectsAutoComplete;
