import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { ENDPOINTS } from '../../../utils/URL';
import { ForcePasswordUpdate } from '../ForcePasswordUpdate';
import routes from '../../../routes';
import { renderWithRouterMatch } from '../../../__tests__/utils';
import mockState from '../../../__tests__/mockAdminState';
import '@testing-library/jest-dom/extend-expect';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mockClearErrors = jest.fn();

let passwordUpdated = false;

// Setup Mock Service Worker server
const server = setupServer(
  // PATCH request to update password
  rest.patch(ENDPOINTS.FORCE_PASSWORD, (req, res, ctx) => {
    passwordUpdated = true;
    return res(ctx.status(200), ctx.json({ message: 'Password updated successfully' }));
  }),

  // GET user profile
  rest.get('http://localhost:4500/api/userprofile/:userId', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: req.params.userId, name: 'Test User' }));
  }),

  // GET timer service
  rest.get('http://localhost:4500/timer-service', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ running: false }));
  }),

  // GET notifications unread
  rest.get('http://localhost:4500/api/notification/unread/user/:userId', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([])); // returning empty unread notifications
  }),

  // Mock dashboard fetch
  rest.get('http://localhost:4500/api/dashboard/*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([]));
  }),

  // Catch all unmatched requests
  rest.get('*', (req, res, ctx) => {
    console.error(`Unhandled request: ${req.url.toString()}`);
    return res(ctx.status(500), ctx.json({ error: 'Unhandled request' }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  passwordUpdated = false;
});
afterAll(() => server.close());

describe('ForcePasswordUpdate tests', () => {
  let store;
  const userId = '5edf141c78f1380017b829a6';

  beforeEach(() => {
    store = mockStore({
      auth: { user: { userid: userId }, isAuthenticated: true },
      theme: { darkMode: false },
      errors: {},
    });
  });

  it('should render the page and match snapshot', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <ForcePasswordUpdate
          auth={{ isAuthenticated: true }}
          errors={{}}
          clearErrors={mockClearErrors}
          match={{ params: { userId } }}
        />
      </Provider>,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('should disable submit button if form is invalid', () => {
    render(
      <Provider store={store}>
        <ForcePasswordUpdate
          auth={{ isAuthenticated: true }}
          errors={{}}
          clearErrors={mockClearErrors}
          match={{ params: { userId } }}
        />
      </Provider>,
    );
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show error if password requirements are not met', async () => {
    renderWithRouterMatch(routes, {
      initialState: mockState,
      route: `/forcePasswordUpdate/${userId}`,
    });

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'short' } });
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  it('should show error if passwords do not match', async () => {
    renderWithRouterMatch(routes, {
      initialState: mockState,
      route: `/forcePasswordUpdate/${userId}`,
    });

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'NewPassword8' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Mismatch8' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/must match new password/i)).toBeInTheDocument();
    });
  });

  it('should submit successfully if passwords match and requirements are met', async () => {
    renderWithRouterMatch(routes, {
      initialState: mockState,
      route: `/forcePasswordUpdate/${userId}`,
    });

    fireEvent.change(screen.getByLabelText(/new password/i), { target: { value: 'NewPassword8' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'NewPassword8' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(passwordUpdated).toBeTruthy();
      expect(screen.getByText(/you will now be directed to the login page/i)).toBeInTheDocument();
    });
  });
});
