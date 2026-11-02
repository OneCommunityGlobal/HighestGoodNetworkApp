import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import StudentDashboard from './StudentDashboard';
import { fetchStudentTasks } from '~/actions/studentTasks';

vi.mock('~/actions/studentTasks', () => ({
  fetchStudentTasks: vi.fn(() => ({ type: 'FETCH_STUDENT_TASKS' })),
}));

vi.mock('../StudentDashboard/TaskTimer', () => ({
  default: ({ tasks }) => (
    <div data-testid="task-timer">
      {tasks.length
        ? tasks.map(task => task.course_name || task.title).join(', ')
        : 'No assigned tasks'}
    </div>
  ),
}));

const mockStore = configureStore([thunk]);

const renderDashboard = taskItems => {
  const store = mockStore({
    theme: { darkMode: false },
    studentTasks: { taskItems },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    </Provider>,
  );
};

describe('StudentDashboard timer integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes real assigned tasks from Redux to TaskTimer and fetches them', () => {
    renderDashboard([
      { id: '65cf6c3706d8ac105827bb2e', course_name: 'Algebra', status: 'assigned' },
    ]);

    expect(screen.getByTestId('task-timer')).toHaveTextContent('Algebra');
    expect(fetchStudentTasks).toHaveBeenCalledTimes(1);
  });

  it('passes an empty assigned-task list safely to TaskTimer', () => {
    renderDashboard([]);

    expect(screen.getByTestId('task-timer')).toHaveTextContent('No assigned tasks');
  });
});
