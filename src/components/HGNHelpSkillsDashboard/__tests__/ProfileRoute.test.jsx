import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import UserCard from '../UserCard';
import UserProfilePage from '../UserProfilePage';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('axios');

const mockStore = configureMockStore([]);
const store = mockStore({ theme: { darkMode: false } });

const renderProfile = (userId = 'user-123') =>
  render(
    <MemoryRouter initialEntries={[`/hgnhelp/profile/${userId}`]}>
      <Provider store={store}>
        <Route path="/hgnhelp/profile/:userId">
          <UserProfilePage />
        </Route>
      </Provider>
    </MemoryRouter>,
  );

describe('HGN Help profile route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('links a user name with userId, not the questionnaire response _id', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <UserCard
            user={{
              _id: 'questionnaire-response-id',
              userId: 'actual-user-profile-id',
              name: 'Member One',
              score: 8,
            }}
          />
        </Provider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Member One' })).toHaveAttribute(
      'href',
      '/hgnhelp/profile/actual-user-profile-id',
    );
  });

  it('does not create a profile URL when userId is missing', () => {
    render(
      <MemoryRouter>
        <Provider store={store}>
          <UserCard
            user={{
              _id: 'questionnaire-response-id',
              name: 'Member Without Id',
              score: 8,
            }}
          />
        </Provider>
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link', { name: 'Member Without Id' })).not.toBeInTheDocument();
    expect(screen.getByText('Member Without Id')).toBeInTheDocument();
  });

  it('loads the skills profile endpoint with the route userId and renders supported data', async () => {
    axios.get.mockResolvedValue({
      data: {
        userId: 'user-123',
        name: { displayName: 'Member One' },
        teams: [{ id: 'team-1', name: 'Software Development Team', role: 'Member' }],
        skillInfo: {
          frontend: { React: '8' },
          backend: { MongoDB: '7' },
          general: { leadership_experience: 'Led a volunteer team' },
          followUp: { additional_info: 'Experienced with mentoring contributors' },
        },
      },
    });

    renderProfile();

    await screen.findByText('Member One');
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.SKILLS_PROFILE('user-123'));
    expect(screen.getByText('Software Development Team (Member)')).toBeInTheDocument();
    expect(screen.getByText(/Leadership experience: Led a volunteer team/)).toBeInTheDocument();
    expect(
      screen.getByText(/Additional experience: Experienced with mentoring contributors/),
    ).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('handles empty optional profile data safely', async () => {
    axios.get.mockResolvedValue({
      data: { name: { displayName: 'Member Without Details' }, teams: [], skillInfo: {} },
    });

    renderProfile('user-empty');

    expect(await screen.findByText('Member Without Details')).toBeInTheDocument();
    expect(screen.queryByText('Teams')).not.toBeInTheDocument();
  });

  it('renders an API error without crashing', async () => {
    axios.get.mockRejectedValue(new Error('Request failed'));

    renderProfile('user-error');

    await screen.findByText('Error: Failed to load user profile data');
  });
});
