import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from 'reactstrap';

// button styles for each section
const buttonStyles = {
  dailyLogging: 'green',
  newItem: 'blue',
  team: 'indigo',
};

//  button labels for each section
const buttonLabels = {
  dailyLogging: ['Time', 'Material', 'Tool/Equipment'],
  newItem: ['Team', 'Material', 'Tool/Equipment'],
  team: ['Create New Team', 'Edit Existing Team', 'Log Issue'],
};

function LogBar() {
  return (
    <div className="log-bar">
      {Object.keys(buttonStyles).map(section => (
        <div key={uuidv4()} className="log-bar__section">
          <h2>
            {(() => {
              switch (section) {
                case 'dailyLogging':
                  return 'Daily Logging:';
                case 'newItem':
                  return 'Add a New Item:';
                default:
                  return 'Team';
              }
            })()}
          </h2>
          <ul className="log-bar__btn-group">
            {buttonLabels[section].map(label => (
              <li key={uuidv4()}>
                <Button
                  type="button"
                  className={
                    label === 'Log Issue'
                      ? `button button--maroon`
                      : `button button--${buttonStyles[section]}`
                  }
                >
                  {label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default LogBar;
