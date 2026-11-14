import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { themeMock } from '__tests__/mockStates';
import thunk from 'redux-thunk';
import mockState from '../../../__tests__/mockAdminState';
import WeeklySummaryModal from '../WeeklySummaryModal';
import { vi } from 'vitest';

// Mock WeeklySummary component
vi.mock('../WeeklySummary', () => ({
  __esModule: true,
  default: () => <div data-testid="mocked-weekly-summary">Mocked Weekly Summary</div>,
}));

// Mock actions
vi.mock('../../../actions/weeklySummaries', () => ({
  fetchWeeklySummaries: vi.fn(() => dispatch => {
    dispatch({ type: 'FETCH_WEEKLY_SUMMARIES_SUCCESS', payload: [] });
    return Promise.resolve(200);
  }),
  fetchWeeklySummariesSuccess: vi.fn(data => ({
    type: 'FETCH_WEEKLY_SUMMARIES_SUCCESS',
    payload: data,
  })),
  fetchWeeklySummariesError: vi.fn(error => ({
    type: 'FETCH_WEEKLY_SUMMARIES_ERROR',
    payload: error,
  })),
}));

const mockStore = configureMockStore([thunk]);

const renderWithProvider = (ui, options = {}) => {
  const store =
    options.store ||
    mockStore({
      auth: mockState.auth,
      userProfile: mockState.userProfile,
      timeEntries: mockState.timeEntries,
      userProjects: mockState.userProjects,
      weeklySummaries: mockState.weeklySummaries,
      role: mockState.role,
      theme: themeMock,
    });

  return render(<Provider store={store}>{ui}</Provider>);
};

describe('WeeklySummaryModal Component', () => {
  let modalRoot;

  beforeEach(() => {
    vi.clearAllMocks();
    // Programmatically add modal root for portal rendering
    modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    // Clean up modal root
    modalRoot.remove();
  });

  it('should render the component without errors', () => {
    renderWithProvider(<WeeklySummaryModal />);
    expect(screen.getByTestId('mocked-weekly-summary')).toBeInTheDocument();
  });

  it('toggles the modal with mouse, Enter, and Space', async () => {
    renderWithProvider(<WeeklySummaryModal />);

    const toggleControl = screen.getByRole('button', { name: 'Toggle Weekly Summary' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(toggleControl);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(toggleControl, { key: 'Enter' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireEvent.keyDown(toggleControl, { key: ' ' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it.each([
    ['Meta+Shift+4', { key: '4', metaKey: true, shiftKey: true }],
    ['Control+Shift+4', { key: '4', ctrlKey: true, shiftKey: true }],
    ['ArrowDown', { key: 'ArrowDown' }],
  ])('does not toggle the modal for %s', (_, keyboardEvent) => {
    renderWithProvider(<WeeklySummaryModal />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Toggle Weekly Summary' }), keyboardEvent);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
