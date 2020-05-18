import React, { useEffect, useState } from 'react';
import _ from 'lodash';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

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
          )) : <span className="countdown__times-up">Times up!</span>
      }
    </div>
  );
}

export default CountdownTimer;
