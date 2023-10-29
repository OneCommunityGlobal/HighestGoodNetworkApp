import { shallow } from 'enzyme';
import React from 'react';
import TeamTable from '../components/Reports/TeamTable';

describe('<TeamTable/>', () => {

  it('should render without errors', () => {
    const mockTeamsData = [
      { _id: '1', teamName: 'Team1', isActive: true },
      { _id: '2', teamName: 'Team2', isActive: false },
    ];
    const wrapper = shallow(<TeamTable allTeams={mockTeamsData} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should throw an error if allTeams is not an array', () => {
    const erroneousTeamsData = "This is not an array";
    expect(() => {
      shallow(<TeamTable allTeams={erroneousTeamsData} />);
    }).toThrow();
  });

  it('should render the correct number of team rows', () => {
    const mockTeamsData = [
      { _id: '1', teamName: 'Team1', isActive: true },
      { _id: '2', teamName: 'Team2', isActive: false },
    ];
    const wrapper = shallow(<TeamTable allTeams={mockTeamsData} />);
    expect(wrapper.find('tr').length).toBe(mockTeamsData.length + 1); // +1 for the header row
  });

  it('should have correct link to the team report', () => {
    const mockTeamsData = [
      { _id: '1', teamName: 'Team1', isActive: true }
    ];
    const wrapper = shallow(<TeamTable allTeams={mockTeamsData} />);
    const link = wrapper.find('Link');
    expect(link.prop('to')).toBe(`/teamreport/${mockTeamsData[0]._id}`);
  });
});
