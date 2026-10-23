import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import { vi } from 'vitest';
import TotalTeamReport from '../TotalTeamReport';

vi.mock('axios');
vi.mock('../TotalReportBarGraph', () => ({ default: () => null }));

const teamId = '64b000000000000000000001';
const userId = '64b000000000000000000002';
const teamMembersResponse = {
  data: [
    {
      _id: teamId,
      teamName: 'Test Team',
      createdDatetime: '2019-01-01T00:00:00.000Z',
      members: [{ userId }],
    },
  ],
};
const timeEntriesResponse = {
  data: [
    {
      personId: userId,
      hours: 12,
      minutes: 0,
      isTangible: true,
      dateOfWork: '2020-06-01T00:00:00.000Z',
    },
  ],
};

const props = {
  startDate: new Date('2020-01-01T00:00:00.000Z'),
  endDate: new Date('2020-12-31T00:00:00.000Z'),
  userProfiles: [{ _id: userId, firstName: 'Test', lastName: 'Member' }],
  allTeamsData: [{ _id: teamId }],
  savedTeamMemberList: [],
  darkMode: false,
};

const mockFreshReportRequests = () => {
  axios.post.mockImplementation(url => {
    if (url.endsWith('/team/reports')) return Promise.resolve(teamMembersResponse);
    if (url.endsWith('/TimeEntry/reports')) return Promise.resolve(timeEntriesResponse);
    if (url.endsWith('/TimeEntry/lostTeams')) return Promise.resolve({ data: [] });
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
};

describe('TotalTeamReport team member cache', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it.each([
    ['a missing value', null],
    ['an empty array', '[]'],
    ['malformed JSON', '{not-valid-json'],
    ['a non-array value', '{}'],
    ['an array with malformed team data', '[{}]'],
  ])('fetches fresh team members when the cache contains %s', async (_description, cachedValue) => {
    if (cachedValue !== null) localStorage.setItem('teamMembers', cachedValue);
    mockFreshReportRequests();

    render(<TotalTeamReport {...props} />);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/team\/reports$/), [teamId]);
    });
    expect(await screen.findByText('12.00')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('teamMembers'))).toHaveLength(1);
  });

  it('reuses a valid non-empty team member cache', async () => {
    localStorage.setItem(
      'teamMembers',
      JSON.stringify([
        {
          teamId,
          teamName: 'Cached Team',
          createdDatetime: '2019-01-01T00:00:00.000Z',
          members: [userId],
        },
      ]),
    );
    mockFreshReportRequests();

    render(<TotalTeamReport {...props} />);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/TimeEntry\/reports$/),
        expect.anything(),
      );
    });
    expect(axios.post).not.toHaveBeenCalledWith(
      expect.stringMatching(/\/team\/reports$/),
      expect.anything(),
    );
    expect(JSON.parse(localStorage.getItem('teamMembers'))[0].teamName).toBe('Cached Team');
  });
});
