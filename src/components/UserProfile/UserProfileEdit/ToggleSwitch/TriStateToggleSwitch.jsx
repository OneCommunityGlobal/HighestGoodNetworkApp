import styles from './TriStateToggleSwitch.module.css';
import React, { useState, useEffect } from 'react';

function TriStateToggleSwitch({ pos, onChange }) {
  const [position, setPosition] = useState(pos || 'default');
  const [bgColor, setBgColor] = useState('');

  const handleClick = newPos => {
    setPosition(newPos);
    if (onChange) onChange(newPos);
    if (newPos === 'posted') setBgColor('blue');
    else if (newPos === 'default') setBgColor('darkgray');
    else setBgColor('green');
  };

  useEffect(() => {
    if (pos) setPosition(pos);
    if (pos === 'posted') setBgColor('blue');
    else if (pos === 'default') setBgColor('darkgray');
    else setBgColor('green');
  }, [pos]);

    return (
    <div data-testid="toggle-switch" className={`${styles['toggle-switch']} ${styles[`bg-${bgColor}`]}`}>
      <div data-testid="knob-area" className={styles['knob-area']} style={{ position: 'relative', zIndex: 1 }}>
        {['posted', 'default', 'requested'].map(p => (
          <div
            key={p}
            data-testid={`option-${p}`}
            role="button"
            tabIndex={0}
            onClick={() => handleClick(p)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick(p)}
          />
        ))}
      </div>
      <div data-testid="knob" className={`${styles.knob} ${styles[position]}`} />
    </div>
  );
}

export default TriStateToggleSwitch;