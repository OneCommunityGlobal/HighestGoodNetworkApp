import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';

/**
 * Team Assignment text input (no dropdown, no internal label).
 * - Looks like a standard text field (same as Project Assignment UI).
 * - As user types, we emit { _id, teamName }. _id is set only if there's an exact match.
 * - Parent should render the external <Label> ("Team Assignment:") just like other fields.
 */
export default function AssignTeamField({
  teamsData = [],
  value = null,                 // null | string(teamId) | { _id, teamName }
  onChange,
  disabled = false,
  inputId = 'team-assignment',
  placeholder = '',
}) {
  const safeTeams = useMemo(
    () => (Array.isArray(teamsData) ? teamsData.filter(Boolean) : []),
    [teamsData]
  );

  // Resolve initial display text from incoming value
  const nameFromValue = (v) => {
    if (!v) return '';
    if (typeof v === 'string') {
      const found = safeTeams.find(t => t?._id === v);
      return found ? (found.teamName || '') : '';
    }
    if (typeof v === 'object') {
      return v.teamName || '';
    }
    return '';
  };

  const [text, setText] = useState(nameFromValue(value));

  // Keep local text in sync if parent updates value (e.g., when opening edit)
  useEffect(() => {
    setText(nameFromValue(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, safeTeams]);

  // Emit normalized object whenever user types
  const handleChange = (e) => {
    const next = e.target.value;
    setText(next);

    // If the typed name exactly matches a known team (case-insensitive), attach its _id
    const found = safeTeams.find(
      (t) => (t.teamName || '').toLowerCase() === (next || '').trim().toLowerCase()
    );

    const payload = found
      ? { _id: found._id, teamName: found.teamName || '' }
      : { _id: '', teamName: next };

    if (typeof onChange === 'function') onChange(payload);
  };

  return (
    <Input
      id={inputId}
      type="text"
      value={text}
      placeholder={placeholder}
      disabled={disabled}
      onChange={handleChange}
      autoComplete="off"
    />
  );
}

AssignTeamField.propTypes = {
  teamsData: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      teamName: PropTypes.string,
    })
  ),
  value: PropTypes.oneOfType([
    PropTypes.oneOf([null]),
    PropTypes.string, // team id
    PropTypes.shape({ _id: PropTypes.string, teamName: PropTypes.string }),
  ]),
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  inputId: PropTypes.string,
  placeholder: PropTypes.string,
};
