import React from 'react';
import { Button } from 'reactstrap';

function LogBar() {
  return (
    <div className="log-bar">
      <div className="log-bar__section">
        <h2>Daily Logging:</h2>
        <ul className="log-bar__btn-group">
          <li>
            <Button className="button button--green">Time</Button>
          </li>{' '}
          <li>
            <Button className="button button--green">Material</Button>
          </li>{' '}
          <li>
            <Button className="button button--green">Tool/Equipment</Button>
          </li>
        </ul>
      </div>
      <div className="log-bar__section">
        <h2>Add a new item:</h2>
        <ul className="log-bar__btn-group">
          <li>
            <Button className="button button--blue">Team</Button>
          </li>{' '}
          <li>
            <Button className="button button--blue">Material</Button>
          </li>{' '}
          <li>
            <Button className="button button--blue">Tool/Equipment</Button>
          </li>
        </ul>
      </div>
      <div className="log-bar__section">
        <h2>Team:</h2>
        <ul className="log-bar__btn-group">
          <li>
            <Button className="button button--indigo">Create New Team</Button>
          </li>{' '}
          <li>
            <Button className="button button--indigo">Edit Existing Team</Button>
          </li>{' '}
          <li>
            <Button className="button button--maroon">Log Issue</Button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default LogBar;
