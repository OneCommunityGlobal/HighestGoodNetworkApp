import moment from 'moment-timezone';

export const DEFAULT_TIME_ZONE = 'America/Los_Angeles';

export const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
};

export const resolveUserTimeZone = timeZone => {
  if (timeZone && typeof timeZone === 'string' && timeZone.trim()) {
    return timeZone.trim();
  }
  return getBrowserTimeZone();
};

export const buildMeetingMoment = ({
  dateOfMeeting,
  startHour,
  startMinute,
  startTimePeriod,
  timeZone,
}) => {
  if (!dateOfMeeting || startHour == null || startMinute == null || !startTimePeriod) {
    return moment.invalid();
  }

  const dateTimeString = `${dateOfMeeting} ${startHour}:${startMinute} ${startTimePeriod}`;
  return moment.tz(dateTimeString, 'YYYY-MM-DD hh:mm A', resolveUserTimeZone(timeZone));
};

export const formatMeetingDateTime = (dateTime, timeZone) => {
  if (!dateTime) return '';
  const tz = resolveUserTimeZone(timeZone);
  return moment(dateTime).tz(tz).format('dddd, MMM D, YYYY h:mm A z');
};

export const formatMeetingDateTimeShort = (dateTime, timeZone) => {
  if (!dateTime) return '';
  const tz = resolveUserTimeZone(timeZone);
  return moment(dateTime).tz(tz).format('MMM D, YYYY h:mm A z');
};

export const formatMeetingDuration = durationMinutes => {
  const minutes = Number(durationMinutes);
  if (!minutes || Number.isNaN(minutes) || minutes <= 0) {
    return '';
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }

  return `${minutes} minutes`;
};

export const getParticipantLocalTime = (formValues, participantTimeZone) => {
  const meetingMoment = buildMeetingMoment(formValues);
  if (!meetingMoment.isValid()) return null;

  return meetingMoment
    .clone()
    .tz(resolveUserTimeZone(participantTimeZone))
    .format('MMM D, YYYY h:mm A z');
};

export const hasValidMeetingSchedule = formValues => buildMeetingMoment(formValues).isValid();

export const stripHtmlToPlainText = html => {
  if (!html) return '';

  let plainText = '';
  let insideTag = false;

  for (const character of html) {
    if (character === '<') {
      insideTag = true;
      continue;
    }
    if (character === '>') {
      insideTag = false;
      continue;
    }
    if (!insideTag) {
      plainText += character;
    }
  }

  return plainText
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};
