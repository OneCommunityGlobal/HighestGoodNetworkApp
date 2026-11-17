import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import axios from 'axios';
import Page1 from '../Page1';
import HGNFormReducer from '~/reducers/hgnFormReducers';
import { allUserProfilesBasicInfoReducer } from '~/reducers/allUserProfilesBasicInfoReducer';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');

const mockUser = {
  userid: 'user-123',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  role: 'Volunteer',
};

const buildStore = () =>
  createStore(
    combineReducers({
      theme: (state = { darkMode: false }) => state,
      auth: (state = { user: mockUser }) => state,
      allUserProfilesBasicInfo: allUserProfilesBasicInfoReducer,
      hgnForm: HGNFormReducer,
    }),
    applyMiddleware(thunk),
  );

const renderPage1 = () =>
  render(
    <MemoryRouter>
      <Provider store={buildStore()}>
        <Page1 />
      </Provider>
    </MemoryRouter>,
  );

describe('Page1 basic info loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the questionnaire once basic info resolves successfully', async () => {
    axios.get.mockResolvedValueOnce({
      data: { _id: 'user-123', firstName: 'Ada', lastName: 'Lovelace' },
    });

    renderPage1();

    expect(await screen.findByRole('textbox', { name: /^Name/i })).toHaveValue('Ada Lovelace');
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE_BASIC_INFO_BY_ID('user-123'));
  });

  it('does not stay on the loading spinner when the basic info request is rejected (400)', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 400, data: { error: 'Source parameter is required' } },
    });

    renderPage1();

    expect(await screen.findByRole('textbox', { name: /^Name/i })).toBeInTheDocument();
  });
});
