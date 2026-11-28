/* eslint-disable testing-library/no-node-access */
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LessonCard from '../LessonCard';
import lessonsReducer from '~/reducers/bmdashboard/lessonsReducer';
import { GET_BM_LESSONS, BM_LESSON_LIKE_FINISHED } from '~/constants/bmdashboard/lessonConstants';
vi.mock('../DeleteLessonCardPopUp', () => ({ default: () => null }));
const lesson = {
  _id: 'a',
  title: 'A lesson',
  date: '2026-11-01',
  content: 'Content',
  author: { id: 'author' },
  likes: ['user'],
  totalLikes: 2,
};
function mount(extra = {}, darkMode = false) {
  const store = createStore(
    combineReducers({
      lessons: lessonsReducer,
      theme: () => ({ darkMode }),
      auth: () => ({ user: { userid: 'user' } }),
    }),
  );
  store.dispatch({ type: GET_BM_LESSONS, payload: [{ ...lesson, ...extra }] });
  const handleLike = vi.fn();
  render(
    <Provider store={store}>
      <LessonCard filteredLessons={[{ ...lesson, ...extra }]} handleLike={handleLike} />
    </Provider>,
  );
  fireEvent.click(screen.getByText(extra.title || 'A lesson'));
  return { store, handleLike };
}
it('does not claim liked status from matching Like-record and user IDs', () => {
  const { handleLike } = mount();
  const button = screen.getByRole('button', { name: 'Toggle like for A lesson' });
  expect(button.getAttribute('aria-pressed')).toBeNull();
  fireEvent.click(button);
  expect(handleLike).toHaveBeenCalledWith('a', 'user');
});
it('disables the real button only while pending and restores repeated interaction', () => {
  const { store, handleLike } = mount();
  const button = screen.getByRole('button', { name: 'Toggle like for A lesson' });
  act(() => store.dispatch({ type: 'OPTIMISTIC_LIKE_UPDATE', payload: { lessonId: 'a' } }));
  expect(button.getAttribute('aria-disabled')).toBe('true');
  expect(button.getAttribute('aria-busy')).toBe('true');
  fireEvent.click(button);
  expect(handleLike).not.toHaveBeenCalled();
  act(() => store.dispatch({ type: BM_LESSON_LIKE_FINISHED, payload: { lessonId: 'a' } }));
  expect(button.getAttribute('aria-disabled')).toBe('false');
  fireEvent.click(button);
  expect(handleLike).toHaveBeenCalledTimes(1);
});
it('uses an explicit per-user flag when the backend provides one', () => {
  mount({ isLiked: true });
  expect(
    screen.getByRole('button', { name: 'Unlike for A lesson' }).getAttribute('aria-pressed'),
  ).toBe('true');
});

it.each([false, true])(
  'renders an initially liked lesson with a filled heart and explicit label in dark mode=%s',
  darkMode => {
    mount({ isLiked: true }, darkMode);
    const button = screen.getByRole('button', { name: 'Unlike for A lesson', pressed: true });
    expect(button.textContent).toBe('Liked: 2');
    expect(
      screen
        .getByRole('button', { name: 'Unlike for A lesson' })
        .querySelector('svg')
        .getAttribute('data-prefix'),
    ).toBe('fas');
  },
);
it.each([false, true])(
  'renders an initially unliked lesson with an outline heart in dark mode=%s',
  darkMode => {
    mount({ isLiked: false }, darkMode);
    const button = screen.getByRole('button', { name: 'Like for A lesson', pressed: false });
    expect(button.textContent).toBe('Like: 2');
    expect(button.querySelector('svg').getAttribute('data-prefix')).toBe('far');
  },
);
it('updates liked visuals on optimistic toggling and replaces them with authoritative refresh state', () => {
  const { store } = mount({ isLiked: true });
  act(() => store.dispatch({ type: 'OPTIMISTIC_LIKE_UPDATE', payload: { lessonId: 'a' } }));
  expect(
    screen.getByRole('button', { name: 'Like for A lesson', pressed: false }).textContent,
  ).toBe('Like: 1');
  act(() =>
    store.dispatch({
      type: GET_BM_LESSONS,
      payload: [{ ...lesson, isLiked: false, totalLikes: 1 }],
    }),
  );
  act(() => store.dispatch({ type: BM_LESSON_LIKE_FINISHED, payload: { lessonId: 'a' } }));
  const unliked = screen.getByRole('button', { name: 'Like for A lesson', pressed: false });
  expect(unliked.disabled).toBe(false);
  expect(unliked.querySelector('svg').getAttribute('data-prefix')).toBe('far');
  act(() =>
    store.dispatch({
      type: GET_BM_LESSONS,
      payload: [{ ...lesson, isLiked: true, totalLikes: 4 }],
    }),
  );
  const liked = screen.getByRole('button', { name: 'Unlike for A lesson', pressed: true });
  expect(liked.textContent).toBe('Liked: 4');
  expect(liked.querySelector('svg').getAttribute('data-prefix')).toBe('fas');
});
it('keeps a neutral visual and unknown pressed state for legacy responses without isLiked', () => {
  mount();
  const button = screen.getByRole('button', { name: 'Toggle like for A lesson' });
  expect(button.textContent).toBe('Toggle like: 2');
  expect(button.getAttribute('aria-pressed')).toBeNull();
  expect(button.querySelector('svg').getAttribute('data-prefix')).toBe('far');
});

it('keeps expand/collapse and like controls usable with long mobile card content', () => {
  const long = 'LongUnbrokenText'.repeat(12);
  mount({
    title: long,
    content: long,
    tags: [long],
    author: { id: 'user', name: long },
    relatedProject: { name: long },
    isLiked: true,
  });
  expect(screen.getByRole('button', { name: `Unlike for ${long}` }).textContent).toBe('Liked: 2');
  fireEvent.click(screen.getByRole('button', { name: 'Collapse All' }));
  expect(screen.queryByRole('button', { name: `Unlike for ${long}` })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Expand All' }));
  expect(screen.getByRole('button', { name: `Unlike for ${long}` }).disabled).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  expect(screen.getByRole('textbox').value).toBe(long);
});

it('preserves the empty-list fallback when results are not supplied yet', () => {
  const store = createStore(
    combineReducers({
      lessons: lessonsReducer,
      theme: () => ({ darkMode: false }),
      auth: () => ({ user: { userid: 'user' } }),
    }),
  );
  render(
    <Provider store={store}>
      <LessonCard />
    </Provider>,
  );
  expect(
    screen.getByText(
      'No lessons found. Please add lessons to the database or adjust your filters.',
    ),
  ).toBeTruthy();
});
