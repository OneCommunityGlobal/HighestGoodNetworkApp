import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  getSummaryRecipients,
  addSummaryRecipient,
  deleteSummaryRecipient,
} from '~/actions/weeklySummariesReportRecepients';
import mockSummaries from '../__mocks__/weeklySummariesReportData';
import WeeklySummaryRecipientsPopup from '../WeeklySummaryRecepientsPopup';

// **1)** Only mock with a factory (remove the bare vi.mock(...) above)
vi.mock('~/actions/weeklySummariesReportRecepients', () => ({
  getSummaryRecipients: vi.fn().mockResolvedValue([]),
  addSummaryRecipient: vi.fn().mockResolvedValue(200),
  deleteSummaryRecipient: vi.fn().mockResolvedValue(200),
}));

vi.mock('~/components/Teams/MembersAutoComplete', () => ({
  __esModule: true,
  default: function MockMembersAutoComplete({ searchText, setSearchText, onAddUser }) {
    return (
      <input
        data-testid="members-autocomplete"
        value={searchText}
        onChange={e => {
          setSearchText(e.target.value);
          onAddUser({ _id: '2', firstName: 'Jane', lastName: 'Smith' });
        }}
      />
    );
  },
}));

vi.mock('react-toastify', () => ({
  __esModule: true,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// **2)** Use vi.importActual in an async factory for react-redux
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    __esModule: true,
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});

describe('WeeklySummaryRecipientsPopup Component', () => {
  const mockStore = configureStore([thunk]);
  let store;
  let props;

  beforeEach(() => {
    store = mockStore({
      theme: { darkMode: false },
    });

    props = {
      open: true,
      onClose: vi.fn(),
      summaries: mockSummaries,
      password: 'password123',
      authEmailWeeklySummaryRecipient: 'test@example.com',
    };

    getSummaryRecipients.mockResolvedValue([]);
    addSummaryRecipient.mockResolvedValue(200);
    deleteSummaryRecipient.mockResolvedValue(200);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal correctly when open', () => {
    render(
      <Provider store={store}>
        <WeeklySummaryRecipientsPopup
          open={props.open}
          onClose={props.onClose}
          summaries={props.summaries}
          password={props.password}
          authEmailWeeklySummaryRecipient={props.authEmailWeeklySummaryRecipient}
        />
      </Provider>,
    );

    expect(screen.getByText('Recipients of Weekly summaries')).toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', () => {
    render(
      <Provider store={store}>
        <WeeklySummaryRecipientsPopup
          open={props.open}
          onClose={props.onClose}
          summaries={props.summaries}
          password={props.password}
          authEmailWeeklySummaryRecipient={props.authEmailWeeklySummaryRecipient}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Close'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('loads and displays recipients', async () => {
    getSummaryRecipients.mockResolvedValueOnce([{ _id: '1', firstName: 'John', lastName: 'Doe' }]);

    render(
      <Provider store={store}>
        <WeeklySummaryRecipientsPopup
          open={props.open}
          onClose={props.onClose}
          summaries={props.summaries}
          password={props.password}
          authEmailWeeklySummaryRecipient={props.authEmailWeeklySummaryRecipient}
        />
      </Provider>,
    );

    await waitFor(() => {
      expect(getSummaryRecipients).toHaveBeenCalled();
    });
  });

  it('adds a recipient when Add button is clicked', async () => {
    const mockUser = { _id: '2', firstName: 'Jane', lastName: 'Smith' };
    addSummaryRecipient.mockResolvedValueOnce(200);

    render(
      <Provider store={store}>
        <WeeklySummaryRecipientsPopup
          open={props.open}
          onClose={props.onClose}
          summaries={props.summaries}
          password={props.password}
          authEmailWeeklySummaryRecipient={props.authEmailWeeklySummaryRecipient}
        />
      </Provider>,
    );
    fireEvent.change(screen.getByTestId('members-autocomplete'), {
      target: { value: 'Jane Smith' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => {
      expect(addSummaryRecipient).toHaveBeenCalledWith(mockUser._id);
    });
  });

  it('displays error when trying to add an invalid recipient', async () => {
    render(
      <Provider store={store}>
        <WeeklySummaryRecipientsPopup
          open={props.open}
          onClose={props.onClose}
          summaries={props.summaries}
          password={props.password}
          authEmailWeeklySummaryRecipient={props.authEmailWeeklySummaryRecipient}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByText('Add'));

    expect(await screen.findByText('Please choose a valid user.')).toBeInTheDocument();
  });
});
