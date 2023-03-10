import React from 'react';
import './LoginPrivilegesSimulation.css';

function LoginPrivilegesSimulation({ selectedInput, handleInputChange }) {return (
  <form>
    <div className="container">

      <div>
        <input
          type="radio"
          id="isManager"
          name="role"
          value="isManager"
          checked={selectedInput === 'isManager'}
          onChange={handleInputChange}
        />
        <label htmlFor="isManager">Manager</label>
      </div>
      <div>
        <input
          type="radio"
          id="isAdmin"
          name="role"
          value="isAdmin"
          checked={selectedInput === 'isAdmin'}
          onChange={handleInputChange}
        />
        <label htmlFor="isAdmin">Admin</label>
      </div>
      <div>
        <input
          type="radio"
          id="isOwner"
          name="role"
          value="isOwner"
          checked={selectedInput === 'isOwner'}
          onChange={handleInputChange}
        />
        <label htmlFor="isOwner">Owner</label>
      </div>
    </div>
  </form>
);
}

export default LoginPrivilegesSimulation;