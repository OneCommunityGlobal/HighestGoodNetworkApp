import React from 'react';
import { Button } from 'reactstrap';

function LogBar() {
  return (
    <div className="logBar-container">
      <div className="logBar-section">
        <p>Daily Logging:</p>
        <div className="logBar-btnGroup">
          <Button
            style={{ backgroundColor: '#015d4a', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Time
          </Button>{' '}
          <Button
            style={{ backgroundColor: '#015d4a', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Material
          </Button>{' '}
          <Button
            style={{ backgroundColor: '#015d4a', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Tool/Equipment
          </Button>
        </div>
      </div>
      <div className="logBar-section">
        <p>Add a new item:</p>
        <div className="logBar-btnGroup">
          <Button
            style={{ backgroundColor: '#0f6386', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Team
          </Button>{' '}
          <Button
            style={{ backgroundColor: '#0f6386', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Material
          </Button>{' '}
          <Button
            style={{ backgroundColor: '#0f6386', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Tool/Equipment
          </Button>
        </div>
      </div>
      <div className="logBar-section">
        <p>Team:</p>
        <div className="logBar-btnGroup">
          <Button
            style={{ backgroundColor: '#203844', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Create New Team
          </Button>{' '}
          <Button
            style={{ backgroundColor: '#203844', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Edit Existing Team
          </Button>{' '}
          <Button
            style={{ backgroundColor: '#980101', border: 0, borderRadius: '10px', margin: '0.1em' }}
          >
            Log Issue
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LogBar;
