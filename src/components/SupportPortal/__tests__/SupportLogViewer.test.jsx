import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureMockStore from 'redux-mock-store';
import SupportLogViewer from '../SupportLogViewer';
import styles from '../SupportLogViewer.module.css';
import httpService from '../../../services/httpService';
import { ENDPOINTS } from '../../../utils/URL';

vi.mock('../../../services/httpService', () => ({ default: { get: vi.fn() } }));

const mockStore = configureMockStore();
const entry = metadata => ({ log_id: 'log-1', action_type: 'note', created_at: null, metadata });
const renderViewer = (darkMode = false) => {
  const history = createMemoryHistory({ initialEntries: ['/support/log/student-1'] });
  const store = mockStore({ theme: { darkMode } });
  const viewer = id => (
    <Provider store={store}>
      <Router history={history}>
        <SupportLogViewer match={{ params: { studentId: id } }} />
      </Router>
    </Provider>
  );
  const { rerender } = render(viewer('student-1'));
  return { history, changeStudent: id => rerender(viewer(id)) };
};
const serveMetadata = metadata => {
  httpService.get.mockImplementation(url =>
    Promise.resolve({
      data: url.includes('/daily-log/')
        ? [entry(metadata)]
        : { firstName: 'Test', lastName: 'Student' },
    }),
  );
};

beforeEach(() => {
  httpService.get.mockReset();
  serveMetadata('Example details');
});
afterEach(() => vi.restoreAllMocks());

it.each([
  ['text', 'Plain text'],
  ['number', 0],
  ['boolean', false],
])('renders %s scalars', async (label, value) => {
  serveMetadata(value);
  renderViewer();
  expect(await screen.findByText(String(value), { exact: true })).toBeInTheDocument();
});

it.each([null, undefined, '', '  \n ', {}, []])(
  'hides empty top-level metadata: %j',
  async value => {
    serveMetadata(value);
    renderViewer();
    await screen.findByText('note');
    expect(screen.queryByText('Details:')).not.toBeInTheDocument();
  },
);

it('renders original object keys and nested ordered lists with explicit empty values', async () => {
  serveMetadata({ original_key: { items: ['First', 0, false, null, '', {}, []] } });
  renderViewer();
  expect(await screen.findByText('original_key', { selector: 'dt' })).toBeInTheDocument();
  expect(screen.getByText('items', { selector: 'dt' })).toBeInTheDocument();
  const items = within(screen.getByRole('list')).getAllByRole('listitem');
  ['First', '0', 'false', 'Not provided', 'Empty text', 'Empty object', 'Empty list'].forEach(
    (text, index) => {
      expect(items[index]).toHaveTextContent(text);
    },
  );
});

it('renders top-level arrays and escapes HTML-like keys and values', async () => {
  serveMetadata([{ '<script>key</script>': '<img src=x onerror=alert(1)>' }, 'Second']);
  renderViewer();
  expect(await screen.findByText('<script>key</script>', { selector: 'dt' })).toBeInTheDocument();
  expect(screen.getByText('<img src=x onerror=alert(1)>', { selector: 'dd' })).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(within(screen.getByRole('list')).getAllByRole('listitem')[1]).toHaveTextContent('Second');
});

it('preserves long multiline values without truncation', async () => {
  const value = `First line\n${'x'.repeat(2000)}\nLast line`;
  serveMetadata({ message: value });
  renderViewer();
  const details = await screen.findByText(value, { selector: 'dd', normalizer: text => text });
  expect(details).toHaveTextContent(value, { normalizeWhitespace: false });
});

it('bounds excessive nesting with a visible explanation', async () => {
  let value = 'deep value';
  for (let i = 0; i < 100; i += 1) value = { nested: value };
  serveMetadata(value);
  renderViewer();
  expect(
    await screen.findByText('Further details omitted (nesting limit reached).'),
  ).toBeInTheDocument();
  expect(screen.queryByText('deep value')).not.toBeInTheDocument();
});

it.each([false, true])('preserves navigation and the theme class (dark=%s)', async darkMode => {
  renderViewer(darkMode);
  const heading = await screen.findByRole('heading', { name: 'Test Student — Daily Log' });
  expect(heading).toBeInTheDocument();
  expect(screen.getByText('Date unavailable')).toBeInTheDocument();
  expect(httpService.get).toHaveBeenCalledWith(
    `${ENDPOINTS.APIEndpoint()}/support/daily-log/student-1`,
  );
  // The theme class belongs to the component root, not the metadata renderer.
  // eslint-disable-next-line testing-library/no-node-access
  expect(heading.closest(`.${styles.container}`).classList.contains(styles.darkMode)).toBe(
    darkMode,
  );
  const link = screen.getByRole('link', { name: /Back to students/ });
  expect(link).toHaveAttribute('href', '/support/dashboard');
});

it('shows loading, then logs even if the optional profile request fails', async () => {
  let resolveLog;
  httpService.get.mockImplementation(url => {
    if (url.includes('/daily-log/'))
      return new Promise(resolve => {
        resolveLog = resolve;
      });
    return Promise.reject(new Error('Profile unavailable'));
  });
  const { history } = renderViewer();
  expect(screen.getByText('Loading daily log…')).toBeInTheDocument();
  await act(async () => resolveLog({ data: [entry('Loaded')] }));
  expect(screen.getByRole('heading', { name: 'Student — Daily Log' })).toBeInTheDocument();
  expect(screen.queryByText('Loading daily log…')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: /Back to students/ }));
  expect(history.location.pathname).toBe('/support/dashboard');
});

it('shows the empty-log state for a successful empty response', async () => {
  httpService.get.mockResolvedValue({ data: [] });
  renderViewer();
  expect(await screen.findByText('No log entries found for this student.')).toBeInTheDocument();
});

it.each([401, 403, 500])('shows only the error state for HTTP %s', async status => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  httpService.get.mockRejectedValue({ response: { status } });
  renderViewer();
  const message =
    status === 500
      ? 'Unable to load daily log. Please try again later.'
      : 'Access denied. You are not authorized to view this log.';
  expect(await screen.findByText(message)).toBeInTheDocument();
  expect(screen.queryByText('No log entries found for this student.')).not.toBeInTheDocument();
});

it('ignores old student responses after navigation', async () => {
  let resolveOldLog;
  httpService.get.mockImplementation(url => {
    if (url.endsWith('/daily-log/student-1'))
      return new Promise(resolve => {
        resolveOldLog = resolve;
      });
    return Promise.resolve({ data: url.includes('/daily-log/') ? [entry('Current details')] : {} });
  });
  const { changeStudent } = renderViewer();
  changeStudent('student-2');
  await screen.findByText(/Current details/);
  await act(async () => resolveOldLog({ data: [entry('Stale details')] }));
  expect(screen.queryByText(/Stale details/)).not.toBeInTheDocument();
  expect(screen.getByText(/Current details/)).toBeInTheDocument();
});
