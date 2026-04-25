import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { toast } from 'react-toastify';

export default function CountdownTimer({ date, darkMode }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calcTimeLeft = () => {
      const difference = +date - +new Date();
      if (difference <= 0) return {};

      return {
        Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        Min: Math.floor((difference / 1000 / 60) % 60),
        Sec: Math.floor((difference / 1000) % 60),
      };
    };

    const interval = setInterval(() => {
      const newTimeLeft = calcTimeLeft();
      setTimeLeft(newTimeLeft);

      if (isEmpty(newTimeLeft)) {
        clearInterval(interval);
        toast('✔ Time is up!', {
          toastId: 'toast-times-up',
          pauseOnFocusLoss: false,
          autoClose: 4000,
          onClose: () => window.location.reload(true),
        });
      }
    }, 1000);

    // Initial call
    setTimeLeft(calcTimeLeft());

    return () => clearInterval(interval);
  }, [date]);

  const addLeadingZeros = value => {
    return String(value).padStart(2, '0');
  };

  const pluralOrSingle = (label, value) => {
    if (value === 1) {
      if (label === 'Days') return 'Day';
      if (label === 'Hours') return 'Hour';
    }
    return label;
  };

  return (
    <div className={`countdown ${darkMode ? 'text-white' : 'text-black'}`}>
      {!isEmpty(timeLeft) ? (
        Object.entries(timeLeft).map(([interval, value]) => (
          <span key={interval} className="countdown__col">
            <span className="countdown__col__element">
              <strong className={darkMode ? 'text-white' : 'text-black'}>
                {addLeadingZeros(value)}
              </strong>
              <span>{pluralOrSingle(interval, value)}</span>
            </span>
          </span>
        ))
      ) : (
        <span className="countdown__times-up">Time&apos;s up!</span>
      )}
    </div>
  );
}

CountdownTimer.propTypes = {
  date: PropTypes.shape({
    _d: PropTypes.instanceOf(Date).isRequired,
    _isAMomentObject: PropTypes.bool.isRequired,
    _isValid: PropTypes.bool.isRequired,
  }).isRequired,
  // eslint-disable-next-line react/require-default-props
  darkMode: PropTypes.bool,
};
