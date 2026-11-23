import React from 'react';

const DashboardSection = ({ title, children }) => {
  return (
    <div
      className="dashboardHeader"
      style={{
        textAlign: 'center',
        marginTop: '20px',
        marginBottom: '10px',
      }}
    >
      <h2
        style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          marginBottom: '10px',
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default DashboardSection;
