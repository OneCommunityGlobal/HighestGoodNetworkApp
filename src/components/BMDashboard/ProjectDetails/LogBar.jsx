import React from 'react';
import { Button } from 'reactstrap';

function LogBar() {
  return (
    <div className="logBar-container">
      <div className="logBar-section">
        <p>Daily Logging:</p>
        <div className="logBar-btnGroup">
          <Button className="greenBtn">Time</Button> <Button className="greenBtn">Material</Button>{' '}
          <Button className="greenBtn">Tool/Equipment</Button>
        </div>
      </div>
      <div className="logBar-section">
        <p>Add a new item:</p>
        <div className="logBar-btnGroup">
          <Button
            className="lightBlueBtn"
            // style={{ backgroundColor: '#0f6386', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Team
          </Button>{' '}
          <Button className="lightBlueBtn">Material</Button>{' '}
          <Button className="lightBlueBtn">Tool/Equipment</Button>
        </div>
      </div>
      <div className="logBar-section">
        <p>Team:</p>
        <div className="logBar-btnGroup thirdSection">
          <Button className="darkBlueBtn">Create New Team</Button>{' '}
          <Button className="darkBlueBtn">Edit Existing Team</Button>{' '}
          <Button className="redBtn">Log Issue</Button>
        </div>
      </div>
    </div>
  );
}

export default LogBar;
