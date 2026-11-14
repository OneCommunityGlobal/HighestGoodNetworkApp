import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ProjectsList from '../ProjectsList';
import { exportProjectSummaries } from '../exportProjectSummaries';

vi.mock('../exportProjectSummaries', () => ({ exportProjectSummaries: vi.fn() }));
vi.mock('react-select', () => ({
  default: () => <div>Select projects</div>,
}));
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
}));

const projects = [
  { _id: 'alpha', name: 'Alpha', members: [{}] },
  { _id: 'beta', name: 'Beta', members: [{}, {}] },
];

function setup(search = '') {
  const history = createMemoryHistory({ initialEntries: [`/bmdashboard${search}#section`] });
  const store = createStore(() => ({ bmProjects: projects, theme: { darkMode: true } }));
  render(
    <Provider store={store}>
      <Router history={history}>
        <ProjectsList />
      </Router>
    </Provider>,
  );
  return history;
}

describe('project summary export controls', () => {
  beforeEach(() => {
    exportProjectSummaries.mockReset();
    exportProjectSummaries.mockResolvedValue();
  });

  it('exports only the selected project and preserves the URL', async () => {
    const history = setup('?bmProject=beta&statusStartDate=2024-01-01');
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    await screen.findByText('PDF export created; download started.');
    const options = exportProjectSummaries.mock.calls[0][0];
    expect(options.format).toBe('pdf');
    expect(options.summaries).toHaveLength(1);
    expect(options.summaries[0]).toHaveAttribute('aria-label', 'Beta Summary');
    expect(options.summaries[0]).toHaveTextContent('N/A');
    expect(options.selectionContext).toBe('Selected project summaries: 1');
    expect(history.location.search).toBe('?bmProject=beta&statusStartDate=2024-01-01');
    expect(history.location.hash).toBe('#section');
  });

  it('exports all currently displayed projects to PNG', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));
    await screen.findByText('PNG export created; download started.');
    const options = exportProjectSummaries.mock.calls[0][0];
    expect(options.format).toBe('png');
    expect(options.summaries).toHaveLength(2);
    expect(options.selectionContext).toBe('All displayed project summaries: 2');
  });

  it('exports multiple selected projects and identifies unavailable selections', async () => {
    setup('?bmProject=alpha&bmProject=beta&bmProject=missing');
    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));
    await screen.findByText('PNG export created; download started.');
    const options = exportProjectSummaries.mock.calls[0][0];
    expect(options.summaries.map(item => item.getAttribute('aria-label'))).toEqual([
      'Alpha Summary',
      'Beta Summary',
    ]);
    expect(options.selectionContext).toBe(
      'Selected project summaries: 2 (unavailable selections omitted)',
    );
  });

  it('disables both formats while an export is in progress', async () => {
    let finish;
    exportProjectSummaries.mockReturnValue(
      new Promise(resolve => {
        finish = resolve;
      }),
    );
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(screen.getByText('Preparing PDF export...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export PNG' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Export PNG' }));
    expect(exportProjectSummaries).toHaveBeenCalledTimes(1);
    finish();
    await screen.findByText('PDF export created; download started.');
    expect(screen.getByRole('button', { name: 'Export PNG' })).toBeEnabled();
  });

  it('disables export for an invalid selection', () => {
    setup('?bmProject=invalid');
    expect(screen.getByRole('button', { name: 'Export PDF' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export PNG' })).toBeDisabled();
    expect(exportProjectSummaries).not.toHaveBeenCalled();
  });

  it('reports failures and re-enables actions', async () => {
    exportProjectSummaries.mockRejectedValue(new Error('capture failed'));
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('capture failed');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Export PDF' })).toBeEnabled());
    expect(screen.getByText('Alpha Summary')).toBeInTheDocument();
  });
});
