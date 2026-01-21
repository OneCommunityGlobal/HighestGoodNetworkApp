import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import OwnerMessage from '../OwnerMessage';

// Create mock for the hasPermission utility
vi.mock('utils/permissions', () => {
  return vi.fn().mockImplementation(() => () => true);
});

describe('OwnerMessage Component', () => {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  it('should render without errors', () => {
    const initialState = {
      auth: {
        user: {
          role: 'Owner',
        },
      },
      ownerMessage: {
        message: 'Sample Message',
        standardMessage: 'Sample Standard Message',
      },
      theme: {
        darkMode: false,
      },
    };

    // Create a mock store with initial state
    const store = mockStore(initialState);

    // Mock the action creators
    store.dispatch = vi.fn();

    // Render with Provider
    render(
      <Provider store={store}>
        <OwnerMessage />
      </Provider>,
    );

    // Basic assertion to check if the component rendered
    expect(screen.getByText('Sample Message')).toBeInTheDocument();
  });

  it('should display standard message when no owner message exists', () => {
    const initialState = {
      auth: {
        user: {
          role: 'Owner',
        },
      },
      ownerMessage: {
        message: null,
        standardMessage: 'Sample Standard Message',
      },
      theme: {
        darkMode: false,
      },
    };

    const store = mockStore(initialState);
    store.dispatch = vi.fn();

    render(
      <Provider store={store}>
        <OwnerMessage />
      </Provider>,
    );

    expect(screen.getByText('Sample Standard Message')).toBeInTheDocument();
  });

  it('should show edit and delete buttons for owner role', () => {
    const initialState = {
      auth: {
        user: {
          role: 'Owner',
        },
      },
      ownerMessage: {
        message: 'Sample Message',
        standardMessage: 'Sample Standard Message',
      },
      theme: {
        darkMode: false,
      },
    };

    const store = mockStore(initialState);
    store.dispatch = vi.fn();

    render(
      <Provider store={store}>
        <OwnerMessage />
      </Provider>,
    );

    expect(screen.getByTitle('Edit this header')).toBeInTheDocument();
    expect(screen.getByTitle('Click to restore header to standard message')).toBeInTheDocument();
  });
});
