import React from 'react';
import { Button } from 'reactstrap';
import './LogBar.css';

function LogBar() {
  return (
    <div className="logBar-container">
      <div className="logBar-section">
        <p>Daily Logging:</p>
        <div className="logBar-btnGroup">
          <Button style={{ backgroundColor: '#015d4a', border: 0, borderRadius: '10px' }}>
            Time
          </Button>{' '}
          <Button style={{ backgroundColor: '#015d4a', border: 0, borderRadius: '10px' }}>
            Material
          </Button>{' '}
          <Button style={{ backgroundColor: '#015d4a', border: 0, borderRadius: '10px' }}>
            Tool/Equipment
          </Button>
        </div>
      </div>
      <div className="logBar-section">
        <p>Add a new item:</p>
        <div className="logBar-btnGroup">
          <Button style={{ backgroundColor: '#0d5675', border: 0, borderRadius: '10px' }}>
            Team
          </Button>{' '}
          <Button style={{ backgroundColor: '#0d5675', border: 0, borderRadius: '10px' }}>
            Material
          </Button>{' '}
          <Button style={{ backgroundColor: '#0d5675', border: 0, borderRadius: '10px' }}>
            Tool/Equipment
          </Button>
        </div>
      </div>
      <div className="logBar-section">
        <p>Team:</p>
        <div className="logBar-btnGroup">
          <Button style={{ backgroundColor: '#203844', border: 0, borderRadius: '10px' }}>
            Create New Team
          </Button>{' '}
          <Button style={{ backgroundColor: '#203844', border: 0, borderRadius: '10px' }}>
            Edit Existing Team
          </Button>{' '}
          <Button style={{ backgroundColor: '#980101', border: 0, borderRadius: '10px' }}>
            Log Issue
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LogBar;
