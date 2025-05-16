import { shallow } from 'enzyme';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import configureStore from 'redux-mock-store'; // Import the mock store creator
import ReportsPage from '../Reports';

describe('<ReportsPage/>', () => {
  const mockStore = configureStore(); // Create a mock store

  it('should render without errors', () => {
    const store = mockStore({}); // Create an empty mock store
    const wrapper = shallow(<ReportsPage store={store} />); // Pass the mock store as a prop
    expect(wrapper.exists()).toBe(true);
  });

});
