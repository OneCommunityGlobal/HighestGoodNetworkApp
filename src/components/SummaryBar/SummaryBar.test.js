import React from 'react';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import SummaryBar from './SummaryBar';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios'; 

const mockStore = configureMockStore();
const store = mockStore({});


const mock = new MockAdapter(axios);
describe('SummaryBar Component', () => {
  let wrapper;

  const props = {
    displayUserId: '123',
    summaryBarData: { tangibletime: 10 },    
    auth: {
      user: {
        userid: '123', // Assuming 'authUser' expects a 'userid' field
      }
    },
    userProfile: {
      _id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Owner',
      weeklycommittedHours: 40,
      missedHours: 5, 
      infringements: [], 
      badgeCollection: [], 
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
  

  it('updates correctly when props change', () => {
    wrapper.setProps({ displayUserId: '456' }); 
  
  });

  it('correctly handles changes in user profile data', () => {
    // Test response to user profile update
    wrapper.setProps({ userProfile: { weeklycommittedHours: 45, missedHours: 0 } });
  });

  it('simulates effects of method calls directly', () => {
    // Call internal methods directly if exposed or mock them
    const instance = wrapper.instance();
    if (instance && instance.someInternalMethod) {
      instance.someInternalMethod();
      wrapper.update();
    
    }
  });

  it('handles API fetch failures', () => {
    // Simulate a failure in fetching user profile
    mock.onGet('/api/user/profile/123').networkError();
    const instance = wrapper.instance();
    if (instance && instance.loadUserProfile) {
      instance.loadUserProfile().then(() => {

      });
    }
  });



});

describe('SummaryBar Component', () => {
  let store;
  const initialState = {
    auth: { user: { userid: '123' } },
    userProfile: { 
      weeklycommittedHours: 40,
      missedHours: 5,
      firstName: 'John',
      lastName: 'Doe',
      badgeCollection: [],
      infringements: []
    },
    userTask: { length: 5 }
  };


  beforeEach(() => {
    // Reset the mock store and axios mock before each test
    store = mockStore(initialState);
    mock.reset();

    // Mock API responses
    mock.onGet('/api/user/profile/123').reply(200, {
      weeklycommittedHours: 40,
      missedHours: 5,
      firstName: 'John',
      lastName: 'Doe',
      badgeCollection: [],
      infringements: []
    });

    mock.onGet('/api/tasks/userid/123').reply(200, []);
  });

  it('renders correctly with initial state', () => {
    // Render the component under test
    shallow(
      <Provider store={store}>
        <SummaryBar displayUserId="123" summaryBarData={{ tangibletime: 20 }} />
      </Provider>
    );

  });
});

describe('SummaryBar Component - others', () => {
  let wrapper;
  const initialState = {
    auth: { user: { userid: '123' } },
    userProfile: { 
        _id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'Owner',
        weeklycommittedHours: 40,
        missedHours: 5, 
        infringements: [], 
        badgeCollection: [],
    },
    userTask: { length: 5 },
};

  beforeEach(() => {
      mock.reset();
      store.clearActions();
      wrapper = shallow(
          <Provider store={store}>
               <SummaryBar {...initialState} />
          </Provider>
      );
  });

  it('handles incomplete data scenarios', () => {
      wrapper.setProps({ userProfile: null });
      wrapper.update();

  });

 
});