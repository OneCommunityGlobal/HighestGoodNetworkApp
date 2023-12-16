import React from 'react';

function MockNavLink({ active, onClickHandler, id, children }) {
  // Simulate the behavior or structure of NavLink
  const onClick = () => {
    onClickHandler(id); // Pass the ID to the provided onClickHandler
  };
  return (
    <a href="#" className={`nav-link${active ? ' active' : ''}`} onClick={onClick} id={id}>
      {children}
    </a>
  );
}

export default MockNavLink;
