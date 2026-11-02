import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { vi } from 'vitest';
import { toast } from 'react-toastify';
import DisplayBox from '../DisplayBox';
import { getPromotionPending, postPromotionEligibility } from '../../../actions/promotionActions';

vi.mock('../../../actions/promotionActions', () => ({
  getPromotionPending: vi.fn(),
  postPromotionEligibility: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockStore = configureMockStore([]);

const SAMPLE_PENDING = [
  {
    reviewerId: '637af0c0fb9bbc1e308cff01',
    prReviewer: 'Akshay Jayaram',
    teamCode: 'ABC12',
    teamLeaderName: 'Chris Martinez',
    weeklyPRs: [
      { week: '2026-W31', count: 7 },
      { week: '2026-W32', count: 7 },
    ],
  },
  {
    reviewerId: '637af0c0fb9bbc1e308cff02',
    prReviewer: 'Ghazi1212',
    teamCode: '456',
    teamLeaderName: 'Sam Patel',
    weeklyPRs: [
      { week: '2026-W31', count: 2 },
      { week: '2026-W32', count: 10 },
      { week: '2026-W33', count: 11 },
    ],
  },
];

function renderDisplayBox(darkMode = false) {
  const onClose = vi.fn();
  const store = mockStore({
    auth: { user: { userid: 'aaaaaaaaaaaaaaaaaaaaaaaa', role: 'Administrator' } },
    theme: { darkMode },
  });

  const view = render(
    <Provider store={store}>
      <DisplayBox onClose={onClose} darkMode={darkMode} />
    </Provider>,
  );

  return { onClose, unmount: view.unmount };
}

describe('DisplayBox promotion confirmation modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPromotionPending.mockResolvedValue(SAMPLE_PENDING);
    postPromotionEligibility.mockResolvedValue({ message: 'Members promoted successfully.' });
  });

  it('loads pending reviewers and selects every checkbox by default', async () => {
    renderDisplayBox();

    expect(await screen.findByText('Akshay Jayaram')).toBeInTheDocument();
    expect(screen.getByText('Ghazi1212')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });

    expect(getPromotionPending).toHaveBeenCalledWith({
      requestorId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
      role: 'Administrator',
    });
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  it('uses Team Leader Name and Weekly PRs column titles', async () => {
    renderDisplayBox();

    await screen.findByText('Akshay Jayaram');

    expect(screen.getByText('Team Leader Name')).toBeInTheDocument();
    expect(screen.queryByText('Team Reviewer Name')).not.toBeInTheDocument();
    expect(screen.getByText('Weekly PRs')).toBeInTheDocument();
    expect(screen.queryByText('Weekly PR Counts')).not.toBeInTheDocument();
  });

  it('shows team leader names and weekly PR counts in circles', async () => {
    renderDisplayBox();

    await screen.findByText('Akshay Jayaram');

    expect(screen.getByText('Chris Martinez')).toBeInTheDocument();
    expect(screen.getByText('Sam Patel')).toBeInTheDocument();

    const firstReviewerRow = screen.getByRole('row', { name: /Akshay Jayaram/i });
    expect(within(firstReviewerRow).getAllByText('7')).toHaveLength(2);
  });

  it('disables Confirm while loading and when none are selected', async () => {
    let resolvePending;
    getPromotionPending.mockReturnValue(
      new Promise(resolve => {
        resolvePending = resolve;
      }),
    );

    renderDisplayBox();

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
    expect(screen.getByText('Loading pending promotions...')).toBeInTheDocument();

    resolvePending(SAMPLE_PENDING);

    await screen.findByText('Akshay Jayaram');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();

    await userEvent.click(screen.getByLabelText('Select all reviewers'));
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });

  it('closes without promoting when Cancel is clicked', async () => {
    const { onClose } = renderDisplayBox();

    await screen.findByText('Akshay Jayaram');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(postPromotionEligibility).not.toHaveBeenCalled();
  });

  it('promotes selected reviewers then refetches the pending list', async () => {
    const { onClose } = renderDisplayBox();

    await screen.findByText('Akshay Jayaram');

    // Uncheck Akshay so only Ghazi is promoted; refetch returns Akshay still pending.
    getPromotionPending.mockResolvedValueOnce([SAMPLE_PENDING[0]]);

    await userEvent.click(screen.getByLabelText('Select reviewer Akshay Jayaram'));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(postPromotionEligibility).toHaveBeenCalledWith(['637af0c0fb9bbc1e308cff02'], {
        requestorId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
        role: 'Administrator',
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    expect(screen.getByText('Akshay Jayaram')).toBeInTheDocument();
    expect(screen.queryByText('Ghazi1212')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(getPromotionPending).toHaveBeenCalledTimes(2);
  });

  it('closes when every remaining reviewer is promoted', async () => {
    const { onClose } = renderDisplayBox();

    await screen.findByText('Akshay Jayaram');
    getPromotionPending.mockResolvedValueOnce([]);

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(postPromotionEligibility).toHaveBeenCalledWith(
        ['637af0c0fb9bbc1e308cff01', '637af0c0fb9bbc1e308cff02'],
        {
          requestorId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
          role: 'Administrator',
        },
      );
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error toast when loading pending promotions fails', async () => {
    getPromotionPending.mockRejectedValueOnce(new Error('network'));

    renderDisplayBox();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load pending promotions.');
    });

    expect(screen.getByText('No PR reviewers left to promote.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled();
  });
});
