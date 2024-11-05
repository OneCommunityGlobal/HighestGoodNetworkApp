import React from 'react';
import { shallow } from 'enzyme';
import mockAdminState from '../../../__tests__/mockAdminState';
import Leaderboard from '../Leaderboard';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const mockUser = {
  userid: '123',
  firstName: 'Test User',
  profilePic: 'test-pic.jpg',
};

const mockState = {
  auth: {
    user: mockUser,
    loggedInUser: { role: 'Admin' },
    firstName: 'Test',
    profilePic: 'test-pic',
  },
  leaderBoardData: mockAdminState.leaderBoardData,
  orgData: mockAdminState.organizationData,
};

describe('Leaderboard page structure', () => {
  let mountedLeaderboard, props;
  
  beforeEach(() => {
    props = mockAdminState;
    props.organizationData = { weeklyCommittedHours: 0, tangibletime: 0, totaltime: 0 };
    props.getLeaderboardData = jest.fn();
    props.loggedInUser = { role: 'Admin' };
    props.loading = true;
    mountedLeaderboard = shallow(<Leaderboard {...props} darkMode={true} />);
  });

  it('should be rendered with a table', () => {
    const table = mountedLeaderboard.find('Table');
    expect(table.length).toBe(1);
  });

  it('should be rendered with 6 Headers', () => {
    const tableHeader = mountedLeaderboard.find('thead');
    expect(tableHeader.length).toBe(1);
    const tableHeads = tableHeader.find('th');
    expect(tableHeads.length).toBe(7);
  });

  it('should be rendered with mock Leaderboard data', () => {
    const leaderBoardBody = mountedLeaderboard.find('tbody');
    const leaderBoardItems = leaderBoardBody.find('tr');
    const lbData = mockAdminState.leaderBoardData;
    const lBLength = lbData.length;
    expect(leaderBoardItems.length).toBe(lBLength + 1);

    for (let i = 1; i < lBLength; i++) {
      const linkItem = leaderBoardItems.find({ to: `/userprofile/${lbData[i].personId}` });
      expect(linkItem.length).toBe(1);
      expect(linkItem.text().includes(lbData[i].name)).toBeTruthy();

      expect(
        leaderBoardItems.containsMatchingElement(
          <td>
            <span id="Total time">{lbData[i].totaltime}</span>
          </td>,
        ),
      ).toBeTruthy();
      expect(
        leaderBoardItems.containsMatchingElement(
          <td>
            <span title="Tangible time">{lbData[i].tangibletime}</span>
          </td>,
        ),
      ).toBeTruthy();
    }
  });

  
    it('should render with dark mode styles when darkMode prop is true', () => {
      expect(mountedLeaderboard.find('.dark-mode').length).toBeGreaterThan(0);
    });
  

  it('should display an alert if the user is invisible', () => {
    props.isVisible = false;
    mountedLeaderboard = shallow(<Leaderboard {...props} />);
    expect(mountedLeaderboard.find('Alert').exists()).toBe(true);
  });

  it('renders a search input', () => {
    expect(mountedLeaderboard.find('input[type="text"]').exists()).toBe(true);
  });

  it('renders the progress component for each user', () => {
    props.leaderBoardData = [{ personId: 1, name: 'John Doe', tangibletime: 10, totaltime: 20 }];
    mountedLeaderboard = shallow(<Leaderboard {...props} />);
    expect(mountedLeaderboard.find('Progress').length).toBeGreaterThan(0);
  });

  it('renders the correct number of rows for users, including header/summary rows', () => {
    props.leaderBoardData = [
      { personId: 1, name: 'John Doe', tangibletime: 10, totaltime: 20 },
      { personId: 2, name: 'Jane Smith', tangibletime: 15, totaltime: 25 },
    ];
    mountedLeaderboard = shallow(<Leaderboard {...props} />);
    
    const leaderBoardBody = mountedLeaderboard.find('tbody');
    const leaderBoardItems = leaderBoardBody.find('tr');
    
    const totalRows = props.leaderBoardData.length + 1; // 1 extra row for summary or header
    expect(leaderBoardItems.length).toBe(totalRows);
  });

  it('should not render admin features if loggedInUser role is not Admin', () => {
    props.loggedInUser = { role: 'User' };
    mountedLeaderboard = shallow(<Leaderboard {...props} />);
    expect(mountedLeaderboard.find('.admin-features').exists()).toBe(false);
  });
});
