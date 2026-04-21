import { useState, useEffect } from 'react';
import './TriMembersStateToggleSwitch.css';

function TriMembersStateToggleSwitch({ onChange }) {
  const [position, setPosition] = useState('default');
  const [bgColor, setBgColor] = useState('darkgray');

  const handleClick = pos => {
    setPosition(pos);
    switch (pos) {
      case 'posted':
        setBgColor('blue');
        onChange({ showInactive: true, showActive: false });
        break;
      case 'default':
        setBgColor('darkgray');
        onChange({ showInactive: false, showActive: false });
        break;
      case 'requested':
        setBgColor('green');
        onChange({ showInactive: false, showActive: true });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    handleClick('default');
  }, []);

  return (
    <div className={`toggle-switch bg-${bgColor}`}>
      <div className="knob-area">
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleClick('posted')}
          onKeyDown={e => e.key === 'Enter' && handleClick('posted')}
          aria-label="Show posted"
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleClick('default')}
          onKeyDown={e => e.key === 'Enter' && handleClick('default')}
          aria-label="Show default"
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleClick('requested')}
          onKeyDown={e => e.key === 'Enter' && handleClick('requested')}
          aria-label="Show requested"
        />
      </div>
      <div className={`knob ${position}`} />
    </div>
  );
}

export default TriMembersStateToggleSwitch;
