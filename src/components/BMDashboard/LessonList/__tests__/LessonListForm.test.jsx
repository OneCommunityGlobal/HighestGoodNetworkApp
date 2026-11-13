import React from 'react';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import lessonsReducer from '~/reducers/bmdashboard/lessonsReducer';
import { ENDPOINTS } from '~/utils/URL';
import LessonList from '../LessonListForm';
import LessonTagPicker from '../LessonTagPicker';
import { updateBMLesson, deleteBMLesson } from '~/actions/bmdashboard/lessonsAction';
import postNewLesson from '~/actions/bmdashboard/lessonActions';

vi.mock('axios', () => ({
  default: { get: vi.fn(), delete: vi.fn(), put: vi.fn(), post: vi.fn() },
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../Lessons', () => ({
  default: ({ filteredLessons }) => (
    <ul aria-label="Results">
      {filteredLessons.map(lesson => (
        <li key={lesson._id}>{lesson.title}</li>
      ))}
    </ul>
  ),
}));
vi.mock('../ExportConfirmationModal', () => ({
  default: ({ showExportModal, onConfirmExport, isExporting }) =>
    showExportModal ? (
      <button disabled={isExporting} onClick={onConfirmExport}>
        Confirm Export
      </button>
    ) : null,
}));
vi.mock('../ConfirmationModal', () => ({
  default: ({ showConfirmModal, handleDeleteTags, isDeleting }) =>
    showConfirmModal ? (
      <button disabled={isDeleting} onClick={handleDeleteTags}>
        Confirm deletion
      </button>
    ) : null,
}));
let results;
let failList;
let failCatalogue;
const listQueries = () =>
  axios.get.mock.calls
    .map(([url]) => url)
    .filter(url => url.startsWith(`${ENDPOINTS.BM_LESSONS}?`))
    .map(url => new URLSearchParams(url.split('?')[1]));
const mount = (darkMode = false) => {
  const store = createStore(
    combineReducers({ lessons: lessonsReducer, theme: () => ({ darkMode }) }),
    applyMiddleware(thunk),
  );
  return {
    ...render(
      <Provider store={store}>
        <LessonList />
      </Provider>,
    ),
    store,
  };
};
const ready = async () => {
  await screen.findByText(`${results.length} matching lesson(s)`);
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: 'Filter tags' }).disabled).toBe(false),
  );
};
const choose = (label, name) => {
  fireEvent.focus(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name }));
};
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  failList = false;
  failCatalogue = false;
  results = [
    { _id: 'second', title: 'Server first', tags: ['Safety'], totalLikes: 0 },
    { _id: 'first', title: 'Server second', tags: ['Wood'], totalLikes: 20 },
  ];
  axios.get.mockImplementation(async url => {
    if (url === ENDPOINTS.BM_TAG_COUNTS) {
      if (failCatalogue) throw Error('catalogue');
      return {
        data: [
          { tag: 'Safety', count: 3 },
          { tag: 'Wood', count: 1 },
          { tag: 'safety', count: 1 },
          { tag: 'a/b?', count: 1 },
        ],
      };
    }
    if (url === ENDPOINTS.BM_LESSONS) throw Error('Unexpected unfiltered lesson request');
    if (failList) throw { response: { status: 400, data: { error: 'Invalid filter' } } };
    return { data: results };
  });
  axios.delete.mockResolvedValue({});
  axios.put.mockResolvedValue({});
  axios.post.mockResolvedValue({ data: { _id: 'new' } });
});

