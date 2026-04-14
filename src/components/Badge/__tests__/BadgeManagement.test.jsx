import axios from 'axios';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { GET_MESSAGE, CLOSE_ALERT } from '../../../constants/badge';

vi.mock('axios');
vi.mock('~/utils/URL', () => ({
  ENDPOINTS: {
    BADGE: () => '/badge',
    BADGE_COUNT: userId => `/badgeCount/${userId}`,
    BADGE_COUNT_RESET: userId => `/badgeCountReset/${userId}`,
    USER_PROFILE_BY_NAME: name => `/userByName/${name}`,
    USER_PROFILE: id => `/user/${id}`,
    BADGE_ASSIGN: id => `/assignBadge/${id}`,
  },
}));

vi.mock('~/utils/formatDate', () => ({
  formatDate: () => 'MOCK_DATE',
}));
import {
  returnUpdatedBadgesCollection,
  validateBadges,
  assignBadges,
} from '../../../actions/badgeManagement';

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

describe('BadgeManagement validateBadges action', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
  });
  afterEach(() => {
    vi.clearAllMocks();
    store.clearActions();
  });

  it('dispatches GET_MESSAGE and CLOSE_ALERT when name is missing', async () => {
    await store.dispatch(validateBadges('', ''));
    const actions = store.getActions();

    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message:
        'The Name Find function does not work without entering first and last name. Nice try though.',
      color: 'danger',
    });
    // since setTimeout → immediate, CLOSE_ALERT is already dispatched
    expect(actions).toContainEqual({ type: CLOSE_ALERT });
  });

  it('dispatches nothing when both names provided', async () => {
    await store.dispatch(validateBadges('John', 'Doe'));
    expect(store.getActions()).toHaveLength(0);
  });
});

describe('BadgeManagement assignBadges action', () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
    store.clearActions();
  });

  it('dispatches error + CLOSE_ALERT when no badges selected', async () => {
    await store.dispatch(assignBadges('John', 'Doe', []));
    vi.runAllTimers();
    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message:
        "Um no, that didn't work. Badge Select Function must include actual selection of badges to work. Better luck next time!",
      color: 'danger',
    });
    expect(actions).toContainEqual({ type: CLOSE_ALERT });
  });

  it('dispatches error + CLOSE_ALERT when user not found', async () => {
    axios.get.mockResolvedValue({ data: [] });
    await store.dispatch(assignBadges('John', 'Doe', ['badge1']));
    vi.runAllTimers();
    const actions = store.getActions();

    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message:
        "Can't find that user. Step 1 to getting badges: Be in the system. Not in the system? No badges for you!",
      color: 'danger',
    });
    expect(actions).toContainEqual({ type: CLOSE_ALERT });
  });

  it('dispatches success + CLOSE_ALERT on successful assign', async () => {
    axios.get
      .mockResolvedValueOnce({ data: [{ badgeCollection: [], _id: 'user1' }] })
      .mockResolvedValueOnce({ data: { badgeCollection: [], _id: 'user1' } });
    axios.put.mockResolvedValue({}); // Mock successful PUT request
    await store.dispatch(assignBadges('John', 'Doe', ['badge1']));
    vi.runAllTimers();
    const actions = store.getActions();

    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message:
        "Awesomesauce! Not only have you increased a person's badges, you've also proportionally increased their life happiness!",
      color: 'success',
    });
    expect(actions).toContainEqual({ type: CLOSE_ALERT });
  });

  it('dispatches error + CLOSE_ALERT on API failure', async () => {
    axios.get.mockResolvedValue({ data: [{ badgeCollection: [], _id: 'user1' }] });
    axios.put.mockRejectedValue(new Error('API Error'));
    await store.dispatch(assignBadges('John', 'Doe', ['badge1']));
    vi.runAllTimers();
    const actions = store.getActions();

    expect(actions).toContainEqual({
      type: GET_MESSAGE,
      message: 'Oops, something is wrong!',
      color: 'danger',
    });
    expect(actions).toContainEqual({ type: CLOSE_ALERT });
  });
});
