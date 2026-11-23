import moment from 'moment-timezone';
import axios from 'axios';
import {
  setTimeEntriesForPeriod,
  setTimeEntriesForWeek,
  getTimeEntriesForWeek,
  deleteTimeEntry,
  editTimeEntry,
  postTimeEntry,
  getTimeEndDateEntriesByPeriod,
  getTimeEntriesForPeriod,
} from '../timeEntries';
import { GET_TIME_ENTRIES_PERIOD, GET_TIME_ENTRIES_WEEK } from '../../constants/timeEntries';
import { ENDPOINTS } from '~/utils/URL';
import { fetchServerTime, getServerMoment } from '~/utils/serverTime';

vi.mock('axios');

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('~/utils/serverTime', () => ({
  fetchServerTime: vi.fn(),
  getServerMoment: vi.fn(),
}));

describe('timeEntries action creators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    fetchServerTime.mockResolvedValue(undefined);
    getServerMoment.mockReturnValue(moment());
  });

  describe('setTimeEntriesForPeriod', () => {
    it('creates an action to set time entries for a period', () => {
      const data = [{ date: '2023-08-24' }];

      expect(setTimeEntriesForPeriod(data)).toEqual({
        type: GET_TIME_ENTRIES_PERIOD,
        payload: data,
      });
    });
  });

  describe('setTimeEntriesForWeek', () => {
    it('creates an action to set time entries for a week', () => {
      const data = [{ date: '2023-09-01' }];
      const offset = 1;

      expect(setTimeEntriesForWeek(data, offset)).toEqual({
        type: GET_TIME_ENTRIES_WEEK,
        payload: data,
        offset,
      });
    });
  });

  describe('deleteTimeEntry', () => {
    it('dispatches an update when deleting a default entry', async () => {
      const dispatch = vi.fn();
      const timeEntry = { _id: '123', entryType: 'default' };
      axios.delete.mockResolvedValue({ status: 200 });

      await deleteTimeEntry(timeEntry)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
      expect(axios.delete).toHaveBeenCalledWith(ENDPOINTS.TIME_ENTRY_CHANGE('123'));
    });

    it('returns the response status', async () => {
      const dispatch = vi.fn();
      axios.delete.mockResolvedValue({ status: 200 });

      const status = await deleteTimeEntry({
        _id: '123',
        entryType: 'default',
      })(dispatch);

      expect(status).toBe(200);
    });

    it('returns the error response status when the request fails', async () => {
      const dispatch = vi.fn();
      axios.delete.mockRejectedValue({ response: { status: 500 } });

      const status = await deleteTimeEntry({
        _id: '123',
        entryType: 'default',
      })(dispatch);

      expect(status).toBe(500);
    });
  });

  describe('editTimeEntry', () => {
    it('dispatches an update when editing a default entry', async () => {
      const dispatch = vi.fn();
      const timeEntryId = '123';
      const timeEntry = {
        entryType: 'default',
        dateOfWork: moment().toISOString(),
      };
      const oldDateOfWork = moment().subtract(1, 'week').toISOString();
      axios.put.mockResolvedValue({ status: 200 });

      await editTimeEntry(timeEntryId, timeEntry, oldDateOfWork)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
      expect(axios.put).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRY_CHANGE(timeEntryId),
        timeEntry,
      );
    });

    it('returns the response status', async () => {
      const dispatch = vi.fn();
      const timeEntry = {
        entryType: 'default',
        dateOfWork: moment().toISOString(),
      };
      axios.put.mockResolvedValue({ status: 200 });

      const status = await editTimeEntry('123', timeEntry)(dispatch);

      expect(status).toBe(200);
    });

    it('returns the error response status when the request fails', async () => {
      const dispatch = vi.fn();
      const timeEntry = {
        entryType: 'default',
        dateOfWork: moment().toISOString(),
      };
      axios.put.mockRejectedValue({ response: { status: 500 } });

      const status = await editTimeEntry('123', timeEntry)(dispatch);

      expect(status).toBe(500);
    });
  });

  describe('postTimeEntry', () => {
    it('fetches server time before posting a time entry for today', async () => {
      const dispatch = vi.fn();
      const timeEntry = {
        entryType: 'default',
        dateOfWork: moment().toISOString(),
      };
      axios.post.mockResolvedValue({ status: 200 });

      const status = await postTimeEntry(timeEntry)(dispatch);

      expect(fetchServerTime).toHaveBeenCalledTimes(1);
      expect(getServerMoment).toHaveBeenCalledTimes(1);
      expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.TIME_ENTRY(), timeEntry);
      expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
      expect(status).toBe(200);
    });

    it('returns 400 and does not post an entry for a different day', async () => {
      const dispatch = vi.fn();
      const timeEntry = {
        entryType: 'default',
        dateOfWork: moment().subtract(1, 'day').toISOString(),
      };

      const status = await postTimeEntry(timeEntry)(dispatch);

      expect(fetchServerTime).toHaveBeenCalledTimes(1);
      expect(axios.post).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      expect(status).toBe(400);
    });

    it('returns the response status for a person entry', async () => {
      const dispatch = vi.fn();
      const timeEntry = {
        entryType: 'person',
        dateOfWork: moment().toISOString(),
      };
      axios.post.mockResolvedValue({ status: 200 });

      const status = await postTimeEntry(timeEntry)(dispatch);

      expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.TIME_ENTRY(), timeEntry);
      expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
      expect(status).toBe(200);
    });

    it.each([400, 403, 409, 500])(
      'returns the HTTP status %i when the server rejects the request',
      async statusCode => {
        const dispatch = vi.fn();
        const timeEntry = {
          entryType: 'default',
          dateOfWork: moment().toISOString(),
        };
        axios.post.mockRejectedValue({ response: { status: statusCode } });

        const status = await postTimeEntry(timeEntry)(dispatch);

        expect(status).toBe(statusCode);
        expect(dispatch).not.toHaveBeenCalled();
      },
    );

    it('returns 500 when the request fails without an HTTP response', async () => {
      const dispatch = vi.fn();
      const timeEntry = {
        entryType: 'default',
        dateOfWork: moment().toISOString(),
      };
      axios.post.mockRejectedValue(new Error('Network Error'));

      const status = await postTimeEntry(timeEntry)(dispatch);

      expect(status).toBe(500);
      expect(dispatch).not.toHaveBeenCalled();
    });

    it('passes displayedUserId to the update action', async () => {
      const dispatch = vi.fn();
      const timeEntry = {
        entryType: 'default',
        personId: 'user-123',
        dateOfWork: moment().toISOString(),
      };
      axios.post.mockResolvedValue({ status: 200 });

      await postTimeEntry(timeEntry, { displayedUserId: 'user-123' })(dispatch);

      expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('getTimeEndDateEntriesByPeriod', () => {
    it('returns the created date of the most recent entry in the period', async () => {
      const userId = '123';
      const fromDate = moment().subtract(2, 'weeks').toISOString();
      const toDate = moment().toISOString();
      const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
      const entries = [
        {
          dateOfWork: moment().subtract(1, 'day').toISOString(),
          createdDateTime: '2023-08-23T10:00:00.000Z',
        },
        {
          dateOfWork: moment().subtract(2, 'days').toISOString(),
          createdDateTime: '2023-08-22T10:00:00.000Z',
        },
      ];
      axios.get.mockResolvedValue({ data: entries });

      const result = await getTimeEndDateEntriesByPeriod(userId, fromDate, toDate)();

      expect(result).toBe(entries[0].createdDateTime);
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, formattedToDate),
      );
    });

    it('returns N/A when no entries are found', async () => {
      const userId = '123';
      const fromDate = moment().subtract(2, 'weeks').toISOString();
      const toDate = moment().toISOString();
      axios.get.mockResolvedValue({ data: [] });

      const result = await getTimeEndDateEntriesByPeriod(userId, fromDate, toDate)();

      expect(result).toBe('N/A');
    });

    it('returns N/A when the request fails', async () => {
      const userId = '123';
      const fromDate = moment().subtract(2, 'weeks').toISOString();
      const toDate = moment().toISOString();
      axios.get.mockRejectedValue(new Error('Request failed'));

      const result = await getTimeEndDateEntriesByPeriod(userId, fromDate, toDate)();

      expect(result).toBe('N/A');
    });
  });

  describe('getTimeEntriesForPeriod', () => {
    it('dispatches filtered entries sorted by date in descending order', async () => {
      const dispatch = vi.fn();
      const userId = '123';
      const fromDate = moment().subtract(2, 'weeks').toISOString();
      const toDate = moment().toISOString();
      const formattedToDate = moment(toDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
      const entries = [
        { dateOfWork: moment().subtract(1, 'day').toISOString() },
        { dateOfWork: moment().subtract(2, 'days').toISOString() },
      ];
      axios.get.mockResolvedValue({ data: entries });

      await getTimeEntriesForPeriod(userId, fromDate, toDate)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: GET_TIME_ENTRIES_PERIOD,
        payload: [...entries].sort(
          (a, b) => moment(b.dateOfWork).valueOf() - moment(a.dateOfWork).valueOf(),
        ),
      });
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, formattedToDate),
      );
    });
  });

  describe('getTimeEntriesForWeek', () => {
    it('dispatches entries filtered to the requested week', async () => {
      const dispatch = vi.fn();
      const userId = '123';
      const offset = 1;
      const fromDate = moment()
        .tz('America/Los_Angeles')
        .startOf('week')
        .subtract(offset, 'weeks')
        .format('YYYY-MM-DDTHH:mm:ss');
      const toDate = moment()
        .tz('America/Los_Angeles')
        .endOf('week')
        .subtract(offset, 'weeks')
        .format('YYYY-MM-DDTHH:mm:ss');
      const entries = [
        { dateOfWork: moment(fromDate).add(1, 'day').toISOString() },
        { dateOfWork: moment(fromDate).subtract(2, 'days').toISOString() },
      ];
      axios.get.mockResolvedValue({ data: entries });

      await getTimeEntriesForWeek(userId, offset)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: GET_TIME_ENTRIES_WEEK,
        payload: [entries[0]],
        offset,
      });
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate),
      );
    });
  });
});