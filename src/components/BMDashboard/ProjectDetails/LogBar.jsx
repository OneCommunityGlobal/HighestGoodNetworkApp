import React from 'react';
import { Button } from 'reactstrap';

function LogBar() {
  return (
    <div className="logBar-container">
      <div className="logBar-section">
        <h2>Daily Logging:</h2>
        <ul className="logBar-btnGroup">
          <li>
            <Button className="button greenBtn">Time</Button>
          </li>{' '}
          <li>
            <Button className="button greenBtn">Material</Button>
          </li>{' '}
          <li>
            <Button className=" button greenBtn">Tool/Equipment</Button>
          </li>
        </ul>
      </div>
      <div className="logBar-section">
        <h2>Add a new item:</h2>
        <ul className="logBar-btnGroup">
          <li>
            <Button className="button lightBlueBtn">Team</Button>
          </li>{' '}
          <li>
            <Button className="button lightBlueBtn">Material</Button>
          </li>{' '}
          <li>
            <Button className="button lightBlueBtn">Tool/Equipment</Button>
          </li>
        </ul>
      </div>
      <div className="logBar-section">
        <h2>Team:</h2>
        <ul className="logBar-btnGroup">
          <li>
            <Button className="button darkBlueBtn">Create New Team</Button>
          </li>{' '}
          <li>
            <Button className="button darkBlueBtn">Edit Existing Team</Button>
          </li>{' '}
          <li>
            <Button className="button redBtn">Log Issue</Button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default LogBar;
