import React from 'react';
import { shallow } from 'enzyme';
import SummaryBar from './SummaryBar';

describe('SummaryBar Component', () => {
  let wrapper;

  const props = {
    displayUserId: '123',
    summaryBarData: { tangibletime: 10 },
    authUser: { userid: '123' },
    displayUserProfile: {
      _id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Owner',
      weeklycommittedHours: 40,
    },
    displayUserTask: [],
    hasPermission: jest.fn(),
    toggleSubmitForm: jest.fn(),
    submittedSummary: false,
  };

  beforeEach(() => {
    wrapper = shallow(<SummaryBar {...props} />);
  });

  it('should render without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should display loading when displayUserProfile and summaryBarData are undefined', () => {
    wrapper.setProps({ displayUserProfile: undefined, summaryBarData: undefined });
    expect(wrapper.text()).toEqual('Loading');
  });

  it('should display user full name', () => {
    expect(wrapper.find('CardTitle').text()).toEqual('John Doe');
  });

  it('should open bug report modal on report icon click', () => {
    wrapper.find('.sum_img').at(3).simulate('click');
    expect(wrapper.state('report')).toEqual({ in: true, information: '' });
  });

  it('should open suggestion modal on suggestion icon click', () => {
    wrapper.find('.sum_img').at(4).simulate('click');
    expect(wrapper.state('showSuggestionModal')).toBe(true);
  });

  it('should open suggestion modal and close it on consecutive clicks', () => {
    wrapper.find('.sum_img').at(4).simulate('click');
    expect(wrapper.state('showSuggestionModal')).toBe(true);
    wrapper.find('Modal').at(1).prop('toggle')();
    expect(wrapper.state('showSuggestionModal')).toBe(false);
  });

  it('should open suggestion modal with edit category form', () => {
    wrapper.find('.sum_img').at(4).simulate('click');
    expect(wrapper.state('extraFieldForSuggestionForm')).toEqual('');
    wrapper.find('Button').at(0).simulate('click');
    expect(wrapper.state('extraFieldForSuggestionForm')).toEqual('suggestion');
  });

  it('should open suggestion modal with edit field form', () => {
    wrapper.find('.sum_img').at(4).simulate('click');
    expect(wrapper.state('extraFieldForSuggestionForm')).toEqual('');
    wrapper.find('Button').at(1).simulate('click');
    expect(wrapper.state('extraFieldForSuggestionForm')).toEqual('field');
  });

  
});
