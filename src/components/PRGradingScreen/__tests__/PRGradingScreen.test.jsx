import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PRGradingScreen from '../PRGradingScreen';
import GRADE_OPTIONS from '../gradeOptions';
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

const renderScreen = (reviewers = makeReviewers()) => {
  fetchPREntriesBulkMock.mockResolvedValue(makeBulkResponse(reviewers));

  return render(
    <PRGradingScreen teamData={teamData} reviewers={reviewers} currentUser={{ id: 'test-user' }} />,
  );
};

// Open the dialog through the PR number button and verify native modal behavior.
const openModal = async () => {
  fireEvent.click(
    await screen.findByRole('button', {
      name: 'Grade PR 1070',
    }),
  );

  const modal = await screen.findByRole('dialog');

  expect(modal).toBeInTheDocument();
  expect(modal.open).toBe(true);
  expect(showModalMock).toHaveBeenCalled();

  expect(
    within(modal).getByRole('heading', {
      name: 'Grade PRs',
    }),
  ).toBeInTheDocument();

  return modal;
};

describe('PRGradingScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    updatePRRatingMock.mockResolvedValue({});
    addPREntryMock.mockResolvedValue({});
    importPREntriesMock.mockResolvedValue({ added: [] });
    updatePRsNeededMock.mockResolvedValue({});
  });

  it('renders the reviewer after loading PR entries', async () => {
    renderScreen();

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('renders the PR number button', async () => {
    renderScreen();

    expect(
      await screen.findByRole('button', {
        name: 'Grade PR 1070',
      }),
    ).toBeInTheDocument();
  });

  it('renders the role filter', async () => {
    renderScreen();

    expect(await screen.findByRole('combobox')).toBeInTheDocument();
  });

  it('opens the grading modal', async () => {
    renderScreen();

    const modal = await openModal();

    expect(modal).toBeInTheDocument();
  });

  it('renders the rating dropdown with the existing rating', async () => {
    renderScreen();

    const modal = await openModal();

    const ratingSelect = within(modal).getByRole('combobox', {
      name: 'Rating for PR 1070',
    });

    expect(ratingSelect).toHaveValue('Good');
  });

  it('renders all supported rating options', async () => {
    renderScreen();

    const modal = await openModal();

    const ratingSelect = within(modal).getByRole('combobox', {
      name: 'Rating for PR 1070',
    });

    for (const option of GRADE_OPTIONS) {
      expect(
        within(ratingSelect).getByRole('option', {
          name: option.label,
        }),
      ).toBeInTheDocument();
    }
  });

  it('closes the grading modal using the X button', async () => {
    renderScreen();

    const modal = await openModal();

    fireEvent.click(
      within(modal).getByRole('button', {
        name: 'Close grading modal',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes the grading modal using the Done button', async () => {
    renderScreen();

    const modal = await openModal();

    fireEvent.click(
      within(modal).getByRole('button', {
        name: 'Done',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('saves a changed rating and reloads PR entries', async () => {
    renderScreen();

    const modal = await openModal();

    const ratingSelect = within(modal).getByRole('combobox', {
      name: 'Rating for PR 1070',
    });

    fireEvent.change(ratingSelect, {
      target: {
        value: 'Exceptional',
      },
    });

    await waitFor(() => {
      expect(updatePRRatingMock).toHaveBeenCalledWith('pr1', 'Exceptional', { id: 'test-user' });
    });

    await waitFor(() => {
      expect(fetchPREntriesBulkMock).toHaveBeenCalledTimes(2);
    });
  });

  it('does not render a grading modal before a PR is clicked', async () => {
    renderScreen();

    await screen.findByText('Ada Lovelace');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the no-reviewers message when the reviewer list is empty', async () => {
    renderScreen([]);

    expect(await screen.findByText('No reviewers found')).toBeInTheDocument();
  });

  it('validates the current supported rating options', () => {
    const expectedRatings = [
      'Did not review',
      'Needs more details',
      'Good',
      'Exceptional',
      'No Image',
    ];

    expect(GRADE_OPTIONS.map(option => option.label)).toEqual(expectedRatings);
  });

  it('opens the grading dialog natively and closes it on Escape', async () => {
    renderScreen();

    const modal = await openModal();

    expect(showModalMock).toHaveBeenCalledTimes(1);
    expect(modal.open).toBe(true);

    fireEvent(
      modal,
      new Event('cancel', {
        bubbles: false,
        cancelable: true,
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
