import React from 'react';
import { shallow } from 'enzyme';
import mockAdminState from '../../__tests__/mockAdminState';
import LeaderBoard from './LeaderBoard';

describe('LeaderBoard page structure', () => {
  let mountedLeaderBoard, props;
  beforeEach(() => {
    props = mockAdminState;
    props.organizationData = { weeklyCommittedHours: 0, tangibletime: 0, totaltime: 0 };
    props.getLeaderBoardData = jest.fn();
    props.loggedInUser = jest.fn();
    mountedLeaderBoard = shallow(<LeaderBoard {...props} />);
  });

  it('should be rendered with a table', () => {
    const table = mountedLeaderBoard.find('Table');
    expect(table.length).toBe(1);
  });

  it('should be rendered with 5 Headers', () => {
    const tableHeader = mountedLeaderBoard.find('thead');
    expect(tableHeader.length).toBe(1);
    const tableHeads = tableHeader.find('th');
    expect(tableHeads.length).toBe(5);
  });

  it('should be rendered with mock LeaderBoard data', () => {
    const leaderBoardBody = mountedLeaderBoard.find('tbody');
    const leaderBoardItems = leaderBoardBody.find('tr');
    let lbData = mockAdminState.leaderBoardData;
    const lBLength = lbData.length;
    expect(leaderBoardItems.length).toBe(lBLength + 1);

    for (let i = 0; i < lBLength; i++) {
      //find that a link to each user profile exists and test the text of the Link to be the name
      let linkItem = leaderBoardItems.find({ to: `/userprofile/${lbData[i].personId}` });
      expect(linkItem.length).toBe(1);
      expect(linkItem.text().includes(lbData[i].name)).toBeTruthy();

      //check if the entries for the total time and intangibletime exist
      expect(
        leaderBoardItems.containsMatchingElement(
          <td>
            <span title="Total time">{lbData[i].totaltime}</span>
          </td>
        )
      ).toBeTruthy();
      expect(
        leaderBoardItems.containsMatchingElement(
          <td>
            <span title="Tangible time">{lbData[i].tangibletime}</span>
          </td>
        )
      ).toBeTruthy();
    }
  });
});
