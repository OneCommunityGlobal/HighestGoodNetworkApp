import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ProjectsList from '../ProjectsList';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
}));

it('keeps the real project selector and summaries synchronized with browser history', () => {
  const projects = [
    { _id: 'alpha', name: 'Alpha', members: [] },
    { _id: 'beta', name: 'Beta', members: [] },
  ];
  const store = createStore(() => ({ bmProjects: projects, theme: { darkMode: false } }));
  const history = createMemoryHistory({ initialEntries: ['/bmdashboard?other=keep#section'] });
  render(
    <Provider store={store}>
      <Router history={history}>
        <ProjectsList />
      </Router>
    </Provider>,
  );
  expect(screen.getByText('Beta Summary')).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'ArrowDown', keyCode: 40 });
  fireEvent.click(screen.getByText('Alpha'));
  expect(screen.getByText('Alpha Summary')).toBeInTheDocument();
  expect(screen.queryByText('Beta Summary')).not.toBeInTheDocument();
  expect(new URLSearchParams(history.location.search).get('bmProject')).toBe('alpha');
  act(() => history.goBack());
  expect(screen.getByText('Beta Summary')).toBeInTheDocument();
  act(() => history.goForward());
  expect(screen.queryByText('Beta Summary')).not.toBeInTheDocument();
  expect(history.location.hash).toBe('#section');
});
