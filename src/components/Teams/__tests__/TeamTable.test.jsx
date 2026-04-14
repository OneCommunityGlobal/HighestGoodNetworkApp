import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import TeamTable from '../../Reports/TeamTable';
import '@testing-library/jest-dom/extend-expect';

const mockStore = configureMockStore([thunk]);

describe('<TeamTable />', () => {
  let store;
  const mockTeams = [
    { _id: '1', teamName: 'Team1', isActive: true, teamCode: 'A-123' },
    { _id: '2', teamName: 'Team2', isActive: false, teamCode: 'B-456' },
  ];

  beforeEach(() => {
    store = mockStore({
      role: { roles: [{ roleName: 'User', permissions: ['somePermission'] }] },
      auth: {
        user: { role: 'Owner', permissions: { frontPermissions: ['editTeamCode'] } },
      },
    });
  });

  const renderTable = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <TeamTable allTeams={mockTeams} darkMode={false} />
        </MemoryRouter>
      </Provider>,
    );

  it('renders header and one row per team', () => {
    renderTable();

    // Header row
    const rows = screen.getAllByRole('row');
    // First is header, others are team rows
    expect(rows.length).toBe(3);
  });

  it('renders each team name as a link', () => {
    renderTable();
    expect(screen.getByRole('link', { name: 'Team1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Team2' })).toBeInTheDocument();
  });

  it('shows exactly one active and one inactive indicator', () => {
    renderTable();
    expect(screen.getAllByTestId('team-is-active')).toHaveLength(1);
    expect(screen.getAllByTestId('team-is-inactive')).toHaveLength(1);
  });

  it('renders a code input for each team when permitted', () => {
    renderTable();
    const inputs = screen.getAllByPlaceholderText('X-XXX');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue('A-123');
    expect(inputs[1]).toHaveValue('B-456');
  });

  it('accepts valid code changes and flags invalid ones', () => {
    renderTable();
    const [firstInput] = screen.getAllByPlaceholderText('X-XXX');

    // valid
    fireEvent.change(firstInput, { target: { value: 'NEW01' } });
    expect(firstInput).toHaveValue('NEW01');
    expect(firstInput).not.toHaveClass('is-invalid');

    // invalid
    fireEvent.change(firstInput, { target: { value: 'AB' } });
    expect(firstInput).toHaveValue('AB');
    expect(firstInput).toHaveClass('is-invalid');
  });
});
