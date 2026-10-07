import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PRGradingScreen from './PRGradingScreen';

vi.mock('axios');
vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));

const teamData = {
  teamName: 'Test Team',
  dateRange: { start: '5/18/2025', end: '5/25/2025' },
};
const reviewers = [
  {
    id: '1',
    reviewer: 'Alice',
    prsNeeded: 3,
    gradedPrs: [{ id: 'pr1', prNumbers: '1234 + 5678', grade: 'Okay' }],
  },
  { id: '2', reviewer: 'Bob', prsNeeded: 3, gradedPrs: [] },
];

const addPR = async (row, numbers) => {
  const addNewButton = within(row).getByRole('button', { name: '+ Add new' });
  await waitFor(() => expect(addNewButton).toBeEnabled());
  fireEvent.click(addNewButton);
  fireEvent.change(within(row).getByPlaceholderText('1070 or 1070 + 1256'), {
    target: { value: numbers },
  });
  fireEvent.click(within(row).getByRole('button', { name: 'Add' }));
  await waitFor(() =>
    expect(within(row).queryByRole('button', { name: 'Adding...' })).not.toBeInTheDocument(),
  );
};

describe('Weekly PR grading duplicate entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
    axios.post.mockResolvedValue({ data: { status: 'ok' } });
  });

  it('allows a pair containing two unused PR numbers and counts it as one review', async () => {
    render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);
    const aliceRow = screen.getByRole('row', { name: /Alice/ });

    await addPR(aliceRow, '9981 + 9982');

    expect(within(aliceRow).getByText('9981 + 9982')).toBeInTheDocument();
    expect(within(aliceRow).getByRole('spinbutton')).toHaveValue(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('rejects a PR already present inside a pair for the same reviewer', async () => {
    render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);
    const aliceRow = screen.getByRole('row', { name: /Alice/ });

    await addPR(aliceRow, '5678 + 9999');

    expect(screen.getByRole('alert')).toHaveTextContent('already been added');
    expect(within(aliceRow).getByRole('spinbutton')).toHaveValue(1);
    expect(within(aliceRow).queryByText('5678 + 9999')).not.toBeInTheDocument();
  });

  it('rejects a repeated number within a new pair', async () => {
    render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);
    const aliceRow = screen.getByRole('row', { name: /Alice/ });

    await addPR(aliceRow, '4321 + 4321');

    expect(screen.getByRole('alert')).toHaveTextContent('already been added');
    expect(within(aliceRow).getByRole('spinbutton')).toHaveValue(1);
  });

  it('rejects a repeated addition but allows another reviewer to use that PR number', async () => {
    render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);
    const aliceRow = screen.getByRole('row', { name: /Alice/ });
    const bobRow = screen.getByRole('row', { name: /Bob/ });

    await addPR(aliceRow, '4321');
    await addPR(aliceRow, '4321');

    expect(screen.getByRole('alert')).toHaveTextContent('already been added');
    expect(within(aliceRow).getByRole('spinbutton')).toHaveValue(2);

    await addPR(bobRow, '4321');
    expect(within(bobRow).getByRole('spinbutton')).toHaveValue(1);
  });

  it('loads a saved PR again after the screen is remounted', async () => {
    axios.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({
        data: [
          {
            reviewer: 'Alice',
            gradedPrs: [{ _id: 'saved1', prNumbers: '9981', grade: 'Okay' }],
          },
        ],
      });
    const { unmount } = render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);
    await addPR(screen.getByRole('row', { name: /Alice/ }), '9981');
    unmount();

    render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);
    const aliceRow = screen.getByRole('row', { name: /Alice/ });
    await waitFor(() => expect(within(aliceRow).getByText('9981')).toBeInTheDocument());
    expect(within(aliceRow).getByRole('spinbutton')).toHaveValue(2);
  });

  it('keeps the input open when saving fails instead of showing an unsaved PR', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    render(<PRGradingScreen teamData={teamData} reviewers={reviewers} />);
    const aliceRow = screen.getByRole('row', { name: /Alice/ });

    await addPR(aliceRow, '9981');

    expect(within(aliceRow).getByRole('alert')).toHaveTextContent('Could not save');
    expect(within(aliceRow).getByRole('spinbutton')).toHaveValue(1);
    expect(within(aliceRow).queryByText('9981')).not.toBeInTheDocument();
  });
});
