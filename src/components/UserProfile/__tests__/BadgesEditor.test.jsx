import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Badges } from '../Badges';

vi.mock('react-redux', () => ({ connect: () => component => component }));
vi.mock('../EditableModal/EditableInfoModal', () => ({ default: () => null }));
vi.mock('../AssignBadgePopup', () => ({ default: () => null }));
vi.mock('../../Badge/BadgeReport/BadgeReport', () => ({
  default: props => (
    <div>
      <button type="button" onClick={() => props.onSavingChange(true)}>
        Start pending save
      </button>
      <button type="button" onClick={() => props.close()}>
        Attempt dismiss
      </button>
      <button type="button" onClick={() => props.onSavingChange(false)}>
        Finish save
      </button>
      <span>
        {props.isRecordBelongsToJaeAndUneditable ? 'Protected editor' : 'Editable account'}
      </span>
    </div>
  ),
}));

const record = (name, ranking, count) => ({
  _id: name,
  count,
  featured: true,
  badge: { _id: name, badgeName: name, ranking, type: 'Hours', imageUrl: 'badge.png' },
});
const props = {
  userProfile: {
    _id: 'user',
    badgeCollection: [record('Last', 0, 3), record('Second', 2, 2), record('First', 1, 1)],
  },
  canEdit: true,
  clearSelected: vi.fn(),
  hasPermission: () => false,
  authUser: { userid: 'user' },
  displayUserId: 'user',
};

test('blocks dismissal while saving and unlocks afterward', async () => {
  render(<Badges {...props} />);
  fireEvent.click(screen.getByRole('button', { name: 'Select Featured' }));
  fireEvent.click(screen.getByRole('button', { name: 'Start pending save' }));
  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Attempt dismiss' }));
  fireEvent.keyUp(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });
  expect(screen.getByText('Full View of Badge History')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Finish save' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() =>
    expect(screen.queryByText('Full View of Badge History')).not.toBeInTheDocument(),
  );
});

test('uses the same ordering for featured badges and both history layouts with missing dates', () => {
  render(<Badges {...props} />);
  expect(screen.getAllByTestId('badge_featured_count').map(node => node.textContent)).toEqual([
    '1',
    '2',
    '3',
  ]);
  fireEvent.click(screen.getByRole('link', { name: '6' }));
  screen.getAllByRole('table').forEach(table => {
    const rows = within(table)
      .getAllByRole('row')
      .slice(1);
    expect(rows.map(row => within(row).getAllByRole('cell')[1].textContent)).toEqual([
      'First',
      'Second',
      'Last',
    ]);
  });
  expect(screen.getAllByText('—')).toHaveLength(6);
});

test.each([
  ['Owner', 'Editable account'],
  ['Administrator', 'Protected editor'],
])('preserves protected-account handling for %s', (role, expected) => {
  render(<Badges {...props} role={role} isRecordBelongsToJaeAndUneditable />);
  fireEvent.click(screen.getByRole('button', { name: 'Select Featured' }));
  expect(screen.getByText(expected)).toBeInTheDocument();
});
