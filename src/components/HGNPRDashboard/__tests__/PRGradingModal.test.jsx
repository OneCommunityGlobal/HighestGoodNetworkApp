import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PRGradingModal from '../PRGradingModal';
import { teamData, makeReviewers, makeBulkResponse } from '../../../utils/gradingTestUtils';

const showModalMock = vi.fn(function() {
  this.setAttribute('open', '');
});

const closeMock = vi.fn(function() {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
});

Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
  configurable: true,
  value: showModalMock,
});

Object.defineProperty(HTMLDialogElement.prototype, 'close', {
  configurable: true,
  value: closeMock,
});

const {
  fetchPREntriesBulkMock,
  updatePRRatingMock,
  addPREntryMock,
  importPREntriesMock,
  updatePRsNeededMock,
} = vi.hoisted(() => ({
  fetchPREntriesBulkMock: vi.fn(),
  updatePRRatingMock: vi.fn(),
  addPREntryMock: vi.fn(),
  importPREntriesMock: vi.fn(),
  updatePRsNeededMock: vi.fn(),
}));

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');

  return {
    ...actual,
    useSelector: selector =>
      selector({
        theme: {
          darkMode: false,
        },
      }),
  };
});

vi.mock('../../../actions/promotionActions', () => ({
  fetchPREntriesBulk: fetchPREntriesBulkMock,
  updatePRRating: updatePRRatingMock,
  addPREntry: addPREntryMock,
  importPREntries: importPREntriesMock,
  updatePRsNeeded: updatePRsNeededMock,
}));

const renderParent = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    reviewGroup: { label: 'Review for This Week' },
    currentUser: { id: 'test-user' },
    reviewers: makeReviewers(),
    teamData,
    darkMode: false,
    onClose: vi.fn(),
  };

  const mergedProps = { ...defaultProps, ...props };

  fetchPREntriesBulkMock.mockResolvedValue(makeBulkResponse(mergedProps.reviewers));

  return {
    ...render(<PRGradingModal {...mergedProps} />),
    onClose: mergedProps.onClose,
  };
};

const openChildDialog = async () => {
  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Grade PR 1070',
    }),
  );

  const childDialog = await screen.findByRole('dialog', {
    name: 'Grade PRs',
  });

  expect(childDialog.open).toBe(true);

  return childDialog;
};

describe('PRGradingModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    updatePRRatingMock.mockResolvedValue({});
    addPREntryMock.mockResolvedValue({});
    importPREntriesMock.mockResolvedValue({ added: [] });
    updatePRsNeededMock.mockResolvedValue({});
    fetchPREntriesBulkMock.mockResolvedValue(makeBulkResponse());
  });

  it('renders the parent dialog when isOpen is true', () => {
    renderParent();

    const parentDialog = screen.getByRole('dialog', {
      name: 'Review for This Week',
    });

    expect(parentDialog).toBeInTheDocument();
    expect(parentDialog.open).toBe(true);
    expect(showModalMock).toHaveBeenCalled();
  });

  it('renders the review group label as the dialog heading', () => {
    renderParent({
      reviewGroup: { label: 'Weekly PR Review' },
    });

    expect(
      screen.getByRole('heading', {
        name: 'Weekly PR Review',
      }),
    ).toBeInTheDocument();
  });

  it('uses the default heading when no review group label is provided', () => {
    renderParent({
      reviewGroup: null,
    });

    expect(
      screen.getByRole('heading', {
        name: 'Review for This Week',
      }),
    ).toBeInTheDocument();
  });

  it('keeps the parent dialog closed when isOpen is false', () => {
    renderParent({
      isOpen: false,
    });

    expect(
      screen.queryByRole('dialog', {
        name: 'Review for This Week',
      }),
    ).not.toBeInTheDocument();

    expect(showModalMock).not.toHaveBeenCalled();
  });

  it('opens the parent dialog when isOpen changes from false to true', async () => {
    const { rerender } = renderParent({
      isOpen: false,
    });

    rerender(
      <PRGradingModal
        isOpen={true}
        reviewGroup={{ label: 'Review for This Week' }}
        currentUser={{ id: 'test-user' }}
        reviewers={makeReviewers()}
        teamData={teamData}
        darkMode={false}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', {
          name: 'Review for This Week',
        }).open,
      ).toBe(true);
    });
  });

  it('calls onClose when the parent close button is clicked', () => {
    const onClose = vi.fn();

    renderParent({ onClose });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close PR grading',
      }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape cancels the parent dialog', () => {
    const onClose = vi.fn();

    renderParent({ onClose });

    const parentDialog = screen.getByRole('dialog', {
      name: 'Review for This Week',
    });

    const cancelEvent = new Event('cancel', {
      bubbles: false,
      cancelable: true,
    });

    fireEvent(parentDialog, cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the child PR grading screen inside the parent', async () => {
    renderParent();

    const parentDialog = screen.getByRole('dialog', {
      name: 'Review for This Week',
    });

    expect(await within(parentDialog).findByText('Ada Lovelace')).toBeInTheDocument();

    expect(
      within(parentDialog).getByRole('button', {
        name: 'Grade PR 1070',
      }),
    ).toBeInTheDocument();
  });

  it('opens Grade PRs when a PR number is clicked', async () => {
    renderParent();

    const childDialog = await openChildDialog();

    expect(
      within(childDialog).getByRole('heading', {
        name: 'Grade PRs',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('dialog', {
        name: 'Review for This Week',
      }).open,
    ).toBe(true);
  });

  it('closes only the child dialog on Escape and keeps the parent open', async () => {
    const onClose = vi.fn();

    renderParent({ onClose });

    const parentDialog = screen.getByRole('dialog', {
      name: 'Review for This Week',
    });

    const childDialog = await openChildDialog();

    const cancelEvent = new Event('cancel', {
      bubbles: true,
      cancelable: true,
    });

    fireEvent(childDialog, cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);

    await waitFor(() => {
      expect(childDialog.open).toBe(false);
    });

    expect(parentDialog.open).toBe(true);
    expect(onClose).not.toHaveBeenCalled();

    expect(
      screen.getByRole('dialog', {
        name: 'Review for This Week',
      }),
    ).toBeInTheDocument();
  });

  it('closes the child dialog using its close button without closing the parent', async () => {
    const onClose = vi.fn();

    renderParent({ onClose });

    const parentDialog = screen.getByRole('dialog', {
      name: 'Review for This Week',
    });

    const childDialog = await openChildDialog();

    fireEvent.click(
      within(childDialog).getByRole('button', {
        name: 'Close grading modal',
      }),
    );

    await waitFor(() => {
      expect(childDialog.open).toBe(false);
    });

    expect(parentDialog.open).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies the dark-mode class when darkMode is enabled', () => {
    renderParent({
      darkMode: true,
    });

    const parentDialog = screen.getByRole('dialog', {
      name: 'Review for This Week',
    });

    expect(parentDialog.className).toContain('prGradingModalDark');
  });

  it('does not call onClose when the child dialog is opened', async () => {
    const onClose = vi.fn();

    renderParent({ onClose });

    await openChildDialog();

    expect(onClose).not.toHaveBeenCalled();
  });
});
