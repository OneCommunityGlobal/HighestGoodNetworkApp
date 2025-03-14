import { timeEntriesReducer } from '../timeEntriesReducer';
import {
  GET_TIME_ENTRIES_WEEK,
  GET_TIME_ENTRIES_PERIOD,
  ADD_TIME_ENTRY,
} from '../../constants/timeEntries';

describe('timeEntriesReducer', () => {
  const initialState = {
    weeks: {
      0: [],
      1: [],
      2: [],
    },
    period: [],
  };

  it('should return the initial state when no action type is provided', () => {
    expect(timeEntriesReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle GET_TIME_ENTRIES_WEEK by updating the specified week with the provided payload', () => {
    const action = {
      type: GET_TIME_ENTRIES_WEEK,
      offset: 1,
      payload: [{ id: 1, hours: 8 }],
    };

    const expectedState = {
      ...initialState,
      weeks: {
        ...initialState.weeks,
        1: [{ id: 1, hours: 8 }],
      },
    };

    expect(timeEntriesReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle GET_TIME_ENTRIES_PERIOD by updating the period with the provided payload', () => {
    const action = {
      type: GET_TIME_ENTRIES_PERIOD,
      payload: [
        { id: 1, hours: 5 },
        { id: 2, hours: 3 },
      ],
    };

    const expectedState = {
      ...initialState,
      period: [
        { id: 1, hours: 5 },
        { id: 2, hours: 3 },
      ],
    };

    expect(timeEntriesReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_TIME_ENTRY by adding a new entry to the specified week', () => {
    const initial = {
      ...initialState,
      weeks: {
        0: [{ id: 1, hours: 4 }],
        1: [{ id: 2, hours: 6 }],
        2: [],
      },
    };

    const action = {
      type: ADD_TIME_ENTRY,
      offset: 1,
      payload: { id: 3, hours: 2 },
    };

    const expectedState = {
      ...initial,
      weeks: {
        ...initial.weeks,
        1: [
          { id: 2, hours: 6 },
          { id: 3, hours: 2 },
        ],
      },
    };

    expect(timeEntriesReducer(initial, action)).toEqual(expectedState);
  });

  it('should return the current state for unknown action types', () => {
    const currentState = {
      weeks: {
        0: [],
        1: [{ id: 1, hours: 5 }],
        2: [],
      },
      period: [],
    };
    const action = { type: 'UNKNOWN_ACTION' };

    expect(timeEntriesReducer(currentState, action)).toEqual(currentState);
  });
});
