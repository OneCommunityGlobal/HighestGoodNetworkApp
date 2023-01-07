/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import './LoginPrivilegesSimulation.css';

function LoginPrivilegesSimulation({ selectedInput, handleInputChange }) {
//   // Create a state variable to store the selected radio input
//   const [selectedInput, setSelectedInput] = useState('isManager');

  //   // Event handler for when a radio input is selected
  //   const handleInputChange = (event) => {
  //     // Update the selectedInput state variable with the value of the selected radio input
  //     setSelectedInput(event.target.value);
  //   };

  return (
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
