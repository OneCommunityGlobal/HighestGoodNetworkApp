import React, { useEffect, useState } from 'react';
import { Dropdown, Input } from 'reactstrap';


const AssignProjectField = React.memo(props => {
  const [searchText, onInputChange] = useState(()=>{
    if(props.editMode){
      return props.value.projectName
    }else{
      return ''
    }
  });
  const [isOpen, toggle] = useState(false);

  useEffect(() => {
    if (props.selectedProject && props.selectedProject.projectName !== searchText) {
      props.onSelectProject(undefined);
      props.cleanProjectAssign();
    }
  }, [searchText]);

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
        autoFocus={true}
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

export default AssignProjectField;
