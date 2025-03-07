import React, { useEffect, useState } from 'react';
import { Dropdown, Input } from 'reactstrap';

const AssignTeamCodeField = React.memo(props => {
  const {
    isError = false,
    teamCodeData,
    selectedTeamCode,
    onSelectTeamCode,
    cleanTeamCodeAssign,
    onDropDownSelect,
    editMode,
    value,
  } = props;

  const [searchText, onInputChange] = useState(() => {
    if (editMode) {
      return value;
    }
    return '';
  });
  const [isOpen, toggle] = useState(false);
  useEffect(() => {
    if (selectedTeamCode && selectedTeamCode !== searchText) {
      onSelectTeamCode(undefined);
      cleanTeamCodeAssign();
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
        autoFocus
        onChange={e => {
          onInputChange(e.target.value);
          toggle(true);
        }}
        style={{
          borderColor: isError ? 'red' : '',
          borderWidth: isError ? '2px' : '',
        }}
      />

      {searchText !== '' && teamCodeData?.length > 0 ? (
        <div
          tabIndex="-1"
          role="menu"
          aria-hidden="false"
          className={`dropdown-menu${isOpen ? ' show' : ''}`}
          style={{ marginTop: '0px', width: '100%' }}
        >
          {teamCodeData
            .filter(teamCode => {
              return teamCode.value.toLowerCase().includes(searchText.toLowerCase());
            })
            .slice(0, 10)
            .map((teamCode, index) => (
              <div
                className="project-auto-complete"
                key={index}
                onClick={() => {
                  onInputChange(teamCode.value);
                  toggle(false);
                  onDropDownSelect(teamCode.value);
                }}
              >
                {teamCode.value}
              </div>
            ))}
        </div>
      ) : null}
    </Dropdown>
  );
});

export default AssignTeamCodeField;
