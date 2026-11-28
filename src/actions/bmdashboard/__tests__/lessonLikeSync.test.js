import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import { likeLessonAction } from '../lessonLikesActions';
import { fetchBMLessons } from '../lessonsAction';
import lessonsReducer from '~/reducers/bmdashboard/lessonsReducer';
import { GET_BM_LESSONS } from '~/constants/bmdashboard/lessonConstants';
vi.mock('axios', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn() } }));
const base = {
  _id: 'a',
  title: 'Lesson A',
  totalLikes: 2,
  likes: ['like-record-1'],
  tags: ['Safety'],
};
const query = {
  tags: ['Safety', 'A&B'],
  tagMatch: 'any',
  dateFilter: 'thisWeek',
  timeZone: 'America/Los_Angeles',
  sort: 'likes',
};
const storeFor = () =>
  createStore(combineReducers({ lessons: lessonsReducer }), applyMiddleware(thunk));
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockResolvedValue({ data: [base] });
  axios.put.mockResolvedValue({
    status: 200,
    data: { status: 'success', message: 'Lesson liked successfully' },
  });
});
describe('lesson like/unlike synchronization with the real acknowledgement contract', () => {
  it('settles an acknowledgement by the requested ID and accepts authoritative counts', async () => {
    const store = storeFor();
    await store.dispatch(fetchBMLessons(query));
    axios.get.mockResolvedValueOnce({ data: [{ ...base, totalLikes: 7 }] });
    expect(await store.dispatch(likeLessonAction('a', 'user'))).toEqual({
      ok: true,
      refreshed: true,
    });
    expect(store.getState().lessons.pendingLikes).toEqual({});
    expect(store.getState().lessons.lessons[0].totalLikes).toBe(7);
    expect(store.getState().lessons.lessons[0].isLiked).toBeUndefined();
  });
  it('does not compare user IDs with Like-record IDs or guess an optimistic direction', async () => {
    const store = storeFor();
    await store.dispatch(fetchBMLessons());
    const pending = deferred();
    axios.put.mockReturnValueOnce(pending.promise);
    const work = store.dispatch(likeLessonAction('a', 'like-record-1'));
    expect(store.getState().lessons.lessons[0]).toMatchObject({
      likes: ['like-record-1'],
      totalLikes: 2,
    });
    expect(store.getState().lessons.lessons[0].isLiked).toBeUndefined();
    pending.resolve({ status: 200, data: { status: 'success' } });
    await work;
  });
  it('allows like followed by unlike and uses each server count without requiring a liked flag', async () => {
    const store = storeFor();
    let count = 2;
    let liked = false;
    axios.get.mockImplementation(async () => ({
      data: [{ ...base, totalLikes: count, likes: liked ? ['new-like-record'] : [] }],
    }));
    axios.put.mockImplementation(async () => {
      liked = !liked;
      count += liked ? 1 : -1;
      return {
        status: 200,
        data: {
          status: 'success',
          message: liked ? 'Lesson liked successfully' : 'Lesson unliked successfully',
        },
      };
    });
    await store.dispatch(fetchBMLessons(query));
    await store.dispatch(likeLessonAction('a', 'user'));
    expect(store.getState().lessons.lessons[0].totalLikes).toBe(3);
    await store.dispatch(likeLessonAction('a', 'user'));
    expect(store.getState().lessons.lessons[0].totalLikes).toBe(2);
    expect(axios.put).toHaveBeenCalledTimes(2);
    expect(store.getState().lessons.pendingLikes).toEqual({});
  });
  it('blocks two rapid clicks and keeps the lock until the authoritative refresh finishes', async () => {
    const store = storeFor();
    await store.dispatch(fetchBMLessons(query));
    const put = deferred();
    const get = deferred();
    axios.put.mockReturnValueOnce(put.promise);
    axios.get.mockReturnValueOnce(get.promise);
    const work = store.dispatch(likeLessonAction('a', 'user'));
    expect(await store.dispatch(likeLessonAction('a', 'user'))).toEqual({
      ok: false,
      pending: true,
    });
    expect(axios.put).toHaveBeenCalledTimes(1);
    put.resolve({ status: 200, data: { status: 'success' } });
    await vi.waitFor(() =>
      expect(store.getState().lessons.pendingLikes.a.phase).toBe('refreshing'),
    );
    await store.dispatch(likeLessonAction('a', 'user'));
    expect(axios.put).toHaveBeenCalledTimes(1);
    get.resolve({ data: [{ ...base, totalLikes: 3 }] });
    await work;
    await store.dispatch(likeLessonAction('a', 'user'));
    expect(axios.put).toHaveBeenCalledTimes(2);
  });
  it('rolls back reliable optimistic state on failure, clears pending, and permits retry', async () => {
    const store = storeFor();
    axios.get.mockResolvedValue({ data: [{ ...base, isLiked: false }] });
    await store.dispatch(fetchBMLessons(query));
    const put = deferred();
    axios.put.mockReturnValueOnce(put.promise);
    const work = store.dispatch(likeLessonAction('a', 'user'));
    expect(store.getState().lessons.lessons[0]).toMatchObject({
      totalLikes: 3,
      isLiked: true,
      likes: base.likes,
    });
    put.reject(Error('offline'));
    expect((await work).ok).toBe(false);
    expect(store.getState().lessons.lessons[0]).toMatchObject({
      totalLikes: 2,
      isLiked: false,
      likes: base.likes,
    });
    expect(store.getState().lessons.pendingLikes).toEqual({});
    await store.dispatch(likeLessonAction('a', 'user'));
    expect(axios.put).toHaveBeenCalledTimes(2);
  });
  it('replaces optimistic values and preserves backend likes order and deterministic ties', async () => {
    const store = storeFor();
    axios.get.mockResolvedValueOnce({
      data: [
        { ...base, isLiked: false },
        { ...base, _id: 'b', totalLikes: 3 },
      ],
    });
    await store.dispatch(fetchBMLessons(query));
    axios.get.mockResolvedValueOnce({
      data: [
        { ...base, _id: 'b', totalLikes: 5 },
        { ...base, totalLikes: 5 },
      ],
    });
    await store.dispatch(likeLessonAction('a', 'user'));
    expect(store.getState().lessons.lessons.map(item => [item._id, item.totalLikes])).toEqual([
      ['b', 5],
      ['a', 5],
    ]);
    expect(store.getState().lessons.query).toEqual(query);
    const params = new URLSearchParams(axios.get.mock.calls.at(-1)[0].split('?')[1]);
    expect(params.getAll('tags')).toEqual(query.tags);
    for (const key of ['tagMatch', 'dateFilter', 'timeZone', 'sort'])
      expect(params.get(key)).toBe(query[key]);
  });
  it('never overlays pending optimism onto GET results or rolls back newer server data', async () => {
    const store = storeFor();
    axios.get.mockResolvedValue({ data: [{ ...base, isLiked: false }] });
    await store.dispatch(fetchBMLessons());
    const put = deferred();
    axios.put.mockReturnValueOnce(put.promise);
    const work = store.dispatch(likeLessonAction('a', 'user'));
    store.dispatch({ type: GET_BM_LESSONS, payload: [{ ...base, totalLikes: 9 }] });
    expect(store.getState().lessons.lessons[0].totalLikes).toBe(9);
    put.reject(Error('offline'));
    await work;
    expect(store.getState().lessons.lessons[0].totalLikes).toBe(9);
    expect(store.getState().lessons.pendingLikes).toEqual({});
  });
  it('does not roll back a saved mutation on refresh failure and releases the lock', async () => {
    const store = storeFor();
    await store.dispatch(fetchBMLessons(query));
    axios.get.mockRejectedValueOnce(Error('refresh offline'));
    expect(await store.dispatch(likeLessonAction('a', 'user'))).toEqual({
      ok: true,
      refreshed: false,
    });
    expect(store.getState().lessons.error).toBe('refresh offline');
    expect(store.getState().lessons.pendingLikes).toEqual({});
    await store.dispatch(likeLessonAction('a', 'user'));
    expect(axios.put).toHaveBeenCalledTimes(2);
  });
  it('refreshes the current query if filters change while the PUT is pending', async () => {
    const store = storeFor();
    await store.dispatch(fetchBMLessons(query));
    const put = deferred();
    axios.put.mockReturnValueOnce(put.promise);
    const work = store.dispatch(likeLessonAction('a', 'user'));
    const changed = { ...query, tags: ['Wood'], tagMatch: 'all', dateFilter: 'thisMonth' };
    await store.dispatch(fetchBMLessons(changed));
    put.resolve({ status: 200, data: { status: 'success' } });
    await work;
    expect(store.getState().lessons.query).toEqual(changed);
    expect(axios.get.mock.calls.at(-1)[0]).toContain('tags=Wood');
  });
  it('rolls back non-success acknowledgements and never stores an undefined lesson ID', async () => {
    const store = storeFor();
    await store.dispatch(fetchBMLessons());
    axios.put.mockResolvedValueOnce({ status: 200, data: { status: 'error' } });
    expect((await store.dispatch(likeLessonAction('a', 'user'))).ok).toBe(false);
    expect(store.getState().lessons.pendingLikes).toEqual({});
    expect(axios.get).toHaveBeenCalledTimes(1);
  });
});
