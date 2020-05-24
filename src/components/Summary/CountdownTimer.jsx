import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';

function CountdownTimer({ date }) {
  const calcTimeLeft = () => {
    const difference = +date - +new Date();

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        Min: Math.floor((difference / 1000 / 60) % 60),
        Sec: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

  const timer = setTimeout(() => {
    setTimeLeft(calcTimeLeft());
  }, 1000);

  useEffect(() => () => clearTimeout(timer));

  const addLeadingZeros = (interval) => {
    let tli = String(timeLeft[interval]);
    while (tli.length < 2) {
      tli = `0${tli}`;
    }
    return tli;
  };

  const pluralOrSingle = (interval) => {
    let tempInterval = interval;
    if (timeLeft[interval] === 1 && interval === 'Days') tempInterval = 'Day';
    else if (timeLeft[interval] === 1 && interval === 'Hours') tempInterval = 'Hour';
    return tempInterval;
  };

  const whenTimeIsUp = () => {
    clearTimeout(timer);

    toast('✔ Time is up!', {
      onClose: () => window.location.reload(true),
    });

    return <span className="countdown__times-up">Time's up!</span>;
  };

  return (
    <div className="countdown">
      {
        !_.isEmpty(timeLeft)
          ? Object.keys(timeLeft).map(interval => (
            <span key={interval} className="countdown__col">
              <span className="countdown__col__element">
                <strong>{addLeadingZeros(interval)}</strong>
                {' '}
                <span>{pluralOrSingle(interval)}</span>
              </span>
            </span>
            // )) : <span className="countdown__times-up">Times up!</span>
          )) : whenTimeIsUp()
      }
    </div>
  );
}

export default CountdownTimer;
