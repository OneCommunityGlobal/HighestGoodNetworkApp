import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BadgeStatistics from '../BadgeStatistics';

vi.mock('react-chartjs-2', () => ({
  Pie: React.forwardRef(function MockPie(props, ref) {
    return <div data-testid="mock-pie-chart" />;
  }),
}));

const mockBadgeData = [
  {
    _id: 'badge-1',
    badgeName: 'Community Builder',
    users: [
      { userId: { _id: 'u1', firstName: 'Alex', lastName: 'Morgan' } },
      { userId: { _id: 'u2', firstName: 'Taylor', lastName: 'Swift' } },
    ],
  },
  {
    _id: 'badge-2',
    badgeName: 'Bug Hunter',
    users: [{ userId: { _id: 'u3', firstName: 'Jordan', lastName: 'Lee' } }],
  },
  {
    _id: 'badge-3',
    badgeName: 'Code Ninja',
    users: [],
  },
  {
    _id: 'badge-4',
    badgeName: 'Malformed Badge',
    users: null, // Edge case: invalid users prop
  },
];

describe('BadgeStatistics Component', () => {
  test('renders initial empty state before selecting any badges', () => {
    render(<BadgeStatistics allBadgeData={mockBadgeData} darkMode={false} />);

    // Specify role/selector to avoid ambiguity between <label> and <button>
    expect(screen.getByText('Select Badges', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select Badges' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear selected/i })).toBeInTheDocument();
    expect(screen.getByText('Select badges to view assignment statistics')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-pie-chart')).not.toBeInTheDocument();
  });

  test('opens dropdown and displays available badge options', () => {
    render(<BadgeStatistics allBadgeData={mockBadgeData} darkMode={false} />);

    const toggleButton = screen.getByRole('button', { name: 'Select Badges' });
    fireEvent.click(toggleButton);

    expect(screen.getByText('Community Builder')).toBeInTheDocument();
    expect(screen.getByText('Bug Hunter')).toBeInTheDocument();
    expect(screen.getByText('Code Ninja')).toBeInTheDocument();
  });

  test('updates UI, chart, and user list when selecting badges', () => {
    render(<BadgeStatistics allBadgeData={mockBadgeData} darkMode={false} />);

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Select Badges' }));

    // Select "Community Builder"
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    // Verify Dropdown Toggle label update
    expect(screen.getByRole('button', { name: '1 Badge Selected' })).toBeInTheDocument();

    // Verify Chart & User details rendered
    expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Assigned Users')).toBeInTheDocument();
    expect(screen.getByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
  });

  test('clears selected badges when "Clear Selected" button is clicked', () => {
    render(<BadgeStatistics allBadgeData={mockBadgeData} darkMode={false} />);

    // Select a badge
    fireEvent.click(screen.getByRole('button', { name: 'Select Badges' }));
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();

    // Click Clear Selected
    fireEvent.click(screen.getByRole('button', { name: /clear selected/i }));

    // Verify reset to empty state
    expect(screen.getByText('Select badges to view assignment statistics')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-pie-chart')).not.toBeInTheDocument();
  });

  test('handles badges with no assigned users gracefully', () => {
    render(<BadgeStatistics allBadgeData={mockBadgeData} darkMode={false} />);

    // Open dropdown and select "Code Ninja" (empty users)
    fireEvent.click(screen.getByRole('button', { name: 'Select Badges' }));
    const emptyBadgeCheckbox = screen.getAllByRole('checkbox')[2];
    fireEvent.click(emptyBadgeCheckbox);

    expect(screen.getByText('No users assigned')).toBeInTheDocument();
  });

  test('disables additional checkboxes and shows warning when 10 badges are selected', () => {
    // Generate 11 mock badges
    const tenPlusBadges = Array.from({ length: 11 }, (_, i) => ({
      _id: `badge-${i}`,
      badgeName: `Badge ${i + 1}`,
      users: [{ userId: { _id: `u${i}`, firstName: `User`, lastName: `${i}` } }],
    }));

    render(<BadgeStatistics allBadgeData={tenPlusBadges} darkMode={false} />);

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Select Badges' }));

    const checkboxes = screen.getAllByRole('checkbox');

    // Select 10 badges
    for (let i = 0; i < 10; i++) {
      fireEvent.click(checkboxes[i]);
    }

    // Verify button toggle text pluralization
    expect(screen.getByRole('button', { name: '10 Badges Selected' })).toBeInTheDocument();

    // Verify 11th checkbox is disabled
    expect(checkboxes[10]).toBeDisabled();

    // Verify 10 badge limit warning banner appears
    expect(
      screen.getByText('You can only select up to 10 badges. Deselect one or more to continue.'),
    ).toBeInTheDocument();
  });

  test('applies dark mode styles correctly when darkMode prop is true', () => {
    render(<BadgeStatistics allBadgeData={mockBadgeData} darkMode={true} />);

    // Select a badge to show dark mode containers
    fireEvent.click(screen.getByRole('button', { name: 'Select Badges' }));
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // Check header styling or container presence
    expect(screen.getByText('Badge Assignment Distribution')).toBeInTheDocument();
    expect(screen.getByText('Assigned Users')).toBeInTheDocument();
  });
});
