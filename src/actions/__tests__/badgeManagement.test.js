// badge.test.js
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import moment from 'moment';
import {
  getAllBadges,
  fetchAllBadges,
  addSelectBadge,
  assignBadges,
  returnUpdatedBadgesCollection,
  validateBadges,
  resetBadgeCount,
  // ... import other actions
} from '../badgeManagement';
import { ENDPOINTS } from '../../utils/URL';
import { formatDate } from 'utils/formatDate';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mockAxios = new MockAdapter(axios);

describe('Action Creators', () => {
  it('getAllBadges should create an action to get all badges', () => {
    const badges = [{ id: 1, name: 'Test Badge' }];
    const expectedAction = { type: 'GET_ALL_BADGE_DATA', allBadges: badges };
    expect(getAllBadges(badges)).toEqual(expectedAction);
  });

  it('addSelectBadge should create an action to add a selected badge', () => {
    const badgeId = '123';
    const expectedAction = { type: 'ADD_SELECT_BADGE', badgeId };
    expect(addSelectBadge(badgeId)).toEqual(expectedAction);
  });
});

describe('fetchAllBadges', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('dispatches GET_ALL_BADGE_DATA on successful fetch', async () => {
    const badges = [{ id: 1, name: 'Test Badge' }];
    mockAxios.onGet(ENDPOINTS.BADGE()).reply(200, badges);

    const store = mockStore({});
    await store.dispatch(fetchAllBadges());

    const actions = store.getActions();
    expect(actions[0]).toEqual(getAllBadges(badges));
  });

  it('handles errors during fetch', async () => {
    mockAxios.onGet(ENDPOINTS.BADGE()).reply(500);

    const store = mockStore({});
    const status = await store.dispatch(fetchAllBadges());

    expect(status).toBe(500);
  });
});

describe('assignBadges', () => {
  it('dispatches error when no badges are selected', async () => {
    const store = mockStore({});
    await store.dispatch(assignBadges('John', 'Doe', []));

    const actions = store.getActions();
    expect(actions[0].message).toContain("must include actual selection");
  });

  it('dispatches error when user not found', async () => {
    mockAxios.onGet(ENDPOINTS.USER_PROFILE_BY_NAME('John Doe')).reply(200, []);

    const store = mockStore({});
    await store.dispatch(assignBadges('John', 'Doe', ['badge1']));

    const actions = store.getActions();
    expect(actions[0].message).toContain("Can't find that user");
  });
});


describe('returnUpdatedBadgesCollection', () => {
  const personalMaxBadge = '666b78265bca0bcb94080605';
  const currentDate = formatDate();

  it('adds new badges to collection', () => {
    const existingBadges = [];
    const selectedBadges = ['assign-badge-123']; // Correct prefix

    const updated = returnUpdatedBadgesCollection(existingBadges, selectedBadges);

    expect(updated).toHaveLength(1);
    expect(updated[0].badge).toBe('123'); // After prefix removal
  });

  it('increments existing badge count', () => {
    const existingBadges = [{
      badge: '123',
      count: 1,
      earnedDate: ['2023-01-01'], // Add earnedDate array
      lastModified: Date.now()
    }];
    const selectedBadges = ['assign-badge-123'];

    const updated = returnUpdatedBadgesCollection(existingBadges, selectedBadges);

    expect(updated[0].count).toBe(2);
    expect(updated[0].earnedDate).toContain(formatDate()); // Verify new date is added
  });
});


describe('validateBadges', () => {
  it('dispatches error when names are missing', async () => {
    const store = mockStore({});
    await store.dispatch(validateBadges('', '')); // Function is now imported

    const actions = store.getActions();
    expect(actions[0].message).toContain("does not work without entering a name");
  });
});