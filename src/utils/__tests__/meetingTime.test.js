import moment from 'moment-timezone';
import {
  buildMeetingMoment,
  formatMeetingDateTimeShort,
  formatMeetingDuration,
  getParticipantLocalTime,
  resolveUserTimeZone,
  stripHtmlToPlainText,
} from '../meetingTime';

describe('meetingTime utils', () => {
  const formValues = {
    dateOfMeeting: '2026-07-03',
    startHour: '01',
    startMinute: '00',
    startTimePeriod: 'PM',
    timeZone: 'America/Los_Angeles',
  };

  it('builds a meeting moment in the selected time zone', () => {
    const meetingMoment = buildMeetingMoment(formValues);
    expect(meetingMoment.isValid()).toBe(true);
    expect(meetingMoment.format('z')).toBe('PDT');
  });

  it('formats meeting time for a viewer time zone', () => {
    const iso = buildMeetingMoment(formValues).toISOString();
    const formatted = formatMeetingDateTimeShort(iso, 'Asia/Kolkata');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('IST');
  });

  it('shows participant local time different from organizer time zone', () => {
    const pacificTime = getParticipantLocalTime(formValues, 'America/Los_Angeles');
    const indiaTime = getParticipantLocalTime(formValues, 'Asia/Kolkata');
    expect(pacificTime).not.toEqual(indiaTime);
  });

  it('falls back to browser time zone when profile time zone is missing', () => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(resolveUserTimeZone('')).toBe(browserTimeZone);
  });

  it('strips html tags and normalizes whitespace from notes', () => {
    expect(stripHtmlToPlainText('<p>Hello&nbsp; <strong>team</strong></p>')).toBe('Hello team');
  });

  it('formats meeting duration in minutes and hours', () => {
    expect(formatMeetingDuration(30)).toBe('30 minutes');
    expect(formatMeetingDuration(60)).toBe('1 hour');
    expect(formatMeetingDuration(120)).toBe('2 hours');
    expect(formatMeetingDuration(0)).toBe('');
  });
});
