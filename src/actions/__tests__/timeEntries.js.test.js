// Import the functions to test
import moment from 'moment-timezone'; // Import moment-timezone
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
// Import the constants
import { GET_TIME_ENTRIES_PERIOD, GET_TIME_ENTRIES_WEEK } from '../../constants/timeEntries';
// Import ENDPOINTS
import { ENDPOINTS } from '~/utils/URL';
// Import moment for date manipulation
// Mock axios for HTTP requests

// Mock axios module
vi.mock('axios');

describe('timeEntries action creators', () => {
  // Mock console.error to suppress error output during tests
  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterAll(() => {
    // eslint-disable-next-line no-console
    console.error.mockRestore();
  });

  // Test suite for setTimeEntriesForPeriod
  describe('setTimeEntriesForPeriod', () => {
    // Test case to ensure the returned action object is correct
    it('should create an action to set time entries for the period', () => {
      const data = [{ date: '2023-08-24' }]; // Sample data
      // Expected action object
      const expectedAction = {
        type: GET_TIME_ENTRIES_PERIOD,
        payload: data,
      };
      // Verify the actual result matches what we expect
      expect(setTimeEntriesForPeriod(data)).toEqual(expectedAction);
    });
  });

  // Test suite for setTimeEntriesForWeek
  describe('setTimeEntriesForWeek', () => {
    // Test case to ensure the returned action object is correct
    it('should create an action to set time entries for a week', () => {
      const data = [{ date: '2023-09-01' }]; // Sample data
      const offset = 1; // Sample offset
      // Expected action object
      const expectedAction = {
        type: GET_TIME_ENTRIES_WEEK,
        payload: data,
        offset,
      };
      // Verify the actual result matches what we expect
      expect(setTimeEntriesForWeek(data, offset)).toEqual(expectedAction);
    });
  });

  // Test suite for deleteTimeEntry
  describe('deleteTimeEntry', () => {
    it('should dispatch updateTimeEntries if entryType is default', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntry = { _id: '123', entryType: 'default' }; // Sample time entry
      axios.delete.mockResolvedValue({ status: 200 }); // Mock axios delete response

      await deleteTimeEntry(timeEntry)(dispatchMock); // Call deleteTimeEntry with the mock dispatch function

      // Verify dispatchMock was called with a function (updateTimeEntries)
      expect(dispatchMock).toHaveBeenCalledWith(expect.any(Function));
      // Verify axios.delete was called with the correct URL
      expect(axios.delete).toHaveBeenCalledWith(ENDPOINTS.TIME_ENTRY_CHANGE(timeEntry._id));
    });

    // Test case to ensure the response status is returned
    it('should return the response status', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntry = { _id: '123', entryType: 'default' }; // Sample time entry
      axios.delete.mockResolvedValue({ status: 200 }); // Mock axios delete response

      const status = await deleteTimeEntry(timeEntry)(dispatchMock); // Call deleteTimeEntry

      expect(status).toBe(200); // Verify the status is 200
    });

    // Test case to handle errors and return the error response status
    it('should handle errors and return the error response status', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntry = { _id: '123', entryType: 'default' }; // Sample time entry
      axios.delete.mockRejectedValue({ response: { status: 500 } }); // Mock axios delete error response

      const status = await deleteTimeEntry(timeEntry)(dispatchMock); // Call deleteTimeEntry

      expect(status).toBe(500); // Verify the status is 500
    });
  });

  // Test suite for editTimeEntry
  describe('editTimeEntry', () => {
    it('should dispatch updateTimeEntries if entryType is default', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntryId = '123'; // Sample time entry ID
      const timeEntry = { entryType: 'default', dateOfWork: moment().toISOString() }; // Sample time entry
      const oldDateOfWork = moment()
        .subtract(1, 'week')
        .toISOString(); // Sample old date of work
      axios.put.mockResolvedValue({ status: 200 }); // Mock axios put response

      await editTimeEntry(timeEntryId, timeEntry, oldDateOfWork)(dispatchMock); // Call editTimeEntry

      // Verify dispatchMock was called with a function (updateTimeEntries)
      expect(dispatchMock).toHaveBeenCalledWith(expect.any(Function));
      // Verify axios.put was called with the correct URL and data
      expect(axios.put).toHaveBeenCalledWith(ENDPOINTS.TIME_ENTRY_CHANGE(timeEntryId), timeEntry);
    });

    // Test case to ensure the response status is returned
    it('should return the response status', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntryId = '123'; // Sample time entry ID
      const timeEntry = { entryType: 'default', dateOfWork: moment().toISOString() }; // Sample time entry
      axios.put.mockResolvedValue({ status: 200 }); // Mock axios put response

      const status = await editTimeEntry(timeEntryId, timeEntry)(dispatchMock); // Call editTimeEntry

      expect(status).toBe(200); // Verify the status is 200
    });

    // Test case to handle errors and return the error response status
    it('should handle errors and return the error response status', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntryId = '123'; // Sample time entry ID
      const timeEntry = { entryType: 'default', dateOfWork: moment().toISOString() }; // Sample time entry
      axios.put.mockRejectedValue({ response: { status: 500 } }); // Mock axios put error response

      const status = await editTimeEntry(timeEntryId, timeEntry)(dispatchMock); // Call editTimeEntry

      expect(status).toBe(500); // Verify the status is 500
    });
  });

  // Test suite for postTimeEntry
  describe('postTimeEntry', () => {
    it('should dispatch updateTimeEntries if entryType is default', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntry = { entryType: 'default', dateOfWork: moment().toISOString() }; // Sample time entry
      axios.post.mockResolvedValue({ status: 200 }); // Mock axios post response

      await postTimeEntry(timeEntry)(dispatchMock); // Call postTimeEntry

      // Verify dispatchMock was called with a function (updateTimeEntries)
      expect(dispatchMock).toHaveBeenCalledWith(expect.any(Function));
      // Verify axios.post was called with the correct URL and data
      expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.TIME_ENTRY(), timeEntry);
    });

    // Test case to ensure the response status is returned
    it('should return the response status', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntry = { entryType: 'default', dateOfWork: moment().toISOString() }; // Sample time entry
      axios.post.mockResolvedValue({ status: 200 }); // Mock axios post response

      const status = await postTimeEntry(timeEntry)(dispatchMock); // Call postTimeEntry

      expect(status).toBe(200); // Verify the status is 200
    });

    // Test case to handle errors and return the error response status
    it('should handle errors and return the error response status', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const timeEntry = { entryType: 'default', dateOfWork: moment().toISOString() }; // Sample time entry
      axios.post.mockRejectedValue({ response: { status: 500 } }); // Mock axios post error response

      const status = await postTimeEntry(timeEntry)(dispatchMock); // Call postTimeEntry

      expect(status).toBe(500); // Verify the status is 500
    });
  });

  // Duplicate conflicts must be distinguishable only for callers that opt in.
  describe('postTimeEntry duplicate conflict handling', () => {
    const timeEntry = { entryType: 'default', dateOfWork: moment().toISOString() };
    const duplicateBody = { error: 'Duplicate time entry', code: 'DUPLICATE_TIME_ENTRY' };
    const failWith = (status, data) => axios.post.mockRejectedValue({ response: { status, data } });
    let dispatchMock;

    beforeEach(() => {
      dispatchMock = vi.fn();
      axios.post.mockReset();
    });

    describe('without the detailed option (existing callers such as AddLostTime)', () => {
      it.each([
        [200, undefined],
        [400, { error: 'Bad request' }],
        [403, { error: 'Forbidden' }],
        [409, duplicateBody],
        [500, { error: 'boom' }],
      ])('still resolves with the bare numeric status %i', async (status, data) => {
        if (status === 200) {
          axios.post.mockResolvedValue({ status });
        } else {
          failWith(status, data);
        }

        const result = await postTimeEntry(timeEntry)(dispatchMock);

        expect(result).toBe(status);
      });

      it('keeps the 200 comparison used by AddLostTime working', async () => {
        axios.post.mockResolvedValue({ status: 200 });

        const result = await postTimeEntry({ ...timeEntry, entryType: 'person' })(dispatchMock);

        expect(result !== 200).toBe(false);
      });

      it('still rejects on a network failure', async () => {
        axios.post.mockRejectedValue(new Error('Network Error'));

        await expect(postTimeEntry(timeEntry)(dispatchMock)).rejects.toThrow();
      });
    });

    describe('with the detailed option', () => {
      const options = { detailed: true };

      it('resolves with only the status for HTTP 200 and still refreshes entries', async () => {
        axios.post.mockResolvedValue({ status: 200, data: { message: 'Time Entry saved successfully' } });

        const result = await postTimeEntry(timeEntry, options)(dispatchMock);

        expect(result).toEqual({ status: 200 });
        expect(dispatchMock).toHaveBeenCalledWith(expect.any(Function));
      });

      it('exposes the DUPLICATE_TIME_ENTRY code for an HTTP 409 duplicate', async () => {
        failWith(409, duplicateBody);

        const result = await postTimeEntry(timeEntry, options)(dispatchMock);

        expect(result).toEqual({ status: 409, code: 'DUPLICATE_TIME_ENTRY' });
        expect(dispatchMock).not.toHaveBeenCalled();
      });

      it('exposes a different code for an HTTP 409 that is not a duplicate', async () => {
        failWith(409, { error: 'Something else', code: 'SOME_OTHER_CONFLICT' });

        const result = await postTimeEntry(timeEntry, options)(dispatchMock);

        expect(result).toEqual({ status: 409, code: 'SOME_OTHER_CONFLICT' });
      });

      it('reports no code for an HTTP 409 without a body', async () => {
        failWith(409, undefined);

        const result = await postTimeEntry(timeEntry, options)(dispatchMock);

        expect(result).toEqual({ status: 409 });
      });

      it.each([400, 403, 500])('resolves with the status and no code for HTTP %i', async status => {
        failWith(status, { error: 'Nope' });

        const result = await postTimeEntry(timeEntry, options)(dispatchMock);

        expect(result).toEqual({ status });
        expect(dispatchMock).not.toHaveBeenCalled();
      });

      it('ignores a non-string code and never exposes other body fields', async () => {
        failWith(409, { code: { nested: true }, error: 'x', stack: 'secret', details: ['entry'] });

        const result = await postTimeEntry(timeEntry, options)(dispatchMock);

        expect(result).toEqual({ status: 409 });
        expect(Object.keys(result)).not.toContain('stack');
      });

      it('still rejects on a network failure', async () => {
        axios.post.mockRejectedValue(new Error('Network Error'));

        await expect(postTimeEntry(timeEntry, options)(dispatchMock)).rejects.toThrow();
        expect(dispatchMock).not.toHaveBeenCalled();
      });
    });
  });

  // Test suite for getTimeEndDateEntriesByPeriod
  describe('getTimeEndDateEntriesByPeriod', () => {
    it('should return the last entry date', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const userId = '123'; // Sample user ID
      const fromDate = moment()
        .subtract(2, 'weeks')
        .toISOString(); // Sample from date
      const toDate = moment().toISOString(); // Sample to date
      const formattedToDate = moment(toDate)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ss'); // Adjusted toDate
      const timeEntries = [
        {
          dateOfWork: moment()
            .subtract(1, 'days')
            .toISOString(),
          createdDateTime: moment()
            .subtract(1, 'days')
            .toISOString(),
        },
        {
          dateOfWork: moment()
            .subtract(2, 'days')
            .toISOString(),
          createdDateTime: moment()
            .subtract(2, 'days')
            .toISOString(),
        },
      ]; // Sample time entries
      axios.get.mockResolvedValue({ data: timeEntries }); // Mock axios get response

      const result = await getTimeEndDateEntriesByPeriod(userId, fromDate, toDate)(dispatchMock); // Call getTimeEndDateEntriesByPeriod

      // Verify the result is the formatted date of the last entry
      expect(result).toBe(timeEntries[0].createdDateTime);
      // Verify axios.get was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, formattedToDate),
      );
    });

    it('should return "N/A" if no entries are found', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const userId = '123'; // Sample user ID
      const fromDate = moment()
        .subtract(2, 'weeks')
        .toISOString(); // Sample from date
      const toDate = moment().toISOString(); // Sample to date
      const formattedToDate = moment(toDate)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ss'); // Adjusted toDate
      axios.get.mockResolvedValue({ data: [] }); // Mock axios get response with no data

      const result = await getTimeEndDateEntriesByPeriod(userId, fromDate, toDate)(dispatchMock); // Call getTimeEndDateEntriesByPeriod

      // Verify the result is "N/A"
      expect(result).toBe('N/A');
      // Verify axios.get was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, formattedToDate),
      );
    });

    it('should handle errors and return "N/A"', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const userId = '123'; // Sample user ID
      const fromDate = moment()
        .subtract(2, 'weeks')
        .toISOString(); // Sample from date
      const toDate = moment().toISOString(); // Sample to date
      const formattedToDate = moment(toDate)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ss'); // Adjusted toDate
      axios.get.mockRejectedValue(new Error('Request failed')); // Mock axios get error response

      const result = await getTimeEndDateEntriesByPeriod(userId, fromDate, toDate)(dispatchMock); // Call getTimeEndDateEntriesByPeriod

      // Verify the result is "N/A"
      expect(result).toBe('N/A');
      // Verify axios.get was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, formattedToDate),
      );
    });
  });

  // Test suite for getTimeEntriesForPeriod
  describe('getTimeEntriesForPeriod', () => {
    it('should dispatch setTimeEntriesForPeriod with filtered and sorted entries', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const userId = '123'; // Sample user ID
      const fromDate = moment()
        .subtract(2, 'weeks')
        .toISOString(); // Sample from date
      const toDate = moment().toISOString(); // Sample to date
      const formattedToDate = moment(toDate)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ss'); // Adjusted toDate
      const timeEntries = [
        {
          dateOfWork: moment()
            .subtract(1, 'days')
            .toISOString(),
        },
        {
          dateOfWork: moment()
            .subtract(2, 'days')
            .toISOString(),
        },
      ]; // Sample time entries
      axios.get.mockResolvedValue({ data: timeEntries }); // Mock axios get response

      await getTimeEntriesForPeriod(userId, fromDate, toDate)(dispatchMock); // Call getTimeEntriesForPeriod

      // Verify dispatchMock was called with setTimeEntriesForPeriod and filtered entries
      expect(dispatchMock).toHaveBeenCalledWith({
        type: GET_TIME_ENTRIES_PERIOD,
        payload: timeEntries.sort(
          (a, b) => moment(b.dateOfWork).valueOf() - moment(a.dateOfWork).valueOf(),
        ),
      });
      // Verify axios.get was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, formattedToDate),
      );
    });
  });

  // Test suite for getTimeEntriesForWeek
  describe('getTimeEntriesForWeek', () => {
    it('should dispatch setTimeEntriesForWeek with filtered entries', async () => {
      const dispatchMock = vi.fn(); // Mock dispatch function
      const userId = '123'; // Sample user ID
      const offset = 1; // Sample offset
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
      const timeEntries = [
        {
          dateOfWork: moment()
            .subtract(1, 'days')
            .toISOString(),
        },
        {
          dateOfWork: moment()
            .subtract(2, 'days')
            .toISOString(),
        },
      ]; // Sample time entries
      axios.get.mockResolvedValue({ data: timeEntries }); // Mock axios get response

      await getTimeEntriesForWeek(userId, offset)(dispatchMock); // Call getTimeEntriesForWeek

      // Verify dispatchMock was called with setTimeEntriesForWeek and filtered entries
      expect(dispatchMock).toHaveBeenCalledWith({
        type: GET_TIME_ENTRIES_WEEK,
        payload: timeEntries.filter(entry => {
          const entryDate = moment(entry.dateOfWork);
          return entryDate.isBetween(fromDate, toDate, 'day', '[]');
        }),
        offset,
      });
      // Verify axios.get was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        ENDPOINTS.TIME_ENTRIES_PERIOD(userId, fromDate, toDate),
      );
    });
  });
});
