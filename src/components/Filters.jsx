import React from 'react';

const Filters = ({ roles, selectedRoles, setSelectedRoles, dates, setDates }) => {
  return (
    <div style={{ marginBottom: 20 }}>
      <label>
        Start Date:
        <input
          type="date"
          value={dates.start}
          onChange={e => setDates(prev => ({ ...prev, start: e.target.value }))}
        />
      </label>
      <label>
        End Date:
        <input
          type="date"
          value={dates.end}
          onChange={e => setDates(prev => ({ ...prev, end: e.target.value }))}
        />
      </label>
      <label>
        Role:
        <select
          multiple
          value={selectedRoles}
          onChange={e => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedRoles(selected);
          }}
        >
          {roles.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default Filters;
