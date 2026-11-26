import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import Register from '../Register';

vi.mock('axios');

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockPush = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useHistory: () => ({
      push: mockPush,
    }),
    useParams: () => ({
      activityId: '1',
    }),
  };
});

const mockStore = configureMockStore([]);

const renderRegister = (
  initialState = {
    theme: { darkMode: false },
    userProfile: { firstName: 'Alice', lastName: 'Wonderland' },
    auth: { user: { email: 'alice@example.com' } },
  },
) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/communityportal/activities/register/1']}>
        <Route path="/communityportal/activities/register/:activityId">
          <Register />
        </Route>
      </MemoryRouter>
    </Provider>,
  );
};

describe('Register component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.localStorage.clear();
    axios.get.mockResolvedValue({
      data: {
        id: '1',
        title: 'Community Yoga Class',
        startDate: '2026-05-10T10:00:00Z',
        capacity: 15,
        location: 'Community Center Main Hall',
        description: 'A relaxing yoga session.',
        coverImage: 'https://example.com/yoga.jpg',
      },
    });
  });

  test('renders activity details after loading', async () => {
    renderRegister();

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Community Yoga Class' }),
      ).toBeInTheDocument();
    });

    expect(screen.getAllByText('A relaxing yoga session.').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /^Register$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Attendance$/i })).toBeInTheDocument();
  });

  test('handles successful registration and displays RegistrationPopup', async () => {
    vi.useFakeTimers();
    renderRegister();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Community Yoga Class' }),
      ).toBeInTheDocument();
    });

    const registerBtn = screen.getByRole('button', { name: /^Register$/i });
    fireEvent.click(registerBtn);

    // Fast-forward registration timeout
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText('Thank you for Registering!')).toBeInTheDocument();
    expect(screen.getAllByText('Community Yoga Class').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Alice Wonderland')).toBeInTheDocument();

    vi.useRealTimers();
  });

  test('navigates to attendance page when Attendance button is clicked', async () => {
    renderRegister();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Community Yoga Class' }),
      ).toBeInTheDocument();
    });

    const attendanceBtn = screen.getByRole('button', { name: /^Attendance$/i });
    fireEvent.click(attendanceBtn);

    expect(mockPush).toHaveBeenCalledWith('/communityportal/activity/1/attendance');
  });

  test('applies dark-mode class when darkMode is enabled', async () => {
    renderRegister({
      theme: { darkMode: true },
      userProfile: {},
      auth: {},
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'Community Yoga Class' }),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId('register-page-wrapper').className).toMatch(/dark-mode/);
  });
});
