import React from 'react';

function MockNavLink({ active, onClick, id, children }) {
  // Simulate the behavior or structure of NavLink
  return (
    <a href="#" className={`nav-link${active ? ' active' : ''}`} onClick={onClick} id={id}>
      {children}
    </a>
  );
}

export default MockNavLink;
