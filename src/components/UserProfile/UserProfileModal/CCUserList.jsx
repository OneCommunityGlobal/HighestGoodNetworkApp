import React from 'react';

const CcUserList = ({ users }) => {
  if (!Array.isArray(users) || users.length === 0) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      <small
        style={{
          display: 'block',
          color: '#6c757d',
          fontSize: '0.85rem',
          fontWeight: 500,
          marginBottom: '4px',
        }}
      >
        CC’d Users:
      </small>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {users.map((u, i) => (
          <span
            key={i}
            style={{
              backgroundColor: '#e9ecef',
              borderRadius: '16px',
              padding: '6px 12px',
              fontSize: '0.85rem',
              color: '#343a40',
            }}
          >
            {u.firstName} {u.lastName} &lt;{u.email}&gt;
          </span>
        ))}
      </div>
    </div>
  );
};

export default CcUserList;
