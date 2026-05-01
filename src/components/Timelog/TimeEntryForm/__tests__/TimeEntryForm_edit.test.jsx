import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import thunk from 'redux-thunk';
import { configureStore } from 'redux-mock-store';
import {
  authMock,
  userProfileMock,
  timeEntryMock,
  userProjectMock,
  rolesMock,
} from '../../../../__tests__/mockStates';
import { renderWithProvider } from '../../../../__tests__/utils';
import TimeEntryForm from '../TimeEntryForm';

vi.mock('../../../../actions/timeEntries', async () => {
  const actual = await vi.importActual('../../../../actions/timeEntries');
  return {
    __esModule: true,
    ...actual,
    editTimeEntry: vi.fn(() => ({ type: 'MOCK_EDIT_TIME_ENTRY' })),
  };
});

vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    __esModule: true,
    ...actual,
    get: vi.fn(url => {
      if (url.includes('/userProjects')) {
        return Promise.resolve({ data: userProjectMock.projects });
      }
      if (url.includes('/tasks')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/userProfile')) {
        return Promise.resolve({ data: userProfileMock });
      }
      return Promise.resolve({ data: [] });
    }),
  };
});

const mockStore = configureStore([thunk]);

describe('<TimeEntryForm edit/>', () => {
  let store;
  let toggle;
  const data = timeEntryMock.weeks[0][0];

  beforeEach(() => {
    vi.clearAllMocks();
    toggle = vi.fn();
    store = mockStore({
      auth: authMock,
      userProjects: {
        ...userProjectMock,
        projects: Array.isArray(userProjectMock.projects) ? userProjectMock.projects : [],
      },
      userProfile: userProfileMock,
      role: rolesMock,
      theme: { darkMode: false },
    });
    store.dispatch = vi.fn();
  });

  const renderComponent = () => {
    renderWithProvider(
      <TimeEntryForm userId={data.personId} data={data} edit toggle={toggle} isOpen />,
      { store }
    );
  };

  it('should render TimeEntryForm without crashing', () => {
    renderComponent();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
  });

  it('should render with the correct placeholder first', () => {
    renderComponent();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(parseInt(data.hours, 10));
    expect(screen.getAllByRole('spinbutton')[1]).toHaveValue(parseInt(data.minutes, 10));
    expect(screen.getByLabelText('Date')).toHaveValue(data.dateOfWork);
  });

  it('should clear the form once the user clicks the `clear form` button', async () => {
    renderComponent();
    await screen.findByRole('option', { name: 'Select Project/Task' });
    await userEvent.click(screen.getByRole('button', { name: /clear form/i }));
    expect(screen.getByLabelText('Date')).toHaveValue(data.dateOfWork);
    expect(screen.getByRole('combobox')).toHaveValue('defaultProject');
    expect(screen.getByRole('combobox')).toHaveDisplayValue('Select Project/Task');
  });

  it('should change Notes with user input', async () => {
    renderComponent();
    const notes = screen.getByLabelText(/notes/i);
    fireEvent.change(notes, { target: { value: 'this is a test' } });
    expect(notes).toHaveValue('this is a test');
  });

  it('should change Tengible with user input', async () => {
    renderComponent();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    if (!checkbox.disabled) {
      await userEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    } else {
      expect(checkbox).toBeDisabled();
    }
  });

  it('should dispatch action when click Save', async () => {
    renderComponent();
    const save = screen.getByRole('button', { name: /save/i });
    await userEvent.click(save);
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalled();
    });
  });
});