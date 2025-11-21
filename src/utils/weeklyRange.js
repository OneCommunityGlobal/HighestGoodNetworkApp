const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateInput(date) {
  const d = toDateOnly(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(date) {
  const d = toDateOnly(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; 
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeekMondayStart(date) {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

export function diffInDays(startStr, endStr) {
  const start = toDateOnly(new Date(startStr));
  const end = toDateOnly(new Date(endStr));
  return Math.round((end - start) / MS_PER_DAY) + 1;
}

export function getWeeksBucketForRange(startStr, endStr) {
  const days = diffInDays(startStr, endStr);
  if (days <= 28) return 4;
  if (days <= 56) return 8;
  return 12;
}

export function validateRange(startStr, endStr) {
  if (!startStr || !endStr) {
    return { valid: false, message: '' };
  }

  const start = new Date(startStr);
  const end = new Date(endStr);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid date(s) selected.' };
  }

  if (end < start) {
    return { valid: false, message: 'Start date must be before or equal to end date.' };
  }

  const days = diffInDays(startStr, endStr);
  if (days > 84) {
    return {
      valid: false,
      message: 'Selected range exceeds 12 weeks. Please shorten the range.',
    };
  }

  return { valid: true, message: '' };
}

export function getDefaultWeeklyRange() {
  const today = new Date();
  const end = endOfWeekMondayStart(today);
  const start = new Date(end);
  start.setDate(start.getDate() - (8 * 7 - 1));
  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
    weeks: 8,
  };
}

export function getLastNWeeksRange(weeks) {
  const today = new Date();
  const end = endOfWeekMondayStart(today);
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));
  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
    weeks,
  };
}