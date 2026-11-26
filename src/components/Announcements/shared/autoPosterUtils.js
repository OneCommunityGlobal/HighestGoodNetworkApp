import { toast } from 'react-toastify';

export const pad = value => String(value).padStart(2, '0');

export const formatDate = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatTime = date => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const formatDateTime = (date, time) => {
  if (!date) return 'Date unavailable';

  const parsed = new Date(`${date}T${time || '00:00'}`);

  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: time ? 'short' : undefined,
      });
};

export const normalizeScheduleDateTime = (scheduledDate, scheduledTime) => {
  const now = new Date();
  const today = formatDate(now);
  const currentTime = formatTime(now);

  let date = scheduledDate || today;
  let time = scheduledTime || currentTime;

  if (date < today) date = today;

  if (date === today && time < currentTime) {
    time = currentTime;
  }

  return { date, time };
};

export const formatExcerpt = (content, fallback) =>
  content.length > 140 ? `${content.slice(0, 140).trim()}…` : content || fallback;

export const copyText = async (text, label) => {
  if (!text?.trim()) {
    toast.warn(`Nothing to copy for ${label}.`);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}.`);
  }
};

export const buttonStyle = (variant, darkMode, palette) => {
  const base = {
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    padding: '10px 18px',
    transition: 'filter 0.2s ease',
  };

  if (variant === 'primary') {
    return { ...base, backgroundColor: palette.primary, color: '#fff' };
  }

  if (variant === 'outline') {
    return {
      ...base,
      backgroundColor: 'transparent',
      color: darkMode ? '#9bb5ff' : palette.primary,
      border: `1px solid ${darkMode ? '#3d4d6d' : palette.primary}`,
    };
  }

  return {
    ...base,
    backgroundColor: darkMode ? '#1c2b44' : palette.ghostBackground,
    color: darkMode ? '#cfd9f8' : palette.ghostText,
  };
};
