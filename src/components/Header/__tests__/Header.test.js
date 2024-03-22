import React from 'react';
import { shallow } from 'enzyme'; 
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { BrowserRouter as Router } from 'react-router-dom';
import { Header } from '../Header'; 


const mockStore = configureMockStore();

describe('Header Component', () => {
  let store;
  const mockStore = configureMockStore([]);
  const initialState = {
    auth: {
      isAuthenticated: true,
      user: {
        userid: '123',
        role: 'Owner',
        firstName: 'John',
        profilePic: '/path/to/image.jpg',
      },
    },
    userProfile: {
      email: 'test@example.com',
    },
    taskEditSuggestionCount: 0,
    role: {
      roles: [],
    },
  };
  beforeEach(() => {
    store = mockStore(initialState);
  });

  it('renders without crashing', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    expect(wrapper.exists()).toBe(true);
  });

  it('displays the welcome message correctly', () => {
    const wrapper =shallow(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
    console.log(wrapper.text());

    expect(wrapper.text()).toContain('Welcome, John');
  });

  it('renders elements based on permissions', () => {
    // Assuming hasPermission mock is set up to return true for certain permissions
  
    // Check for User Management link based on permissions
    const userManagementLink = component.findWhere(node => node.type() === 'NavLink' && node.props().to === '/usermanagement');
    expect(userManagementLink.exists()).toBe(true); // Adjust based on actual permissions
  
  });

});


describe('Header Component volunteer', () => {
  it('renders correctly for a volunteer', () => {
    const mockHasPermission = (permission) => {
      const permissions = {
        getReports: false,
        getWeeklySummaries: false,
        postUserProfile: false,
        seeBadges: false,
        createPopup: false,
        updatePopup: false,
      };
      return permissions[permission] || false;
    };
    const initialState = {
      auth: {
        isAuthenticated: true,
        user: {
          userid: 'volunteerUserId',
          role: 'Volunteer',
        },
      },
      //userProfile: '',
      taskEditSuggestionCount: 0,
      role:{roles:[],},
    };
    const store = mockStore(initialState);
    const wrapper = shallow(
      <Provider store={store}>
        <Router>
          <Header  hasPermission={mockHasPermission}/>
        </Router>
      </Provider>
    );  
  });
});



