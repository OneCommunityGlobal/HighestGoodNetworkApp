export function formateDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function formatEventDisplay(event) {
  const start = new Date(event.eventStartTime);
  const end = new Date(event.eventEndTime);

  function formatTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 → 12

    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  function getOrdinal(n) {
    if (n > 3 && n < 21) return 'th';
    return ['st', 'nd', 'rd'][(n % 10) - 1] || 'th';
  }

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const day = start.getDate();
  const month = monthNames[start.getMonth()];
  const year = start.getFullYear();

  return `${formatTime(start)} - ${formatTime(end)}. ${month} ${day}${getOrdinal(day)}, ${year}`;
}

export const constructQueryParams = params => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => queryParams.append(key, params[key]));
  return queryParams;
};

export const transformEvents = events => {
  return events.map(event => {
    const startTime = formateDate(new Date(event.startTime));
    const endTime = formateDate(new Date(event.endTime));
    return {
      ...event,
      date: formatEventDisplay({ eventStartTime: startTime, eventEndTime: endTime }),
      startTime,
      endTime,
    };
  });
};
