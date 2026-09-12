import { useState, useEffect } from 'react';

/**
 * Hook that counts down to a specified timestamp
 * @param {number} expiresAt - Timestamp in milliseconds when countdown expires
 * @returns {number} Seconds remaining until expiration
 */
export const useCountdown = expiresAt => {
  const calculateTimeLeft = () => {
    if (!expiresAt) return 0;
    const difference = expiresAt - Date.now();
    return Math.max(0, Math.floor(difference / 1000));
  };

  const [seconds, setSeconds] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!expiresAt) return undefined;

    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      setSeconds(timeLeft);

      // Clear interval when countdown reaches zero
      if (timeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // Clean up the interval on unmount
    return () => clearInterval(timer);
  }, [expiresAt]);

  return seconds;
};

export default useCountdown;
