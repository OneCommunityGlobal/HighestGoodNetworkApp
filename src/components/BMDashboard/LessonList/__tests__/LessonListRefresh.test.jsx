import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import axios from 'axios';
import LessonList from '../LessonListForm';
import lessonsReducer from '~/reducers/bmdashboard/lessonsReducer';
import { ENDPOINTS } from '~/utils/URL';
import { refreshBMLessons } from '~/actions/bmdashboard/lessonsAction';
vi.mock('axios', () => ({ default: { get: vi.fn(), put: vi.fn(), delete: vi.fn() } }));
vi.mock('react-toastify', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
// Use actual Lessons, LessonCard, and modal components: component identity is the regression.
const a = {
  _id: 'a',
  title: 'Lesson A',
  content: 'Saved A',
  date: '2026-11-01',
  tags: ['Safety'],
  author: 'user',
  relatedProject: 'Site',
  totalLikes: 3,
  isLiked: false,
  likes: [],
};
const b = { ...a, _id: 'b', title: 'Lesson B', content: 'Saved B', totalLikes: 1 };
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
let pendingGet;
let results;
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  results = [a, b];
  pendingGet = null;
  axios.get.mockImplementation(url => {
    if (url === ENDPOINTS.BM_TAG_COUNTS)
      return Promise.resolve({ data: [{ tag: 'Safety', count: 2 }] });
    if (pendingGet) {
      const response = pendingGet;
      pendingGet = null;
      return response.promise;
    }
    return Promise.resolve({ data: results });
  });
  axios.put.mockResolvedValue({
    status: 200,
    data: { status: 'success', message: 'Lesson liked successfully' },
  });
});
async function mount() {
  const store = createStore(
    combineReducers({
      lessons: lessonsReducer,
      auth: () => ({ user: { userid: 'user' } }),
      theme: () => ({ darkMode: false }),
    }),
    applyMiddleware(thunk),
  );
  render(
    <Provider store={store}>
      <LessonList />
    </Provider>,
  );
  await waitFor(() =>
    expect(screen.getByRole('region', { name: 'Lesson results' }).getAttribute('aria-busy')).toBe(
      'false',
    ),
  );
  fireEvent.change(screen.getByRole('combobox', { name: 'Lesson sort' }), {
    target: { value: '3' },
  });
  await waitFor(() =>
    expect(screen.getByRole('region', { name: 'Lesson results' }).getAttribute('aria-busy')).toBe(
      'false',
    ),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
  const editor = screen.getByRole('textbox');
  fireEvent.change(editor, { target: { value: 'Unsaved draft A' } });
  act(() => editor.focus());
  return { store, editor };
}
it.each(['draft', 'like button'])(
  'retains real card drafts, expansion, DOM identity and %s focus during a like refresh',
  async focus => {
    const { editor, store } = await mount();
    const likeButton = screen.getByRole('button', { name: 'Like for Lesson B' });
    if (focus === 'like button') act(() => likeButton.focus());
    const response = deferred();
    pendingGet = response;
    fireEvent.click(likeButton);
    await screen.findByText('Refreshing lessons…');
    expect(screen.getByRole('textbox')).toBe(editor);
    expect(editor.value).toBe('Unsaved draft A');
    expect(screen.getByRole('region', { name: 'Lesson results' }).hidden).toBe(false);
    expect(likeButton.getAttribute('aria-disabled')).toBe('true');
    expect(focus === 'draft' ? editor : likeButton).toHaveFocus();
    fireEvent.click(likeButton);
    expect(axios.put).toHaveBeenCalledTimes(1);
    await act(async () =>
      response.resolve({
        data: [
          { ...b, totalLikes: 6, isLiked: true },
          { ...a, content: 'Server A changed' },
        ],
      }),
    );
    await waitFor(() => expect(screen.queryByText('Refreshing lessons…')).toBeNull());
    expect(screen.getByRole('textbox')).toBe(editor);
    expect(editor.value).toBe('Unsaved draft A');
    expect(screen.getByRole('button', { name: 'Unlike for Lesson B' })).toBe(likeButton);
    expect(likeButton.textContent).toBe('Liked: 6');
    expect(likeButton.getAttribute('aria-disabled')).toBe('false');
    expect(focus === 'draft' ? editor : likeButton).toHaveFocus();
    expect(screen.getAllByText(/^Lesson [AB]$/).map(element => element.textContent)).toEqual([
      'Lesson B',
      'Lesson A',
    ]);
    expect(store.getState().lessons.query.sort).toBe('likes');
  },
);
it('keeps the draft and visible matching results on a failed same-query refresh', async () => {
  const { store, editor } = await mount();
  const response = deferred();
  pendingGet = response;
  let work;
  act(() => {
    work = store.dispatch(refreshBMLessons());
  });
  expect(screen.getByRole('textbox')).toBe(editor);
  await act(async () => {
    response.reject(Error('Refresh offline'));
    await work;
  });
  expect(screen.getByRole('alert').textContent).toContain('Refresh offline');
  expect(screen.getByRole('textbox').value).toBe('Unsaved draft A');
  expect(editor).toHaveFocus();
});
it('hides old query results through loading and failure, then retains a surviving card draft after retry', async () => {
  const { editor } = await mount();
  const response = deferred();
  pendingGet = response;
  fireEvent.change(screen.getByRole('combobox', { name: 'Date filter' }), {
    target: { value: '4' },
  });
  expect(screen.getByRole('region', { hidden: true }).hidden).toBe(true);
  expect(screen.queryByRole('textbox')).toBeNull();
  await act(async () => response.reject(Error('New query offline')));
  expect(screen.getByRole('alert').textContent).toContain('New query offline');
  expect(screen.getByRole('region', { hidden: true }).hidden).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Retry lessons' }));
  await waitFor(() =>
    expect(screen.getByRole('region', { name: 'Lesson results' }).hidden).toBe(false),
  );
  expect(screen.getByRole('textbox')).toBe(editor);
  expect(editor.value).toBe('Unsaved draft A');
});
it('clears drafts and expansion for lessons removed from authoritative results', async () => {
  const { store } = await mount();
  results = [b];
  await act(async () => {
    await store.dispatch(refreshBMLessons());
  });
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.queryByText('Lesson A')).toBeNull();
  expect(screen.getByRole('button', { name: 'Like for Lesson B' })).toBeTruthy();
  results = [a, b];
  await act(async () => {
    await store.dispatch(refreshBMLessons());
  });
  // A returning to a later result set must not resurrect a discarded/deleted record's editor.
  expect(screen.queryByRole('textbox')).toBeNull();
  fireEvent.click(screen.getByText('Lesson A'));
  expect(screen.getByText('Saved A')).toBeTruthy();
  expect(screen.queryByRole('textbox')).toBeNull();
});
