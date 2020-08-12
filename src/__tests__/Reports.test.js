import { shallow } from 'enzyme';
import React from 'react';
import ReportsPage from '../components/Reports/Reports';

describe('<ReportsPage/>', () => {
  it('should render ReportsPage with no errors', () => {
    const wrapper = shallow(<ReportsPage />);
  });
  it('should render `ReportsPage` in jumbotron', () => {
    const wrapper = shallow(<ReportsPage />);
    expect(wrapper.find('.jumbotron').text()).toMatch('ReportsPage');
  });
});
