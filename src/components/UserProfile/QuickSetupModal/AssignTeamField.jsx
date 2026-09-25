import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';

export default function AssignTeamField({
  teamsData = [],
  value = null,
  onChange,
  disabled = false,
  inputId = 'team-assignment',
  placeholder = '',
  darkMode = false,
}) {
  // Only active teams should be available for assignment.
  const activeTeams = useMemo(
    () =>
      (Array.isArray(teamsData) ? teamsData : [])
        .filter(Boolean)
        .filter(team => team.isActive === true),
    [teamsData]
  );

  const nameFromValue = value => {
    if (!value) return '';

    if (typeof value === 'string') {
      const found = activeTeams.find(team => team?._id === value);
      return found ? found.teamName || '' : '';
    }

    if (typeof value === 'object') {
      return value.teamName || '';
    }

    return '';
  };

  const [text, setText] = useState(nameFromValue(value));
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setText(nameFromValue(value));
  }, [value, activeTeams]);

  const suggestions = useMemo(() => {
    const search = text.trim().toLowerCase();

    if (!search) {
      return activeTeams;
    }

    return activeTeams.filter(team =>
      (team.teamName || '').toLowerCase().includes(search)
    );
  }, [text, activeTeams]);

  const handleChange = e => {
    const next = e.target.value;

    setText(next);
    setShowSuggestions(true);

    const found = activeTeams.find(
      team =>
        (team.teamName || '').trim().toLowerCase() ===
        next.trim().toLowerCase()
    );

    const payload = found
      ? {
          _id: found._id,
          teamName: found.teamName || '',
        }
      : {
          _id: '',
          teamName: next,
        };

    if (typeof onChange === 'function') {
      onChange(payload);
    }
  };

  const handleSelect = team => {
    const selectedTeam = {
      _id: team._id,
      teamName: team.teamName || '',
    };

    setText(selectedTeam.teamName);
    setShowSuggestions(false);

    if (typeof onChange === 'function') {
      onChange(selectedTeam);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setShowSuggestions(true);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Input
        id={inputId}
        type="text"
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        autoComplete="off"
      />

      {showSuggestions && !disabled && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1050,
            backgroundColor: darkMode ? '#335b6c' : undefined,
            color: darkMode ? '#fff' : undefined,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
        {suggestions.map(team => (
         // eslint-disable-next-line jsx-a11y/no-static-element-interactions
         <div
          key={team._id}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          onMouseDown={e => {
            e.preventDefault();
            handleSelect(team);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSelect(team);
            }
          }}
          style={{
                padding: '8px 12px',
                cursor: 'pointer',
                color: darkMode ? 'white' : '#212529',
              }}
         >
       {team.teamName}
       </div>

      ))}
        </div>
      )}
    </div>
  );
}

AssignTeamField.propTypes = {
  teamsData: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      teamName: PropTypes.string,
      isActive: PropTypes.bool,
    })
  ),
  value: PropTypes.oneOfType([
    PropTypes.oneOf([null]),
    PropTypes.string,
    PropTypes.shape({
      _id: PropTypes.string,
      teamName: PropTypes.string,
    }),
  ]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  inputId: PropTypes.string,
  placeholder: PropTypes.string,
  darkMode: PropTypes.bool,
};

