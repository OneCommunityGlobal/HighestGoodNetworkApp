const { ENDPOINTS } = require('../../../utils/URL');
const { returnUpdatedBadgesCollection } = require('../../../actions/badgeManagement');
const axios = require('axios');
jest.mock('axios');
import { assignBadges, validateBadges } from '../../../actions/badgeManagement';
import { getMessage, closeAlert } from '../../../actions/badgeManagement';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { GET_MESSAGE, CLOSE_ALERT } from '../../../constants/badge';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('BadgeManagement returnUpdatedBadgesCollection unit test', () => {
  test('should update an existing badge in the collection', () => {
    const badgeCollection = [
      {
        count: 1,
        earnedDate: ['Dec-07-23'],
        lastModified: '2023-12-07T23:58:56.900Z',
        featured: false,
        _id: '65725c5550b9eb8ddcfc5807',
        badge: '64ee76a4a2de3e0d0c717841',
      },
    ];

    const selectedBadgesId = ['assign-badge-64ee76a4a2de3e0d0c717841'];

    const result = returnUpdatedBadgesCollection(badgeCollection, selectedBadgesId);

    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
    expect(result[0].earnedDate).toHaveLength(2); // One more date added
    expect(result[0].lastModified).not.toBe('2023-12-07T23:58:56.900Z');
  });

  test('should add a new badge to the collection', () => {
    const badgeCollection = [
      {
        count: 1,
        earnedDate: ['Dec-07-23'],
        lastModified: '2023-12-07T23:58:56.900Z',
        featured: false,
        _id: '65725c5550b9eb8ddcfc5807',
        badge: '64ee76a4a2de3e0d0c717841',
      },
    ];

    const selectedBadgesId = ['assign-badge-AAee76a4a2de3e0d0c717841'];

    const result = returnUpdatedBadgesCollection(badgeCollection, selectedBadgesId);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(badgeCollection[0]);
    expect(result[1].badge).toBe('AAee76a4a2de3e0d0c717841');
    expect(result[1].count).toBe(1);
    expect(result[1].earnedDate).toHaveLength(1);
  });
});

jest.useFakeTimers();

describe('BadgeManagement validateBadges action unit test', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.useFakeTimers();
  });

  test('should dispatch getMessage and closeAlert when firstName or lastName is missing', async () => {
    // Dispatch the validateBadges action with empty firstName and lastName
    await store.dispatch(validateBadges('', ''));

    const actions = store.getActions();
    expect(actions[0]).toEqual({
      type: GET_MESSAGE,
      message:
        'The Name Find function does not work without entering first and last name. Nice try though.',
      color: 'danger',
    });

    jest.advanceTimersByTime(6000);

    const nextActions = store.getActions();
    expect(nextActions).toContainEqual({ type: CLOSE_ALERT });
  });

  test('should not dispatch any actions when both firstName and lastName are provided', async () => {
    await store.dispatch(validateBadges('John', 'Doe'));

    // Check that no actions were dispatched
    const actions = store.getActions();
    expect(actions).toHaveLength(0);
  });
});

describe('BadgeManagement assignBadges action unit test', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.resetAllMocks();
  });

  test('should dispatch getMessage and closeAlert when no badges are selected', async () => {
    await store.dispatch(assignBadges('John', 'Doe', []));
    const actions = store.getActions();

    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message:
        "Um no, that didn't work. Badge Select Function must include actual selection of badges to work. Better luck next time!",
      color: 'danger',
    });

    jest.advanceTimersByTime(6000);
    expect(store.getActions()).toContainEqual({ type: CLOSE_ALERT });
  });

  test('should dispatch getMessage and closeAlert when user is not found', async () => {
    axios.get.mockResolvedValue({ data: [] }); // Mock API response as user not found

    await store.dispatch(assignBadges('John', 'Doe', ['badge1']));
    const actions = store.getActions();

    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message:
        "Can't find that user. Step 1 to getting badges: Be in the system. Not in the system? No badges for you!",
      color: 'danger',
    });

    jest.advanceTimersByTime(6000);
    expect(store.getActions()).toContainEqual({ type: CLOSE_ALERT });
  });

  test('should dispatch success message when badges are assigned successfully', async () => {
    axios.get.mockResolvedValue({ data: [{ badgeCollection: [], _id: 'user1' }] });
    axios.put.mockResolvedValue({}); // Mock successful PUT request

    await store.dispatch(assignBadges('John', 'Doe', ['badge1']));
    const actions = store.getActions();

    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message:
        "Awesomesauce! Not only have you increased a person's badges, you've also proportionally increased their life happiness!",
      color: 'success',
    });

    jest.advanceTimersByTime(6000);
    expect(store.getActions()).toContainEqual({ type: CLOSE_ALERT });
  });

  test('should dispatch error message when API call fails', async () => {
    axios.get.mockResolvedValue({ data: [{ badgeCollection: [], _id: 'user1' }] });
    axios.put.mockRejectedValue(new Error('API Error')); // Mock API failure

    await store.dispatch(assignBadges('John', 'Doe', ['badge1']));
    const actions = store.getActions();

    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message: 'Oops, something is wrong!',
      color: 'danger',
    });

    jest.advanceTimersByTime(6000);
    expect(store.getActions()).toContainEqual({ type: CLOSE_ALERT });
  });
});
