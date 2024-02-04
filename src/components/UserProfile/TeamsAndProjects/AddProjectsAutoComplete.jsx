import React, { useEffect, useState } from 'react';
import { Dropdown, Input } from 'reactstrap';
import './TeamsAndProjects.css';

const AddProjectsAutoComplete = React.memo(props => {
  const [searchText, onInputChange] = useState('');
  const [isOpen, toggle] = useState(false);

  useEffect(() => {
    if (!props.selectedProject) onInputChange('');
    else onInputChange(props.selectedProject.projectName);
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
        value={searchText}
        onChange={e => {
          onInputChange(e.target.value);
          toggle(true);
        }}
      />

      {searchText !== '' && props.projectsData && props.projectsData.length > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.projectsData
            .filter(project => {
              if (project.projectName.toLowerCase().indexOf(searchText.toLowerCase()) > -1) {
                return project;
              }
            })
            .slice(0, 10)
            .map(item => (
              <div
                className="project-auto-complete"
                key={item._id}
                onClick={() => {
                  onInputChange(item.projectName);
                  toggle(false);
                  props.onDropDownSelect(item);
                }}
              >
                {item.projectName}
              </div>
            ))}
        </div>
      ) : (
        <></>
      )}
    </Dropdown>
  );
});

export default AddProjectsAutoComplete;
