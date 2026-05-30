// eslint-disable-next-line no-unused-vars
import React from 'react';
import './LoginPrivileges.css';

function LoginPrivileges({ selectedInput, handleInputChange }) {
  return (
    <form>
      <div className="login-privileges-container">
        <div>
          <label htmlFor="isManager">
            <input
              type="radio"
              id="isManager"
              name="role"
              value="isManager"
              checked={selectedInput === 'isManager'}
              onChange={handleInputChange}
            />
            Manager
          </label>
        </div>
        <div>
          <label htmlFor="isAdmin">
            <input
              type="radio"
              id="isAdmin"
              name="role"
              value="isAdmin"
              checked={selectedInput === 'isAdmin'}
              onChange={handleInputChange}
            />
            Admin
          </label>
        </div>
      </div>
    </form>
  );
}

export default LoginPrivileges;
