import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import ResolvedTasks from '../ResolvedTasks';

vi.mock('axios');

const mockStore = configureMockStore([]);

const renderComponent = () => {
  const store = mockStore({
    theme: { darkMode: false },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ResolvedTasks />
      </MemoryRouter>
    </Provider>,
  );
};

describe('ResolvedTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays resolved tasks', async () => {
    axios.get.mockResolvedValue({
      data: {
        tasks: [
          {
            _id: 'log-1',
            timestamp: '2026-09-30T12:00:00.000Z',
            taskId: {
              _id: 'task-1',
              num: 123,
              taskName: 'Test resolved task',
              resources: [
                {
                  name: 'Assigned User',
                  userID: {
                    _id: 'user-1',
                    email: 'assigned@example.com',
                  },
                },
              ],
            },
            userId: {
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@example.com',
            },
          },
        ],
      },
    });

    renderComponent();

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test resolved task')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/tasks/resolved?page=1&limit=100'),
    );
    expect(screen.getByText('Assigned User')).toBeInTheDocument();
    expect(screen.getByText('assigned@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('shows empty state when no resolved tasks exist', async () => {
    axios.get.mockResolvedValue({
      data: {
        tasks: [],
      },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No resolved tasks found.')).toBeInTheDocument();
    });
  });

  it('shows an error when loading fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });
});
