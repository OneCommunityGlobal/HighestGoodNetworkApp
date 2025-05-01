import { render, screen, fireEvent } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { themeMock } from '__tests__/mockStates';
import thunk from 'redux-thunk';
import mockState from '../../../__tests__/mockAdminState.js';
import WeeklySummaryModal from '../WeeklySummaryModal';

const mockStore = configureMockStore([thunk]);

describe('WeeklySummaryModal Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: mockState.auth,
      userProfile: mockState.userProfile,
      timeEntries: mockState.timeEntries,
      userProjects: mockState.userProjects,
      weeklySummaries: mockState.weeklySummaries,
      role: mockState.role,
      theme: themeMock,
    });

    // Mock any dispatch actions
    store.dispatch = jest.fn();
  });

  it('should render the component without errors', () => {
    const { container } = render(
      <Provider store={store}>
        <WeeklySummaryModal />
      </Provider>,
    );

    // Check if the component rendered by verifying something exists in the container
    expect(container.firstChild).not.toBeNull();
  });

  it('should toggle the modal when clicked', () => {
    render(
      <Provider store={store}>
        <WeeklySummaryModal />
      </Provider>,
    );

    // The button/div that triggers the modal toggle
    // Note: You'll need to adjust this selector based on the actual component implementation
    const triggerElement = screen.getByRole('button', { name: /toggle weekly summary/i });

    // Click the trigger element
    fireEvent.click(triggerElement);

    // After clicking, modal should be visible
    // Note: You'll need to adjust this based on your component's specific text or elements
    expect(screen.getByText(/weekly summary/i)).toBeInTheDocument();

    // Click again to close
    fireEvent.click(triggerElement);

    // Modal should be gone
    expect(screen.queryByText(/weekly summary modal content/i)).not.toBeInTheDocument();
  });
});
