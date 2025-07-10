// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  getSummaryRecipients,
  addSummaryRecipient,
  deleteSummaryRecipient,
} from 'actions/weeklySummariesReportRecepients';
import mockSummaries from '../__mocks__/weeklySummariesReportData';
import WeeklySummaryRecipientsPopup from '../WeeklySummaryRecepientsPopup';

jest.mock('actions/weeklySummariesReportRecepients');
jest.mock(
  'components/Teams/MembersAutoComplete',
  () =>
    function mockfn({ searchText, setSearchText, onAddUser }) {
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
);
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('actions/weeklySummariesReportRecepients', () => ({
  getSummaryRecipients: jest.fn().mockResolvedValue([]),
  addSummaryRecipient: jest.fn().mockResolvedValue(200),
  deleteSummaryRecipient: jest.fn().mockResolvedValue(200),
}));

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
      onClose: jest.fn(),
      summaries: mockSummaries,
      password: 'password123',
      authEmailWeeklySummaryRecipient: 'test@example.com',
    };

    getSummaryRecipients.mockResolvedValue([]);
    addSummaryRecipient.mockResolvedValue(200);
    deleteSummaryRecipient.mockResolvedValue(200);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
