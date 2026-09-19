import axios from 'axios';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import HelpModal from './HelpModal';

function HelpModalHarness({ userRole, show }) {
  const store = configureStore([])({
    auth: { user: { userid: 'user1', role: userRole } },
    theme: { darkMode: false },
  });
  return (
    <Provider store={store}>
      <HelpModal show={show} onHide={() => {}} />
    </Provider>
  );
}

vi.mock('axios');

const mockStore = configureStore([]);

const setup = role => {
  const store = mockStore({
    auth: { user: { userid: 'user1', role } },
    theme: { darkMode: false },
  });

  return render(
    <Provider store={store}>
      <HelpModal show onHide={() => {}} />
    </Provider>,
  );
};

describe('HelpModal access control', () => {
  beforeEach(() => {
    axios.get.mockImplementation(url => {
      if (url.includes('help-categories')) {
        return Promise.resolve({ data: [{ name: 'Bug Report' }] });
      }
      if (url.includes('userprofile')) {
        return Promise.resolve({ data: { teams: [] } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each(['Administrator', 'Owner', 'Core Team'])(
    'enables the Submit button for %s role even without Software Development Team membership',
    async role => {
      setup(role);

      await waitFor(() => expect(screen.queryByText('Loading categories...')).toBeNull());

      expect(
        screen.queryByText(/Only members of the Software Development Team/),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Select an option'));
      fireEvent.click(screen.getByText('Bug Report'));

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    },
  );

  it('keeps the Submit button disabled and shows the warning for a role outside the allow-list', async () => {
    setup('Volunteer');

    await waitFor(() => expect(screen.queryByText('Loading categories...')).toBeNull());

    expect(screen.getByText(/Only members of the Software Development Team/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(screen.getByText('Bug Report'));

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables access for a Volunteer who belongs to the Software Development Team', async () => {
    axios.get.mockImplementation(url => {
      if (url.includes('help-categories')) {
        return Promise.resolve({ data: [{ name: 'Bug Report' }] });
      }
      if (url.includes('userprofile')) {
        return Promise.resolve({ data: { teams: [{ teamName: 'Software Development Team' }] } });
      }
      return Promise.resolve({ data: {} });
    });

    setup('Volunteer');

    await waitFor(() => expect(screen.queryByText('Loading categories...')).toBeNull());

    expect(
      screen.queryByText(/Only members of the Software Development Team/),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(screen.getByText('Bug Report'));

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('picks up newly-added Software Development Team membership when the modal is reopened, without a full remount', async () => {
    axios.get.mockImplementation(url => {
      if (url.includes('help-categories')) {
        return Promise.resolve({ data: [{ name: 'Bug Report' }] });
      }
      if (url.includes('userprofile')) {
        return Promise.resolve({ data: { teams: [] } });
      }
      return Promise.resolve({ data: {} });
    });

    const { rerender } = render(<HelpModalHarness userRole="Volunteer" show />);

    await waitFor(() => expect(screen.queryByText('Loading categories...')).toBeNull());
    expect(screen.getByText(/Only members of the Software Development Team/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();

    // User joins the Software Development Team elsewhere, then closes and
    // reopens this same (still-mounted) modal instance.
    axios.get.mockImplementation(url => {
      if (url.includes('help-categories')) {
        return Promise.resolve({ data: [{ name: 'Bug Report' }] });
      }
      if (url.includes('userprofile')) {
        return Promise.resolve({ data: { teams: [{ teamName: 'Software Development Team' }] } });
      }
      return Promise.resolve({ data: {} });
    });

    rerender(<HelpModalHarness userRole="Volunteer" show={false} />);
    rerender(<HelpModalHarness userRole="Volunteer" show />);

    await waitFor(() =>
      expect(
        screen.queryByText(/Only members of the Software Development Team/),
      ).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('Select an option'));
    fireEvent.click(screen.getByText('Bug Report'));

    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
  });
});
