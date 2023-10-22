import { shallow } from 'enzyme';
import React from 'react';
import TeamTable from '../components/Reports/TeamTable'; // Adjust the import path as necessary
import configureStore from 'redux-mock-store';

describe('<TeamTable/>', () => {
  const mockStore = configureStore();

  it('should render without errors', () => {
    const mockTeamsData = [
      { _id: '1', teamName: 'Team1', isActive: true },
      { _id: '2', teamName: 'Team2', isActive: false },
    ];
    const store = mockStore({});
    const wrapper = shallow(<TeamTable store={store} allTeams={mockTeamsData} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('should render the correct number of team rows', () => {
    const mockTeamsData = [
      { _id: '1', teamName: 'Team1', isActive: true },
      { _id: '2', teamName: 'Team2', isActive: false },
    ];
    const wrapper = shallow(<TeamTable allTeams={mockTeamsData} />);
    expect(wrapper.find('tr').length).toBe(mockTeamsData.length + 1); // +1 for the header row
  });

});
