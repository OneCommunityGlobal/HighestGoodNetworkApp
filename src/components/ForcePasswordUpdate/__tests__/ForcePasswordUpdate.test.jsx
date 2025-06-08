import { renderWithRouterMatch } from '../../../__tests__/utils.js';
import '@testing-library/jest-dom/extend-expect';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { ENDPOINTS } from '~/utils/URL';
import mockState from '../../../__tests__/mockAdminState';
import routes from '../../../routes';
import { ForcePasswordUpdate } from '../ForcePasswordUpdate';
import * as updatePasswordActions from '../../../actions/updatePassword';
import * as errorsActions from '../../../actions/errorsActions';

// Create mock functions for required actions
vi.mock('../../../actions/updatePassword.js', () => ({
  forcePasswordUpdate: vi.fn().mockImplementation(data => {
    return () => Promise.resolve(200);
  }),
}));

vi.mock('../../../actions/errorsActions.js', () => ({
  clearErrors: vi.fn().mockImplementation(() => {
    return { type: 'CLEAR_ERRORS' };
  }),
}));

// Mock any other imports that cause errors (without using the file path)
vi.mock('../../../components/OwnerMessage/OwnerMessage.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="owner-message">Mock Owner Message</div>,
}));

// Set up mock store with thunk middleware
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Create initial state
const initialState = {
  auth: {
    isAuthenticated: true,
    user: {
      userid: '5edf141c78f1380017b829a6',
      role: 'User',
    },
  },
  errors: {},
  theme: { darkMode: false },
};

// Create store with middleware
const store = mockStore(initialState);

// Mock functions for component props
const mockGetHeaderData = vi.fn();
const mockForcePasswordUpdate = vi.fn().mockResolvedValue(200);
const mockClearErrors = vi.fn();

// Helper function to render component with necessary providers
const renderComponent = (customProps = {}) => {
  const defaultProps = {
    match: { params: { userId: '5edf141c78f1380017b829a6' } },
    auth: initialState.auth,
    errors: {},
    clearErrors: mockClearErrors,
    forcePasswordUpdate: mockForcePasswordUpdate,
    getHeaderData: mockGetHeaderData,
    history: { replace: vi.fn() },
  };

  const mergedProps = { ...defaultProps, ...customProps };

  return render(
    <Provider store={store}>
      <ForcePasswordUpdate {...mergedProps} />
    </Provider>,
  );
};

// Server setup for API mocking
const url = ENDPOINTS.FORCE_PASSWORD;
const userProjectsUrl = ENDPOINTS.USER_PROJECTS(mockState.auth.user.userid);
let passwordUpdated = false;

const server = setupServer(
  // Request for a forced password update
  rest.patch(url, (req, res, ctx) => {
    passwordUpdated = true;
    if (req.body.newpassword === 'newPassword8') {
      return res(ctx.status(200), ctx.json({ message: 'Password updated successfully' }));
    }
    return res(ctx.status(400), ctx.json({ error: 'Invalid password' }));
  }),

  // Prevents errors when loading header
  rest.get(/\/api\/userprofile\/.*/, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        firstName: 'Test',
        profilePic: 'test.jpg',
      }),
    );
  }),

  rest.get(/http.*\/hash\.txt/, (req, res, ctx) => {
    return res(ctx.status(200), ctx.text('hash-content'));
  }),

  rest.get(/http.*\/timer-service/, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),

  // Handle other API calls with generic success responses
  rest.get('*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),

  rest.post('*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),

  rest.patch('*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
  passwordUpdated = false;
  store.clearActions();
});

describe('Force Password Update page structure', () => {
  it('should render with two input fields', () => {
    renderComponent();
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(newPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
  });

  it('should render with one button', () => {
    renderComponent();
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should render with one h2 labeled Change Password', () => {
    renderComponent();
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('Change Password');
  });

  it('should match the snapshot', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('When user tries to input data', () => {
  beforeEach(() => {
    renderComponent();
  });

  it('should disable submit button if form is invalid', () => {
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when valid passwords are entered', async () => {
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword8' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword8' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Wait for validation to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should call forcePasswordUpdate with correct data on submit', async () => {
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword8' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword8' } });

    // Wait for the form to be valid and the button to be enabled
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockForcePasswordUpdate).toHaveBeenCalledWith({
        userId: '5edf141c78f1380017b829a6',
        newpassword: 'newPassword8',
      });
    });
  });
});

// For the behavior tests, we'll use a different approach
describe('Force Password Update behaviour', () => {
  // For these tests, we'll use a simplified approach that doesn't rely on renderWithRouterMatch
  it('should validate password requirements', async () => {
    renderComponent();

    // Test password too short
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    // Try a short password
    fireEvent.change(newPasswordInput, { target: { value: 'Pass1' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Pass1' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();

    // Try a password with no uppercase
    fireEvent.change(newPasswordInput, { target: { value: 'password8' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password8' } });
    expect(submitButton).toBeDisabled();

    // Try a password with no number or special char
    fireEvent.change(newPasswordInput, { target: { value: 'Password' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password' } });
    expect(submitButton).toBeDisabled();
  });

  it('should validate password matching', async () => {
    renderComponent();

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    // Set different passwords
    fireEvent.change(newPasswordInput, { target: { value: 'newPassword8' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentPassword8' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('should submit successfully with valid password', async () => {
    // Create a special mock for forcePasswordUpdate that sets passwordUpdated to true
    const successfulUpdate = vi.fn().mockImplementation(() => {
      passwordUpdated = true;
      return Promise.resolve(200);
    });

    renderComponent({ forcePasswordUpdate: successfulUpdate });

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    // Set matching and valid passwords
    fireEvent.change(newPasswordInput, { target: { value: 'newPassword8' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword8' } });

    // Wait for the button to be enabled
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    // Click submit
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    // Check if the update function was called properly
    await waitFor(() => {
      expect(successfulUpdate).toHaveBeenCalledWith({
        userId: '5edf141c78f1380017b829a6',
        newpassword: 'newPassword8',
      });
      expect(passwordUpdated).toBeTruthy();
    });
  });
});
