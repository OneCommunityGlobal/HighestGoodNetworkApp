import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import { fetchBMLessons, refreshBMLessons, updateBMLesson, deleteBMLesson } from '../lessonsAction';
import { likeLessonAction } from '../lessonLikesActions';
import { lessonsReducer } from '~/reducers/bmdashboard/lessonsReducer';
import { ENDPOINTS } from '~/utils/URL';
import {
  GET_BM_LESSONS,
  BM_LESSONS_REQUEST,
  BM_LESSONS_FAILURE,
  BM_LESSON_LIKES,
} from '~/constants/bmdashboard/lessonConstants';
vi.mock('axios', () => ({ default: { get: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
const item = {
  _id: 'lesson-1',
  title: 'Lesson',
  author: 'legacy-name',
  relatedProject: 'legacy-project',
  tags: ['Safety'],
  totalLikes: 2,
  likes: ['like-record-id'],
  isLiked: false,
};
const makeStore = () =>
  createStore(combineReducers({ lessons: lessonsReducer }), applyMiddleware(thunk));
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { resolve, reject, promise };
}
beforeEach(() => {
  vi.clearAllMocks();
  axios.get.mockResolvedValue({ data: [item] });
  axios.put.mockResolvedValue({ status: 200, data: { ...item, totalLikes: 3, likes: ['user'] } });
  axios.delete.mockResolvedValue({ status: 200 });
});
describe('lesson API and Redux integration', () => {
  it('does not accept an older response that finishes enrichment after a newer query', async () => {
    const author = '0123456789abcdef01234567';
    const profile = deferred();
    axios.get.mockImplementation(url =>
      url === ENDPOINTS.USER_PROFILE(author)
        ? profile.promise
        : Promise.resolve({
            data: url.includes('tags=old') ? [{ ...item, author }] : [{ ...item, title: 'New' }],
          }),
    );
    const store = makeStore();
    const old = store.dispatch(fetchBMLessons({ tags: ['old'] }));
    await vi.waitFor(() => expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE(author)));
    await store.dispatch(fetchBMLessons({ tags: ['new'] }));
    profile.resolve({ data: { firstName: 'Old', lastName: 'Author' } });
    expect((await old).stale).toBe(true);
    expect(store.getState().lessons.lessons[0].title).toBe('New');
  });
  it('does not roll back a saved like when its active-query refresh fails', async () => {
    const store = makeStore();
    await store.dispatch(fetchBMLessons({ sort: 'likes' }));
    axios.get.mockRejectedValueOnce(Error('Refresh offline'));
    await store.dispatch(likeLessonAction(item._id, 'user'));
    expect(store.getState().lessons.lessons[0].totalLikes).toBe(3);
    expect(store.getState().lessons.error).toBe('Refresh offline');
    expect(store.getState().lessons.pendingLikes[item._id]).toBeUndefined();
  });

  it('keeps the legacy no-argument GET and enriched lesson shape', async () => {
    const store = makeStore();
    const result = await store.dispatch(fetchBMLessons());
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.BM_LESSONS);
    expect(result.ok).toBe(true);
    expect(store.getState().lessons.lessons[0]).toMatchObject({
      author: { id: 'legacy-name', name: 'Unknown' },
      relatedProject: { id: 'legacy-project', name: 'Unknown Project' },
    });
    expect(store.getState().lessons.pagination).toBeNull();
  });
  it('enriches distinct references once while preserving files and server order', async () => {
    const author = '0123456789abcdef01234567';
    const project = 'abcdef0123456789abcdef01';
    axios.get.mockImplementation(url => {
      if (url === ENDPOINTS.USER_PROFILE(author))
        return Promise.resolve({ data: { _id: author, firstName: 'Alex', lastName: 'Example' } });
      if (url === ENDPOINTS.BM_PROJECT_BY_ID(project))
        return Promise.resolve({ data: { _id: project, name: 'Project', location: 'Site' } });
      return Promise.resolve({
        data: [
          { ...item, _id: 'second', author, relatedProject: project, files: [{ name: 'file' }] },
          { ...item, author, relatedProject: project },
        ],
      });
    });
    const store = makeStore();
    await store.dispatch(fetchBMLessons({ sort: 'oldest' }));
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(store.getState().lessons.lessons.map(lesson => lesson._id)).toEqual([
      'second',
      'lesson-1',
    ]);
    expect(store.getState().lessons.lessons[0]).toMatchObject({
      author: { name: 'Alex Example' },
      relatedProject: { name: 'Project' },
      files: [{ name: 'file' }],
    });
  });
  it('unwraps paginated data and retains totals', async () => {
    const pagination = { page: 2, limit: 25, total: 26, totalPages: 2, hasNextPage: false };
    axios.get.mockResolvedValue({ data: { data: [item], pagination } });
    const store = makeStore();
    await store.dispatch(fetchBMLessons({ page: 2, limit: 25 }));
    expect(store.getState().lessons.pagination).toEqual(pagination);
    expect(store.getState().lessons.lessons).toHaveLength(1);
  });
  it('ignores an out-of-order response', async () => {
    const slow = deferred();
    axios.get
      .mockReturnValueOnce(slow.promise)
      .mockResolvedValueOnce({ data: [{ ...item, title: 'Newest query' }] });
    const store = makeStore();
    const old = store.dispatch(fetchBMLessons({ tags: ['old'] }));
    await store.dispatch(fetchBMLessons({ tags: ['new'] }));
    slow.resolve({ data: [item] });
    expect((await old).stale).toBe(true);
    expect(store.getState().lessons.lessons[0].title).toBe('Newest query');
  });
  it('cancels without accepting the response or showing an API error', async () => {
    const pending = deferred();
    axios.get.mockReturnValueOnce(pending.promise);
    const controller = new AbortController();
    const store = makeStore();
    const work = store.dispatch(fetchBMLessons({}, { signal: controller.signal }));
    controller.abort();
    pending.resolve({ data: [item] });
    expect((await work).cancelled).toBe(true);
    expect(store.getState().lessons.lessons).toEqual([]);
    expect(store.getState().lessons.error).toBeNull();
  });
  it('exposes HTTP validation errors and supports retrying the active query', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Invalid timeZone' } },
    });
    const store = makeStore();
    await store.dispatch(fetchBMLessons({ dateFilter: 'thisWeek', timeZone: 'invalid' }));
    expect(store.getState().lessons.error).toBe('Invalid timeZone');
    expect(store.getState().lessons.loading).toBe(false);
    await store.dispatch(refreshBMLessons());
    expect(store.getState().lessons.error).toBeNull();
    expect(axios.get.mock.calls[1][0]).toContain('dateFilter=thisWeek');
  });
  it('optimistically likes once, prevents duplicate pending likes and refreshes the active sort/filter', async () => {
    const store = makeStore();
    await store.dispatch(fetchBMLessons({ tags: ['Safety'], sort: 'likes' }));
    const pending = deferred();
    axios.put.mockReturnValueOnce(pending.promise);
    const work = store.dispatch(likeLessonAction(item._id, 'user'));
    expect(store.getState().lessons.lessons[0].totalLikes).toBe(3);
    await store.dispatch(likeLessonAction(item._id, 'user'));
    expect(axios.put).toHaveBeenCalledTimes(1);
    pending.resolve({ status: 200, data: { ...item, totalLikes: 3, likes: ['user'] } });
    await work;
    expect(axios.get.mock.calls[1][0]).toContain('tags=Safety');
    expect(axios.get.mock.calls[1][0]).toContain('sort=likes');
    expect(store.getState().lessons.pendingLikes[item._id]).toBeUndefined();
  });
  it('rolls back failed likes and preserves enriched author/project fields', async () => {
    const store = makeStore();
    await store.dispatch(fetchBMLessons());
    const original = store.getState().lessons.lessons[0];
    axios.put.mockRejectedValueOnce(new Error('offline'));
    await store.dispatch(likeLessonAction(item._id, 'user'));
    expect(store.getState().lessons.lessons[0]).toEqual(original);
    store.dispatch({ type: BM_LESSON_LIKES, payload: { ...item, totalLikes: 9, likes: ['user'] } });
    expect(store.getState().lessons.lessons[0].author).toEqual(original.author);
  });
  it('refreshes edits/deletes using the active query without discarding failures', async () => {
    const store = makeStore();
    await store.dispatch(fetchBMLessons({ tags: ['Safety'], sort: 'tagFrequency' }));
    expect(await store.dispatch(updateBMLesson(item._id, 'New content'))).toBe(true);
    expect(axios.get.mock.calls[1][0]).toContain('sort=tagFrequency');
    axios.put.mockRejectedValueOnce(new Error('offline'));
    expect(await store.dispatch(updateBMLesson(item._id, 'Unsaved'))).toBe(false);
    expect(store.getState().lessons.lessons[0].content).not.toBe('Unsaved');
    await store.dispatch(deleteBMLesson(item._id));
    expect(axios.get.mock.calls[2][0]).toContain('tags=Safety');
    axios.delete.mockRejectedValueOnce(new Error('offline'));
    await expect(store.dispatch(deleteBMLesson(item._id))).rejects.toThrow('offline');
  });
  it('does not accept stale failure actions and retains the legacy set-lessons action', () => {
    const store = makeStore();
    store.dispatch({ type: BM_LESSONS_REQUEST, requestId: 2, query: {}, queryKey: '' });
    store.dispatch({ type: BM_LESSONS_FAILURE, requestId: 1, error: 'Old failure' });
    expect(store.getState().lessons.error).toBeNull();
    store.dispatch({ type: GET_BM_LESSONS, payload: [item] });
    expect(store.getState().lessons.lessons).toEqual([item]);
  });
});
