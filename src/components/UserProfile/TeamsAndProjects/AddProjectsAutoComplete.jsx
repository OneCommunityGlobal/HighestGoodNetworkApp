import React, { useEffect, useState } from 'react';
import { Dropdown, Input } from 'reactstrap';
import './TeamsAndProjects.css';
import { useSelector } from 'react-redux';

const AddProjectsAutoComplete = React.memo(props => {
  const [isOpen, toggle] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

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
        autoFocus
        onChange={e => {
          props.onInputChange(e.target.value);
          toggle(true);
          props.isSetUserIsNotSelectedAutoComplete(true);
        }}
        className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
      />

      {props.searchText !== '' && props.projectsData && props.projectsData.length > 0 && (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''} ${
            darkMode ? 'bg-darkmode-liblack text-light' : ''
          }`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.projectsData
            .filter(project =>
              props.formatText(project.projectName).includes(props.formatText(props.searchText)),
            )
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
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    props.onInputChange(item.projectName);
                    toggle(false);
                    props.onDropDownSelect(item);
                  }
                }}
              >
                {item.projectName}
              </div>
            ))}

          {props.projectsData.every(
            item => props.formatText(item.projectName) !== props.formatText(props.searchText),
          ) && (
            <div
              className="project-auto-complete"
              onClick={() => {
                toggle(false);
                props.setIsOpenDropdown(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggle(false);
                  props.setIsOpenDropdown(true);
                }
              }}
            >
              Create new project: {props.searchText}
            </div>
          )}
        </div>
      )}
    </Dropdown>
  );
});

export default AddProjectsAutoComplete;
