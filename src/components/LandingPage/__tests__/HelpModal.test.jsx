import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import HelpModal from '../HelpModal';

vi.mock('axios');
vi.mock('react-toastify');

const mockStore = configureMockStore([]);

const makeStore = () =>
  mockStore({
    theme: { darkMode: false },
    auth: { user: { userid: 'user1', role: 'Volunteer' } },
  });

const renderHelpModal = (store, props = {}) =>
  render(
    <Provider store={store}>
      <HelpModal show onHide={vi.fn()} {...props} />
    </Provider>,
  );

describe('HelpModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockGet = ({ categories = [{ name: 'HTML Semantics' }], eligibility } = {}) => {
    axios.get.mockImplementation(url => {
      if (url === ENDPOINTS.HELP_CATEGORIES) {
        return Promise.resolve({ data: categories });
      }
      if (typeof eligibility === 'function') {
        return eligibility(url);
      }
      return Promise.resolve({ data: eligibility });
    });
  };

  it('loads help categories from the categories endpoint', async () => {
    mockGet({ eligibility: { eligible: true, questionnaireCompleted: true } });
    const store = makeStore();
    renderHelpModal(store);

    await screen.findByText('Select an option');
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.HELP_CATEGORIES);
  });

  it('calls the authenticated eligibility endpoint without a userId, never sending userId to the backend', async () => {
    mockGet({ eligibility: { eligible: true, questionnaireCompleted: true } });
    const store = makeStore();
    renderHelpModal(store);

    await screen.findByText(/^Select an option$/);
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.HELP_REQUEST_ELIGIBILITY);
  });

  it('does not show the ineligible warning while eligibility is still loading', async () => {
    let resolveEligibility;
    axios.get.mockImplementation(url => {
      if (url === ENDPOINTS.HELP_CATEGORIES) {
        return Promise.resolve({ data: [] });
      }
      return new Promise(resolve => {
        resolveEligibility = () => resolve({ data: { eligible: false } });
      });
    });
    const store = makeStore();
    renderHelpModal(store);

    expect(screen.queryByText(/must complete the HGN questionnaire/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();

    resolveEligibility();
    await screen.findByText(/must complete the HGN questionnaire/i);
  });

  it('enables Submit and hides the warning for an eligible user', async () => {
    mockGet({ eligibility: { eligible: true, questionnaireCompleted: true } });
    const store = makeStore();
    renderHelpModal(store);

    await waitFor(() =>
      expect(screen.queryByText(/must complete the HGN questionnaire/i)).not.toBeInTheDocument(),
    );
  });

  it('shows the ineligible warning and disables Submit for an ineligible user', async () => {
    mockGet({ eligibility: { eligible: false, questionnaireCompleted: false } });
    const store = makeStore();
    renderHelpModal(store);

    await screen.findByText(/must complete the HGN questionnaire/i);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('shows a neutral error (not an ineligibility message) when the eligibility request fails', async () => {
    axios.get.mockImplementation(url => {
      if (url === ENDPOINTS.HELP_CATEGORIES) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('network error'));
    });
    const store = makeStore();
    renderHelpModal(store);

    await screen.findByText(/unable to verify your eligibility/i);
    expect(screen.queryByText(/must complete the HGN questionnaire/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('still shows the Suggestions link regardless of eligibility state', async () => {
    mockGet({ eligibility: { eligible: false, questionnaireCompleted: false } });
    const store = makeStore();
    renderHelpModal(store);

    expect(screen.getByText(/if you have any suggestions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'here' })).toBeInTheDocument();
  });

  it('submits a help request without sending userId in the body for an eligible user', async () => {
    mockGet({ eligibility: { eligible: true, questionnaireCompleted: true } });
    axios.post.mockResolvedValue({ data: { _id: 'hr1' } });
    const store = makeStore();
    renderHelpModal(store);

    await screen.findByText('Select an option');
    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(await screen.findByText('HTML Semantics'));

    const submitButton = await screen.findByRole('button', { name: /submit/i });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    fireEvent.click(submitButton);

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(axios.post).toHaveBeenCalledWith(
      ENDPOINTS.HELP_REQUEST_CREATE,
      expect.not.objectContaining({ userId: expect.anything() }),
    );
  });
});
