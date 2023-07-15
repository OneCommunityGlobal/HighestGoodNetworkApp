import React from 'react';
import './LoginPrivileges.css';

export function LoginPrivileges({ selectedInput, handleInputChange }) {
  return (
    <form>
      <div className="login-privileges-container">
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
      </div>
    </form>
  );
}
