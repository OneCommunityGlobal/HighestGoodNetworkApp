import React from 'react';
import { shallow,mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import SummaryBar from './SummaryBar';

const mockStore = configureMockStore();
const store = mockStore({});

describe('SummaryBar Component', () => {
  let wrapper;

  const props = {
    displayUserId: '123',
    summaryBarData: { tangibletime: 10 },    
    auth: {
      user: {
        userid: '123', // Assuming 'authUser' expects a 'userid' field
        // Include other necessary user details based on your application's requirements
      }
    },
    userProfile: {
      _id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Owner',
      weeklycommittedHours: 40,
      missedHours: 5, // Assuming there could be missed hours to be added to 'weeklycommittedHours'
      infringements: [], // Assuming this could be an array of infringements
      badgeCollection: [], // Assuming this could be an array of badges
      // Add other fields as necessary based on your component's use of 'displayUserProfile'
    },
    userTask: [],
    hasPermission: jest.fn(),
    toggleSubmitForm: jest.fn(),
    submittedSummary: false,

  };

  beforeEach(() => {
    wrapper = shallow(
      <Provider store={store}>
        <SummaryBar {...props} />
      </Provider>
    );
  });

  it('should render without crashing', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should display loading when displayUserProfile and summaryBarData are undefined', () => {
    wrapper.setProps({ displayUserProfile: undefined, summaryBarData: undefined });
    expect(wrapper.text()).toEqual('');
  });

  it('should display user full name', () => {
    const wrapper = mount(
      <Provider store={store}>
        <SummaryBar {...props} />
      </Provider>
    );
    expect(wrapper.find('CardTitle').text()).toContain('John Doe');
  });

  it('should open bug report modal on report icon click', () => {
    wrapper.find('.report_icon.png').at(3).simulate('click');
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
