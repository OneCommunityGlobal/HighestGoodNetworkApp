import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';
import HelpModal from '../HelpModal';
import styles from '../HelpModal.module.css';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockStore = configureMockStore([]);

const makeStore = (darkMode = false) =>
  mockStore({
    theme: { darkMode },
    auth: { user: { userid: 'user1', role: 'Volunteer' } },
  });

const renderHelpModal = (store, props = {}) => {
  const history = createMemoryHistory();

  const view = render(
    <Provider store={store}>
      <Router history={history}>
        <HelpModal show onHide={vi.fn()} {...props} />
      </Router>
    </Provider>,
  );

  return { ...view, history };
};

describe('HelpModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    axios.get.mockResolvedValue({
      data: [{ name: 'HTML Semantics' }],
    });
  });

  it('loads help categories from the categories endpoint', async () => {
    renderHelpModal(makeStore());

    await screen.findByText('Select an option');

    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.HELP_CATEGORIES);
  });

  it('displays categories returned by the API', async () => {
    axios.get.mockResolvedValue({
      data: [{ name: 'HTML Semantics' }, { name: 'Software Support' }],
    });

    renderHelpModal(makeStore());

    fireEvent.click(await screen.findByText('Select an option'));

    expect(await screen.findByRole('option', { name: 'HTML Semantics' })).toBeInTheDocument();

    expect(screen.getByRole('option', { name: 'Software Support' })).toBeInTheDocument();
  });

  it('uses fallback skill options when the API returns an empty list', async () => {
    axios.get.mockResolvedValue({ data: [] });

    renderHelpModal(makeStore());

    await screen.findByText('Select an option');

    fireEvent.click(screen.getByText('Select an option'));

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('uses fallback skill options and displays an error when category loading fails', async () => {
    axios.get.mockRejectedValue(new Error('Request failed'));

    renderHelpModal(makeStore());

    expect(
      await screen.findByText(
        'Failed to load help categories from the server. Showing questionnaire skills instead.',
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Select an option'));

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('displays a loading message while categories are being fetched', () => {
    axios.get.mockReturnValue(new Promise(() => {}));

    renderHelpModal(makeStore());

    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('allows the user to select a help category', async () => {
    renderHelpModal(makeStore());

    fireEvent.click(await screen.findByText('Select an option'));

    fireEvent.click(await screen.findByRole('option', { name: 'HTML Semantics' }));

    expect(screen.getByText('HTML Semantics')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  it('keeps Submit disabled until a category is selected', async () => {
    renderHelpModal(makeStore());

    await screen.findByText('Select an option');

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('submits a help request with the selected category', async () => {
    axios.post.mockResolvedValue({
      data: { _id: 'hr1' },
    });

    const { history } = renderHelpModal(makeStore());

    fireEvent.click(await screen.findByText('Select an option'));

    fireEvent.click(await screen.findByRole('option', { name: 'HTML Semantics' }));

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.HELP_REQUEST_CREATE, {
        topic: 'HTML Semantics',
        description: 'Help request for: HTML Semantics',
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Help request submitted successfully!');
    });

    expect(history.location.pathname).toBe('/hgnhelp/community');

    expect(history.location.state).toEqual({
      initialSkills: [],
      softwareDevTeamOnly: true,
      helpTopic: 'HTML Semantics',
    });
  });

  it('does not submit a help request when no category is selected', async () => {
    renderHelpModal(makeStore());

    await screen.findByText('Select an option');

    expect(axios.post).not.toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('displays a network error when the server cannot be reached', async () => {
    axios.post.mockRejectedValue({
      code: 'ERR_NETWORK',
    });

    renderHelpModal(makeStore());

    fireEvent.click(await screen.findByText('Select an option'));

    fireEvent.click(await screen.findByRole('option', { name: 'HTML Semantics' }));

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Cannot connect to server. Please ensure the backend is running.',
      );
    });
  });

  it('displays the backend error message when submission fails', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: {
          message: 'Please complete the HGN Skills Questionnaire before submitting a help request.',
        },
      },
    });

    renderHelpModal(makeStore());

    fireEvent.click(await screen.findByText('Select an option'));

    fireEvent.click(await screen.findByRole('option', { name: 'HTML Semantics' }));

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Please complete the HGN Skills Questionnaire before submitting a help request.',
      );
    });
  });

  it('shows the Suggestions link', async () => {
    renderHelpModal(makeStore());

    expect(await screen.findByRole('button', { name: 'here' })).toBeInTheDocument();
  });

  it('opens the suggestions modal flag and closes HelpModal when Suggestions is clicked', async () => {
    const onHide = vi.fn();

    renderHelpModal(makeStore(), { onHide });

    fireEvent.click(await screen.findByRole('button', { name: 'here' }));

    expect(localStorage.getItem('openSuggestionsModal')).toBe('true');

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('applies dark mode styles when dark mode is enabled', async () => {
    renderHelpModal(makeStore(true));

    const suggestionsLink = await screen.findByRole('button', {
      name: 'here',
    });

    expect(suggestionsLink).toHaveClass(styles.suggestionsLink, styles.suggestionsLinkDark);
  });

  it('disables Submit while a help request is being submitted', async () => {
    let resolvePost;

    axios.post.mockReturnValue(
      new Promise(resolve => {
        resolvePost = resolve;
      }),
    );

    renderHelpModal(makeStore());

    // Wait for categories to load.
    await screen.findByText('Select an option');

    // Open the dropdown and select a category.
    fireEvent.click(screen.getByText('Select an option'));

    fireEvent.click(await screen.findByRole('option', { name: 'HTML Semantics' }));

    // Verify Submit is enabled after selecting a category.
    const submitButton = screen.getByRole('button', {
      name: 'Submit',
    });

    expect(submitButton).toBeEnabled();

    // Submit the help request.
    fireEvent.click(submitButton);

    // Verify the submitting state.
    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();

    // Resolve the pending API request.
    resolvePost({ data: { _id: 'hr1' } });

    // After success, the selected category is cleared,
    // so Submit should become disabled again.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    });

    expect(toast.success).toHaveBeenCalledWith('Help request submitted successfully!');
  });
});
