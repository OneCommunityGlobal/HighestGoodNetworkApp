import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { toast } from 'react-toastify';

// Use named export in order for automated tests to work properly.
// eslint-disable-next-line import/prefer-default-export
export function CountdownTimer({ date }) {
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

  const addLeadingZeros = interval => {
    let tli = String(timeLeft[interval]);
    while (tli.length < 2) {
      tli = `0${tli}`;
    }
    return tli;
  };

  const pluralOrSingle = interval => {
    let tempInterval = interval;
    if (timeLeft[interval] === 1 && interval === 'Days') tempInterval = 'Day';
    else if (timeLeft[interval] === 1 && interval === 'Hours') tempInterval = 'Hour';
    return tempInterval;
  };

  // Providing a custom toast id to prevent duplicate.
  const toastCustomId = 'toast-times-up';

  const whenTimeIsUp = () => {
    clearTimeout(timer);

    toast('✔ Time is up!', {
      toastId: toastCustomId,
      pauseOnFocusLoss: false,
      autoClose: 4000,
      onClose: () => window.location.reload(true),
    });

    return <span className="countdown__times-up">Time&apos;s up!</span>;
  };

  return (
    <div className="countdown">
      {!isEmpty(timeLeft)
        ? Object.keys(timeLeft).map(interval => (
            <span key={interval} className="countdown__col">
              <span className="countdown__col__element">
                <strong>{addLeadingZeros(interval)}</strong> <span>{pluralOrSingle(interval)}</span>
              </span>
            </span>
          ))
        : whenTimeIsUp()}
    </div>
  );
}

CountdownTimer.propTypes = {
  date: PropTypes.shape({
    _d: PropTypes.instanceOf(Date).isRequired,
    _isAMomentObject: PropTypes.bool.isRequired,
    _isValid: PropTypes.bool.isRequired,
  }).isRequired,
};
