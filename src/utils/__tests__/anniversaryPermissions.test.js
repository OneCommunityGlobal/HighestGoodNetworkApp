import { getAnniversaryStartDate, showTrophyIcon } from '../anniversaryPermissions';

describe('getAnniversaryStartDate', () => {
  test('prefers the configured startDate', () => {
    const user = {
      startDate: '2024-01-15T00:00:00.000Z',
      createdDate: '2023-06-01T00:00:00.000Z',
    };

    expect(getAnniversaryStartDate(user)).toBe(user.startDate);
  });

  test('uses createdDate when a legacy profile has no startDate', () => {
    const user = { createdDate: '2023-10-26T07:00:00.000Z' };

    expect(getAnniversaryStartDate(user)).toBe(user.createdDate);
  });

  test('returns null when neither date exists', () => {
    expect(getAnniversaryStartDate({})).toBeNull();
  });

  test('shows a trophy for a legacy profile during its anniversary week', () => {
    const legacyUser = { createdDate: '2023-10-26T07:00:00.000Z' };
    const anniversaryStartDate = getAnniversaryStartDate(legacyUser)?.split('T')[0];

    expect(showTrophyIcon('2026-10-31', anniversaryStartDate)).toBe(true);
  });
});
