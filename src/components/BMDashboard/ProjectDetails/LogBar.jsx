import React from 'react';
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
      {Object.keys(buttonStyles).map((section, index) => (
        <div key={index} className={`log-bar__section`}>
          <h2>
            {section === 'dailyLogging'
              ? 'Daily Logging:'
              : section === 'newItem'
              ? 'Add a New Item:'
              : 'Team:'}
          </h2>
          <ul className="log-bar__btn-group">
            {buttonLabels[section].map((label, i) => (
              <li key={i}>
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
