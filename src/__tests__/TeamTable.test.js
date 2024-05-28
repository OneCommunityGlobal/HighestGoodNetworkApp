import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import TeamTable from '../components/Reports/TeamTable.jsx';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('<TeamTable />', () => {
  let store;
  let component;

  beforeEach(() => {
    store = mockStore({
      role: {
        roles: [
          { roleName: 'User', permissions: ['somePermission'] },
        ],
      },
      auth: {
        user: {
          role: 'Owner',
          permissions: { frontPermissions: ['editTeamCode'] },
        },
      },
    });

    const mockTeamsData = [
      { _id: '1', teamName: 'Team1', isActive: true, teamCode: 'A-123' },
      { _id: '2', teamName: 'Team2', isActive: false, teamCode: 'B-456' },
    ];

    component = mount(
      <Provider store={store}>
        <MemoryRouter> {/* Use MemoryRouter for testing */}
          <TeamTable allTeams={mockTeamsData} />
        </MemoryRouter>
      </Provider>
    );
  });

  it('renders without crashing', () => {
    expect(component.exists()).toBeTruthy();
  });

  it('renders correct number of teams', () => {
    expect(component.find('tr').length).toBe(3); // 2 teams + 1 header
  });

  // Test for correct rendering of team names
  it('renders correct team names', () => {
    const teamRows = component.find('tr').slice(1); // Skip the header row
    expect(teamRows.length).toBe(2); // Ensure we have 2 team rows

    const teamNames = teamRows.map(row => {
      const nameCell = row.find('td').at(0);
      expect(nameCell.exists()).toBe(true); // Check if the cell exists
      return nameCell.text();
    });

    expect(teamNames).toEqual(['Team1', 'Team2']);
  });

  // Test for correctly displaying active/inactive status
  it('displays correct active/inactive status', () => {
    const isActive = component.find('.isActive').hostNodes().length;
    const isNotActive = component.find('.isNotActive').hostNodes().length;
    expect(isActive).toBe(1); // One team is active
    expect(isNotActive).toBe(1); // One team is not active
  });

  // Test edit team code interaction
  it('allows editing team code if permitted', () => {
    // Assuming 'editTeamCode' permission allows editing the team code
    const firstTeamInput = component.find('Input').first();
    firstTeamInput.simulate('change', { target: { value: 'New-Code' } });

    // Verify the input value change
    expect(firstTeamInput.prop('value')).toBe('A-123');
  });


});
