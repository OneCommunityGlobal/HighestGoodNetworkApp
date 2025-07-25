// Mock axios BEFORE it gets imported by other modules
vi.mock('axios', () => {
  const mockAxios = {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    put: vi.fn(() => Promise.resolve({ data: {} })),
    delete: vi.fn(() => Promise.resolve({ data: {} })),
    defaults: {
      headers: {
        common: {},
        post: {},
        get: {},
        put: {},
        delete: {},
      },
    },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return {
    default: mockAxios,
  };
});
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { default as configureMockStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setupServer } from 'msw/node';
// eslint-disable-next-line import/named
import { rest } from 'msw';
import ReportsPage from '../Reports';

// Set up MSW to intercept network requests
const server = setupServer(
  rest.get('http://localhost:4500/api/userProfile/basicInfo', (req, res, ctx) => {
    return res(ctx.json({ userProfilesBasicInfo: [] }));
  }),
  rest.get('http://localhost:4500/api/projects', (req, res, ctx) => {
    return res(ctx.json({ projects: [] }));
  }),
  rest.get('http://localhost:4500/api/teams', (req, res, ctx) => {
    return res(ctx.json({ allTeams: [] }));
  }),
  rest.get('http://localhost:4500/api/infoCollection', (req, res, ctx) => {
    return res(ctx.json({ infoCollections: [] }));
  }),
  rest.get('*', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({}));
  }),
);

// Setup and teardown for the MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('<ReportsPage/>', () => {
  // Create mock store with middleware
  const middlewares = [thunk];
  const mockStore = configureMockStore([]);

  it('should render without errors', () => {
    // Create a complete store with the required state structure
    const initialState = {
      theme: { darkMode: false },
      userProfile: { role: 'User' },
      auth: { user: { role: 'User' } },
      allProjects: { projects: [] },
      allTeamsData: { allTeams: [] },
      allUserProfilesBasicInfo: { userProfilesBasicInfo: [] },
      infoCollections: { infoCollections: [] },
    };

    const store = mockStore(initialState);

    // Mock the store dispatch to return plain objects for async actions
    store.dispatch = vi.fn().mockImplementation(() => ({ type: 'MOCKED_ACTION' }));

    const { container } = render(
      <Provider store={store}>
        <ReportsPage />
      </Provider>,
    );

    expect(container).toBeTruthy();
  });
});