describe('Lesson List backend filters', () => {
  it('shows loading and disables export until the current query succeeds', async () => {
    const fallback = axios.get.getMockImplementation();
    let resolve;
    axios.get.mockImplementation(url =>
      url.includes('?')
        ? new Promise(done => {
            resolve = done;
          })
        : fallback(url),
    );
    mount();
    expect(screen.getByText('Loading lessons…')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export lesson data to CSV' }).disabled).toBe(true);
    expect(screen.queryByText('Server first')).toBeNull();
    await waitFor(() => expect(resolve).toBeTypeOf('function'));
    resolve({ data: results });
    await ready();
  });
  it('keeps export retryable after a download failure', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    URL.createObjectURL = vi
      .fn()
      .mockImplementationOnce(() => {
        throw Error('Download unavailable');
      })
      .mockReturnValue('blob:retry');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    mount();
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Export lesson data to CSV' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Export' }));
    expect(screen.getByRole('button', { name: 'Confirm Export' }).disabled).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Export' }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('button', { name: 'Confirm Export' })).toBeNull();
    click.mockRestore();
    log.mockRestore();
  });

  it('combines tags, AND/OR, dates, sort and browser timezone without client reordering', async () => {
    mount();
    await ready();
    choose('Filter tags', 'Safety (3)');
    await ready();
    choose('Filter tags', 'Wood (1)');
    await ready();
    fireEvent.click(screen.getByLabelText('Match ANY tag (OR)'));
    await ready();
    fireEvent.change(screen.getByLabelText('Filter:'), { target: { value: '4' } });
    await ready();
    fireEvent.change(screen.getByLabelText('Sort:'), { target: { value: '4' } });
    await ready();
    const query = listQueries().at(-1);
    expect(query.getAll('tags')).toEqual(['Safety', 'Wood']);
    expect(query.get('tagMatch')).toBe('any');
    expect(query.get('dateFilter')).toBe('thisWeek');
    expect(query.get('sort')).toBe('tagFrequency');
    expect(query.get('timeZone')).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(query.has('limit')).toBe(false);
    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual([
      'Server first',
      'Server second',
    ]);
    expect(JSON.parse(localStorage.getItem('lessonListSelectedTags'))).toEqual(['Safety', 'Wood']);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Safety tag' }));
    await ready();
    expect(
      listQueries()
        .at(-1)
        .getAll('tags'),
    ).toEqual(['Wood']);
  });
  it('restores selected tags and resets all filter state and search text', async () => {
    localStorage.setItem('lessonListSelectedTags', JSON.stringify(['Safety', 'Wood']));
    mount(true);
    await ready();
    fireEvent.click(screen.getByLabelText('Match ANY tag (OR)'));
    await ready();
    fireEvent.change(screen.getByLabelText('Sort:'), { target: { value: '3' } });
    await ready();
    fireEvent.change(screen.getByRole('combobox', { name: 'Filter tags' }), {
      target: { value: 'search' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset All' }));
    await ready();
    expect(
      listQueries()
        .at(-1)
        .getAll('tags'),
    ).toEqual([]);
    expect(
      listQueries()
        .at(-1)
        .get('tagMatch'),
    ).toBe('all');
    expect(
      listQueries()
        .at(-1)
        .get('sort'),
    ).toBe('newest');
    expect(
      listQueries()
        .at(-1)
        .get('dateFilter'),
    ).toBe('all');
    expect(localStorage.getItem('lessonListSelectedTags')).toBeNull();
    expect(screen.getByRole('combobox', { name: 'Filter tags' }).value).toBe('');
  });
  it('shows list errors, retries and supports empty results', async () => {
    failList = true;
    mount();
    await screen.findByText('Invalid filter');
    expect(screen.queryByText('Server first')).toBeNull();
    failList = false;
    results = [];
    fireEvent.click(screen.getByRole('button', { name: 'Retry lessons' }));
    await screen.findByText('No lessons match this filter.');
  });
  it('retries catalogue errors independently of list results', async () => {
    failCatalogue = true;
    mount();
    await screen.findByText('Unable to load tag suggestions and global counts.');
    expect(screen.getByRole('combobox', { name: 'Filter tags' }).disabled).toBe(true);
    failCatalogue = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry suggestions' }));
    await ready();
    expect(listQueries()).toHaveLength(1);
  });
  it('handles partial tag deletion, encodes values, removes successful filters and preserves failed selections', async () => {
    localStorage.setItem('lessonListSelectedTags', JSON.stringify(['a/b?', 'Wood']));
    axios.delete.mockImplementation(url =>
      url.endsWith('/Wood') ? Promise.reject(Error('denied')) : Promise.resolve({}),
    );
    mount();
    await ready();
    choose('Tags to delete', 'a/b?');
    choose('Tags to delete', 'Wood');
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm deletion' }));
    await waitFor(() =>
      expect(
        listQueries()
          .at(-1)
          .getAll('tags'),
      ).toEqual(['Wood']),
    );
    expect(axios.delete).toHaveBeenCalledWith(`${ENDPOINTS.BM_TAGS}/a%2Fb%3F`);
    expect(screen.queryByRole('button', { name: 'Remove a/b? tag' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Remove Wood from delete list' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Remove a/b? from delete list' })).toBeNull();
    expect(JSON.parse(localStorage.getItem('lessonListSelectedTags'))).toEqual(['Wood']);
    await waitFor(() =>
      expect(axios.get.mock.calls.filter(([url]) => url === ENDPOINTS.BM_TAG_COUNTS)).toHaveLength(
        2,
      ),
    );
  });
  it('exports all matching rows in server order with escaped filter metadata and no pagination cap', async () => {
    results = Array.from({ length: 105 }, (_, index) => ({
      _id: String(index),
      title: `Server row ${index}`,
      tags: ['Safety'],
      content: '<p>Content, "quoted"</p>',
    }));
    localStorage.setItem('lessonListSelectedTags', JSON.stringify(['Safety', 'Wood']));
    let blob;
    URL.createObjectURL = vi.fn(value => {
      blob = value;
      return 'blob:test';
    });
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    mount();
    await ready();
    fireEvent.change(screen.getByLabelText('Sort:'), { target: { value: '4' } });
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Export lesson data to CSV' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Export' }));
    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalledTimes(1));
    const csv = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsText(blob);
    });
    expect(csv).toContain('Server row 104');
    expect(csv.indexOf('Server row 0')).toBeLessThan(csv.indexOf('Server row 104'));
    expect(csv).toContain('Tag Frequency');
    expect(csv).toContain('AND');
    expect(csv).toContain('""quoted""');
    expect(listQueries()).toHaveLength(2);
    click.mockRestore();
  });
});
describe('accessible tag suggestions', () => {
  function Picker() {
    const [value, input] = React.useState('');
    const [selected, select] = React.useState(['safety']);
    return (
      <LessonTagPicker
        id="test-tags"
        label="Test tags"
        value={value}
        onInputChange={input}
        selectedTags={selected}
        availableTags={['Safety', 'Wood', 'Metal']}
        counts={{ Wood: 1, Metal: 4 }}
        onSelect={tag => {
          select([...selected, tag]);
          input('');
        }}
      />
    );
  }
  it('ranks global counts, excludes selected tags case-insensitively and selects by keyboard', () => {
    render(<Picker />);
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.queryByRole('option', { name: 'Safety (0)' })).toBeNull();
    expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual([
      'Metal (4)',
      'Wood (1)',
    ]);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.focus(input);
    expect(screen.queryByRole('option', { name: 'Wood (1)' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Metal (4)' })).toBeTruthy();
  });
  it('closes on Escape, outside pointer and focus leaving; search is case-insensitive', () => {
    render(<Picker />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'MET' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.getAttribute('aria-expanded')).toBe('false');
    fireEvent.focus(input);
    fireEvent.pointerDown(document.body);
    expect(input.getAttribute('aria-expanded')).toBe('false');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.blur(input, { relatedTarget: document.body });
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('global tag-count metadata', () => {
  const countRequests = () =>
    axios.get.mock.calls.filter(([url]) => url === ENDPOINTS.BM_TAG_COUNTS);
  it('requests authenticated endpoint configuration without lesson filters and reuses counts across filter changes', async () => {
    expect(ENDPOINTS.BM_TAG_COUNTS).toBe(`${ENDPOINTS.BM_TAGS}/counts`);
    mount();
    await ready();
    expect(countRequests()).toHaveLength(1);
    expect(countRequests()[0][1].signal).toBeInstanceOf(AbortSignal);
    choose('Filter tags', 'Safety (3)');
    await ready();
    fireEvent.change(screen.getByLabelText('Sort:'), { target: { value: '4' } });
    await ready();
    fireEvent.change(screen.getByLabelText('Filter:'), { target: { value: '3' } });
    await ready();
    expect(countRequests()).toHaveLength(1);
    expect(axios.get.mock.calls.some(([url]) => url === ENDPOINTS.BM_LESSONS)).toBe(false);
    expect(axios.get.mock.calls.some(([url]) => url === ENDPOINTS.BM_TAGS)).toBe(false);
  });
  it('preserves exact case-sensitive values and global counts while searching case-insensitively', async () => {
    mount();
    await ready();
    const input = screen.getByRole('combobox', { name: 'Filter tags' });
    fireEvent.change(input, { target: { value: 'SAF' } });
    expect(
      within(screen.getByRole('listbox'))
        .getAllByRole('option')
        .map(option => option.textContent),
    ).toEqual(['Safety (3)', 'safety (1)']);
    fireEvent.click(screen.getByRole('option', { name: 'safety (1)' }));
    await ready();
    expect(
      listQueries()
        .at(-1)
        .getAll('tags'),
    ).toEqual(['safety']);
    fireEvent.focus(input);
    expect(screen.queryByRole('option', { name: 'Safety (3)' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remove safety tag' }));
    await ready();
    expect(
      listQueries()
        .at(-1)
        .getAll('tags'),
    ).toEqual([]);
  });
  it('accepts an empty collection without substituting counts from lesson results', async () => {
    const fallback = axios.get.getMockImplementation();
    axios.get.mockImplementation(url =>
      url === ENDPOINTS.BM_TAG_COUNTS ? Promise.resolve({ data: [] }) : fallback(url),
    );
    mount();
    await ready();
    fireEvent.focus(screen.getByRole('combobox', { name: 'Filter tags' }));
    expect(screen.getByText('No matching tags.')).toBeTruthy();
    expect(within(screen.getByRole('listbox')).queryByRole('option')).toBeNull();
    expect(screen.getByText('Server first')).toBeTruthy();
  });
  it('rejects invalid counts and retries without replacing valid lessons', async () => {
    const fallback = axios.get.getMockImplementation();
    let invalid = true;
    axios.get.mockImplementation(url =>
      url === ENDPOINTS.BM_TAG_COUNTS && invalid
        ? Promise.resolve({ data: [{ tag: 'Safety', count: '42' }] })
        : fallback(url),
    );
    mount();
    await screen.findByText('Unable to load tag suggestions and global counts.');
    expect(screen.getByText('Server first')).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Filter tags' }).disabled).toBe(true);
    invalid = false;
    fireEvent.click(screen.getByRole('button', { name: 'Retry suggestions' }));
    await ready();
    expect(countRequests()).toHaveLength(2);
  });
  it('refreshes after successful create, edit and delete but not failed mutations or query refreshes', async () => {
    const { store } = mount();
    await ready();
    await act(async () => {
      await store.dispatch(postNewLesson({ title: 'New', tags: ['Safety'] }));
    });
    await ready();
    expect(countRequests()).toHaveLength(2);
    await act(async () => {
      await store.dispatch(updateBMLesson('second', 'Edited'));
    });
    await ready();
    expect(countRequests()).toHaveLength(3);
    await act(async () => {
      await store.dispatch(deleteBMLesson('second'));
    });
    await ready();
    expect(countRequests()).toHaveLength(4);
    axios.put.mockRejectedValueOnce(Error('offline'));
    await act(async () => {
      await store.dispatch(updateBMLesson('second', 'Not saved'));
    });
    expect(countRequests()).toHaveLength(4);
  });
  it('ignores an older metadata response after a newer mutation refresh', async () => {
    const fallback = axios.get.getMockImplementation();
    let finishOld;
    let first = true;
    let oldSignal;
    axios.get.mockImplementation((url, options) => {
      if (url === ENDPOINTS.BM_TAG_COUNTS && first) {
        first = false;
        oldSignal = options.signal;
        return new Promise(resolve => {
          finishOld = resolve;
        });
      }
      return fallback(url);
    });
    const { store } = mount();
    await screen.findByText('Server first');
    act(() => store.dispatch({ type: 'POST_LESSON_SUCCESS' }));
    await ready();
    expect(oldSignal.aborted).toBe(true);
    await act(async () => {
      finishOld({ data: [{ tag: 'Stale', count: 999 }] });
    });
    fireEvent.focus(screen.getByRole('combobox', { name: 'Filter tags' }));
    expect(screen.queryByRole('option', { name: 'Stale (999)' })).toBeNull();
    expect(screen.getByRole('option', { name: 'Safety (3)' })).toBeTruthy();
    expect(countRequests()).toHaveLength(2);
  });
});

it('keeps long exact-value tag suggestions, chip removal, and reset functional', async () => {
  const longTag = 'Unbroken'.repeat(12);
  const fallback = axios.get.getMockImplementation();
  axios.get.mockImplementation(url =>
    url === ENDPOINTS.BM_TAG_COUNTS
      ? Promise.resolve({ data: [{ tag: longTag, count: 12 }] })
      : fallback(url),
  );
  mount();
  await ready();
  choose('Filter tags', `${longTag} (12)`);
  await ready();
  expect(
    listQueries()
      .at(-1)
      .getAll('tags'),
  ).toEqual([longTag]);
  fireEvent.click(screen.getByRole('button', { name: `Remove ${longTag} tag` }));
  await ready();
  expect(
    listQueries()
      .at(-1)
      .getAll('tags'),
  ).toEqual([]);
  expect(screen.getByRole('button', { name: 'Export lesson data to CSV' }).disabled).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Reset All' }));
  await ready();
  expect(screen.getByRole('combobox', { name: 'Filter tags' }).value).toBe('');
});

it('neutralizes formula text in the downloaded CSV without truncating or changing ordering', async () => {
  results[0] = { ...results[0], title: '=1+1', tags: ['-tag'], content: '+SUM(1,2)' };
  let blob;
  URL.createObjectURL = vi.fn(value => {
    blob = value;
    return 'blob:safe-csv';
  });
  URL.revokeObjectURL = vi.fn();
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  mount();
  await ready();
  fireEvent.click(screen.getByRole('button', { name: 'Export lesson data to CSV' }));
  fireEvent.click(screen.getByRole('button', { name: 'Confirm Export' }));
  const csv = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(blob);
  });
  expect(csv).toContain("'=1+1");
  expect(csv).toContain("'-tag");
  expect(csv).toContain('"\'+SUM(1,2)"');
  expect(csv.indexOf("'=1+1")).toBeLessThan(csv.indexOf('Server second'));
  click.mockRestore();
});
