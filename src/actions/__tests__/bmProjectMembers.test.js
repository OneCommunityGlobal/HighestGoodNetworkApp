import axios from 'axios';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { fetchBMProjectMembers, setProjectMembers } from '../bmdashboard/projectMemberAction';
import reducer from '../../reducers/bmdashboard/projectMemberReducer';
import { errorsReducer } from '../../reducers/errorsReducer';
import { GET_BM_PROJECT_MEMBERS_REQUEST, GET_BM_PROJECT_MEMBERS_FAILURE } from '../../constants/bmdashboard/projectMemberConstants';
import { ENDPOINTS } from '../../utils/URL';

vi.mock('axios');

const makeStore = () => createStore(
  combineReducers({ bmProjectMembers: reducer, errors: errorsReducer }),
  applyMiddleware(thunk),
);
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};
const members = [{ user: { _id: 'member-a', firstName: 'Alice' } }];

describe('BM project member lifecycle', () => {
  beforeEach(() => vi.resetAllMocks());

  it('starts idle, reports loading, and awaits a successful response', async () => {
    const store = makeStore();
    expect(store.getState().bmProjectMembers.status).toBe('idle');
    const response = deferred();
    axios.get.mockReturnValue(response.promise);
    const completion = store.dispatch(fetchBMProjectMembers('a'));
    expect(store.getState().bmProjectMembers).toMatchObject({
      projectId: 'a', status: 'loading', error: null, members: [],
    });
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.BM_PROJECT_MEMBERS('a'));
    response.resolve({ data: { members } });
    await expect(completion).resolves.toMatchObject({ status: 'success', projectId: 'a' });
    expect(store.getState().bmProjectMembers).toMatchObject({ status: 'success', members });
  });

  it('distinguishes successful empty responses from failures and allows retry', async () => {
    const store = makeStore();
    axios.get.mockRejectedValueOnce(new Error('Network unavailable'));
    await expect(store.dispatch(fetchBMProjectMembers('a'))).resolves.toMatchObject({
      status: 'error', error: 'Network unavailable',
    });
    expect(store.getState().bmProjectMembers.status).toBe('error');
    expect(store.getState().errors).toEqual({});
    axios.get.mockResolvedValueOnce({ data: { members: [] } });
    await store.dispatch(fetchBMProjectMembers('a'));
    expect(store.getState().bmProjectMembers).toMatchObject({ status: 'empty', error: null });
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('rejects malformed responses instead of confirming empty data', async () => {
    const store = makeStore();
    axios.get.mockResolvedValue({ data: {} });
    await store.dispatch(fetchBMProjectMembers('a'));
    expect(store.getState().bmProjectMembers).toMatchObject({
      status: 'error', error: 'The server returned invalid project member data.',
    });
  });

  it('keeps late responses in their own project cache without replacing the current project', async () => {
    const store = makeStore();
    const a = deferred();
    const b = deferred();
    axios.get.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const requestA = store.dispatch(fetchBMProjectMembers('a'));
    const requestB = store.dispatch(fetchBMProjectMembers('b'));
    b.resolve({ data: { members: [] } });
    await requestB;
    a.resolve({ data: { members } });
    await requestA;
    expect(store.getState().bmProjectMembers).toMatchObject({
      projectId: 'b', members: [], status: 'empty',
      byProject: { a: { members, status: 'success' }, b: { members: [], status: 'empty' } },
    });
  });

  it('deduplicates pending requests, including switching back to a pending project', async () => {
    const store = makeStore();
    const a = deferred();
    const b = deferred();
    axios.get.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const requestA = store.dispatch(fetchBMProjectMembers('a'));
    const requestB = store.dispatch(fetchBMProjectMembers('b'));
    expect(store.dispatch(fetchBMProjectMembers('a'))).toBe(requestA);
    expect(axios.get).toHaveBeenCalledTimes(2);
    b.resolve({ data: { members: [] } });
    await requestB;
    expect(store.getState().bmProjectMembers).toMatchObject({ projectId: 'a', status: 'loading' });
    a.resolve({ data: { members } });
    await requestA;
    expect(store.getState().bmProjectMembers).toMatchObject({ projectId: 'a', status: 'success', members });
  });

  it('preserves last successful data on failure and clears the error when retrying', async () => {
    const store = makeStore();
    axios.get.mockResolvedValueOnce({ data: { members } });
    await store.dispatch(fetchBMProjectMembers('a'));
    axios.get.mockRejectedValueOnce({ response: { data: { message: 'Service unavailable' } } });
    await store.dispatch(fetchBMProjectMembers('a'));
    expect(store.getState().bmProjectMembers).toMatchObject({
      status: 'error', members, error: 'Service unavailable', byProject: { a: { members } },
    });
    const response = deferred();
    axios.get.mockReturnValueOnce(response.promise);
    const retry = store.dispatch(fetchBMProjectMembers('a'));
    expect(store.getState().bmProjectMembers).toMatchObject({ status: 'loading', error: null, members });
    response.resolve({ data: { members: [] } });
    await retry;
  });

  it('ignores superseded responses for the same project', () => {
    const request = requestId => ({ type: GET_BM_PROJECT_MEMBERS_REQUEST, meta: { projectId: 'a', requestId } });
    const first = reducer(undefined, request(1));
    const second = reducer(first, request(2));
    expect(reducer(second, setProjectMembers(members, 'a', 1))).toBe(second);
    const recovered = reducer(second, setProjectMembers([], 'a', 2));
    expect(recovered.status).toBe('empty');
    expect(reducer(recovered, setProjectMembers(members, 'a', 1))).toBe(recovered);
    expect(reducer(recovered, {
      type: GET_BM_PROJECT_MEMBERS_FAILURE,
      payload: 'Late failure',
      meta: { projectId: 'a', requestId: 1 },
    })).toBe(recovered);
  });
});
