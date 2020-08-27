import React from "react";
import { shallow } from "enzyme";
import mockAdminState from '../../__tests__/mockAdminState';
import Leaderboard from "./Leaderboard";


describe('Leaderboard page structure', () => {
  let mountedLeaderboard, props;
  beforeEach(() => {
    props = mockAdminState;
    props.getLeaderboardData = jest.fn();
    mountedLeaderboard = shallow(<Leaderboard {...props} />);
  });

  it('should be rendered with a table', () => {
    const table = mountedLeaderboard.find('Table');
    expect(table.length).toBe(1);
  });

  it('should be rendered with 5 Headers', () => {
    const tableHeader = mountedLeaderboard.find('thead');
    expect(tableHeader.length).toBe(1);
    const tableHeads = tableHeader.find('th');
    expect(tableHeads.length).toBe(5);
  });

  it('should be rendered with mock Leaderboard data', () => {
    const leaderBoardBody = mountedLeaderboard.find('tbody');
    const leaderBoardItems = leaderBoardBody.find('tr');
    let lbData = mockAdminState.leaderBoardData;
    const lBLength = lbData.length;
    expect(leaderBoardItems.length).toBe(lBLength);
    
    for (let i=0; i<lBLength; i++) {
      //find that a link to each user profile exists and test the text of the Link to be the name
      let linkItem = leaderBoardItems.find({to: `/userprofile/${lbData[i].personId}`});
      expect(linkItem.length).toBe(1);
      expect(linkItem.text().includes(lbData[i].name)).toBeTruthy();

      //check if the entries for the total time and intangibletime exist
      expect(leaderBoardItems.containsMatchingElement(<td>{lbData[i].totaltime}</td>)).toBeTruthy();
      expect(leaderBoardItems.containsMatchingElement(<td>{lbData[i].intangibletime}</td>)).toBeTruthy();
    }
  });

});

