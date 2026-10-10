import React, { useEffect, useRef, useState } from 'react';
import { Dropdown, Input } from 'reactstrap';
import debounce from 'lodash/debounce';
import './TeamsAndProjects.module.css';
import { useSelector } from 'react-redux';
import appStyles from '~/App.module.css';

const SEARCH_DEBOUNCE_MS = 300;

// eslint-disable-next-line react/display-name
const AddProjectsAutoComplete = React.memo(props => {
  const [isOpen, toggle] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    try {
      if (!props.selectedProject) props.onInputChange('');
     else props.onInputChange(props.selectedProject.projectName);
    } catch (error) {
      if (!props.selectedProject) props.onInputChange('');
    }
  }, [props.selectedProject]);

  // The input stays fully responsive via props.searchText; only the (re)filtering
  // of the suggestion list is debounced so rapid keystrokes don't recompute it every time.
  const [debouncedSearchText, setDebouncedSearchText] = useState(props.searchText);
  const debouncedSetSearchText = useRef(
    debounce(value => setDebouncedSearchText(value), SEARCH_DEBOUNCE_MS, {
      leading: true,
      trailing: true,
    }),
  ).current;

  useEffect(() => {
    debouncedSetSearchText(props.searchText);
  }, [props.searchText, debouncedSetSearchText]);

  useEffect(() => () => debouncedSetSearchText.cancel(), [debouncedSetSearchText]);

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
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={true}
        onChange={e => {
          props.onInputChange(e.target.value);
          toggle(true);
          props.isSetUserIsNotSelectedAutoComplete(true);
        }}
        className={`${darkMode ? `${appStyles['bg-darkmode-liblack']} border-0 text-light` : ''}`}
      />

      {props.searchText !== '' && props.projectsData && props.projectsData.length > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''} ${
            darkMode ? `${appStyles['bg-darkmode-liblack']} text-light` : ''
          }`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {props.projectsData
            .filter(project => {
              if (
                props.formatText(project.projectName).includes(props.formatText(debouncedSearchText))
              ) {
                return project;
              }
            })
            .slice(0, 10)
            .map(item => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
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
            item => props.formatText(item.projectName) !== props.formatText(debouncedSearchText),
          ) && (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              className="project-auto-complete"
              onClick={() => {
                toggle(false);
                props.setIsOpenDropdown(true);
              }}
            >
              Create new project: {debouncedSearchText}
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


