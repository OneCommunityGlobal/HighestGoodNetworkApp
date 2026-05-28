import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import OwnerMessage from '../OwnerMessage';

// Create mock for the hasPermission utility
vi.mock('utils/permissions', () => {
  return vi.fn().mockImplementation(() => () => true);
});

describe('OwnerMessage Component', () => {
  const middlewares = [thunk];
  const mockStore = configureStore(middlewares);
  const baseState = {
    auth: {
      user: {
        role: 'Owner',
      },
    },
    ownerMessage: {
      message: 'Sample Message',
      standardMessage: 'Sample Standard Message',
      history: {
        data: [],
        pagination: {
          page: 1,
          totalPages: 1,
        },
      },
    },
    theme: {
      darkMode: false,
    },
  };

  function renderComponent(initialState = baseState) {
    const store = mockStore(initialState);
    store.dispatch = vi.fn();

    render(
      <Provider store={store}>
        <OwnerMessage />
      </Provider>,
    );

    return store;
  }

  it('should render without errors', () => {
    renderComponent();

    expect(screen.getByText('Sample Message')).toBeInTheDocument();
  });

  it('should display standard message when no owner message exists', () => {
    renderComponent({
      ...baseState,
      ownerMessage: {
        ...baseState.ownerMessage,
        message: null,
      },
    });

    expect(screen.getByText('Sample Standard Message')).toBeInTheDocument();
  });

  it('should show edit and delete buttons for owner role', () => {
    renderComponent();

    expect(screen.getByTitle('Edit this header')).toBeInTheDocument();
    expect(screen.getByTitle('Click to restore header to standard message')).toBeInTheDocument();
  });

  it('hides the image upload controls after a photo is selected', async () => {
    const originalFileReader = global.FileReader;

    class MockFileReader {
      onloadend = null;

      readAsDataURL() {
        this.result = 'data:image/png;base64,mock-image-payload';
        queueMicrotask(() => {
          this.onloadend?.();
        });
      }
    }

    global.FileReader = MockFileReader;

    renderComponent();

    fireEvent.click(screen.getByLabelText('Edit header message'));
    expect(screen.getByText('Or upload a picture:')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Choose owner message image'), {
      target: {
        files: [new File(['mock'], 'owner-message.png', { type: 'image/png' })],
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Or upload a picture:')).not.toBeInTheDocument();
    });

    expect(screen.queryByLabelText('Choose owner message image')).not.toBeInTheDocument();

    global.FileReader = originalFileReader;
  });
});
