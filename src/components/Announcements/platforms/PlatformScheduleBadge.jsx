import { useEffect, useState } from 'react';

const scheduleCounts = new Map();
const listeners = new Map();

const getScheduleCount = platform => scheduleCounts.get(platform) || 0;

const notify = (platform, count) => {
  const platformListeners = listeners.get(platform);
  if (!platformListeners) return;
  platformListeners.forEach(listener => {
    try {
      listener(count);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('PlatformScheduleBadge listener error', error);
    }
  });
};

export const setPlatformScheduleCount = (platform, count) => {
  if (!platform) return;
  const normalizedCount = Math.max(0, Number.isFinite(count) ? count : 0);
  const nextCount = Math.round(normalizedCount);
  scheduleCounts.set(platform, nextCount);
  notify(platform, nextCount);
};

const subscribeToScheduleCount = (platform, listener) => {
  if (!listeners.has(platform)) listeners.set(platform, new Set());
  const platformListeners = listeners.get(platform);
  platformListeners.add(listener);
  return () => {
    platformListeners.delete(listener);
    if (platformListeners.size === 0) {
      listeners.delete(platform);
    }
  };
};

export const usePlatformScheduleCount = platform => {
  const [count, setCount] = useState(() => getScheduleCount(platform));

  useEffect(() => {
    setCount(getScheduleCount(platform));
    return subscribeToScheduleCount(platform, setCount);
  }, [platform]);

  return count;
};

const PlatformScheduleBadge = ({ platform, className }) => {
  const count = usePlatformScheduleCount(platform);
  if (!count) return null;
  const displayValue = count > 99 ? '99+' : count;
  return <span className={className}>{displayValue}</span>;
};

export default PlatformScheduleBadge;
