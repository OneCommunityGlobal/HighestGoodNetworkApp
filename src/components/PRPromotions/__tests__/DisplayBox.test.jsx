import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { vi } from 'vitest';
import { toast } from 'react-toastify';
import DisplayBox from '../DisplayBox';
import { postPromotionEligibility } from '../../../actions/promotionActions';
import { resetPendingPromotionReviewers } from '../pendingPromotionReviewers';

vi.mock('../../../actions/promotionActions', () => ({
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

function renderDisplayBox(darkMode = false) {
  const onClose = vi.fn();
  const store = mockStore({
    auth: { user: { userid: 'admin1', role: 'Administrator' } },
    theme: { darkMode },
  });

  render(
    <Provider store={store}>
      <DisplayBox onClose={onClose} darkMode={darkMode} />
    </Provider>,
  );

  return { onClose };
}

describe('DisplayBox promotion confirmation modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetPendingPromotionReviewers();
    postPromotionEligibility.mockResolvedValue({ message: 'Members promoted successfully.' });
  });

  it('selects every reviewer checkbox by default', () => {
    renderDisplayBox();

    expect(screen.getByText('Akshay - Jayaram')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(6);
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
  });

  it('shows the reviewers who are about to be promoted', () => {
    renderDisplayBox();

    expect(screen.getByText('Akshay - Jayaram')).toBeInTheDocument();
    expect(screen.getByText('Ghazi1212')).toBeInTheDocument();
    expect(screen.getByText('Diya Test 1')).toBeInTheDocument();
    expect(screen.getByText('Ramya Test Volunteer')).toBeInTheDocument();
    expect(screen.getByText('Yuhang Xu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  it('uses Team Leader Name and Weekly PRs column titles', () => {
    renderDisplayBox();

    expect(screen.getByText('Team Leader Name')).toBeInTheDocument();
    expect(screen.queryByText('Team Reviewer Name')).not.toBeInTheDocument();
    expect(screen.getByText('Weekly PRs')).toBeInTheDocument();
    expect(screen.queryByText('Weekly PR Counts')).not.toBeInTheDocument();
  });

  it('shows team leader names instead of quotes and weekly PR counts in circles', () => {
    renderDisplayBox();

    expect(screen.getByText('Chris Martinez')).toBeInTheDocument();
    expect(screen.getByText('Sam Patel')).toBeInTheDocument();
    expect(screen.queryByText('""')).not.toBeInTheDocument();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();

    const firstReviewerRow = screen.getByRole('row', { name: /Akshay - Jayaram/i });
    expect(within(firstReviewerRow).getByText('2')).toBeInTheDocument();
    expect(within(firstReviewerRow).getByText('10')).toBeInTheDocument();
    expect(within(firstReviewerRow).getByText('11')).toBeInTheDocument();
  });

  it('lets the user uncheck a reviewer and disables Confirm when none are selected', async () => {
    renderDisplayBox();

    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmButton).toBeEnabled();

    await userEvent.click(screen.getByLabelText('Select all reviewers'));
    expect(confirmButton).toBeDisabled();
  });

  it('closes without promoting when Cancel is clicked', async () => {
    const { onClose } = renderDisplayBox();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(postPromotionEligibility).not.toHaveBeenCalled();
  });

  it('removes confirmed reviewers from the pending list', async () => {
    const { onClose } = renderDisplayBox();

    await userEvent.click(screen.getByLabelText('Select reviewer Akshay - Jayaram'));
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    expect(screen.getByText('Akshay - Jayaram')).toBeInTheDocument();
    expect(screen.queryByText('Ghazi1212')).not.toBeInTheDocument();
    expect(screen.queryByText('Diya Test 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Ramya Test Volunteer')).not.toBeInTheDocument();
    expect(screen.queryByText('Yuhang Xu')).not.toBeInTheDocument();
    expect(postPromotionEligibility).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when every remaining reviewer is promoted', async () => {
    const { onClose } = renderDisplayBox();

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    expect(toast.success).toHaveBeenCalled();
  });
});
