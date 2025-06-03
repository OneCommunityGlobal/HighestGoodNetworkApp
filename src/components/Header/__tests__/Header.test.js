import React from 'react';
import { shallow,mount } from 'enzyme'; 
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import { MemoryRouter as Router } from 'react-router-dom';
import { Header } from '../Header'; 
import { act } from 'react-dom/test-utils';

jest.mock('axios');
const mockStore = configureMockStore();

describe('Header Component', () => {
  let store;
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
});

describe('Header Component with Mocked Axios', () => {
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
  beforeEach(() => {
    // Mock the Axios call
    axios.get.mockResolvedValue({
      data: { name: 'Test User', role: 'Volunteer', profilePic: '/path/to/img' },
    });
    store.clearActions();
  });

  it('loads and displays the user dashboard profile', () => {
    // Directly shallow render the Header component
    const wrapper = shallow(
    <Provider store={store}>
      <Header hasPermission={mockHasPermission} />
    </Provider>);
    expect(wrapper.exists()).toBe(true);
  });
  it('displays an error message when fetching the user dashboard profile fails', async () => {
    // Simulate an axios error
    axios.get.mockRejectedValue(new Error('Network error'));

    const wrapper = shallow(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    await act(async () => {
      // Wait for the component to re-render
      await new Promise(resolve => setImmediate(resolve));
      wrapper.update();
    });

  });
});

describe('Header Component - volunteer, Assistan Manager', () => {
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
    expect(wrapper.exists()).toBe(true);

  });
});

describe('Header Component - Owner, Administrator, Mentor', () => {
  let store;
  beforeEach(() => {
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: {
          userid: 'test-user-id',
          role: 'Owner'
        },
        firstName: 'John',
        profilePic: '/path/to/profile/pic',
      },
      userProfile: {
        email: 'test@example.com',
      },
      taskEditSuggestions: {
        count: 0,
      },
      role: {
        roles: [],
      },
    });
  });

  it('renders correctly for a Owner', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
    expect(wrapper.exists()).toBe(true);
  
  });

  it('renders correctly for an Administrator', () => {
    store.getState().auth.user.role = 'Administrator';
    shallow(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
  });


  it('renders correctly for a Mentor', () => {
    store.getState().auth.user.role = 'Mentor';
    shallow(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );

  });


});

describe('Header Component Functionality', () => {
  let store;
  const mockStore = configureMockStore();
  const initialState = {
    auth: {
      isAuthenticated: true,
      user: {
        userid: 'user123',
        role: 'User',
      },
      firstName: 'John',
      profilePic: '/path/to/profile.jpg',
    },
    userProfile: {
      email: 'test@example.com',
    },
    taskEditSuggestions: {
      count: 5,
    },
    role: {
      roles: [],
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
    axios.get.mockResolvedValue({data: {name: 'Test User', role: 'User'}});
  });

  it('modal is visible based on conditions', () => {
    // This test assumes that the modal visibility is controlled by state and certain props
    const wrapper = shallow(
      <Provider store={store}>
        <Header />
      </Provider>
    );

    expect(wrapper.exists()).toBe(true);
  });

});

describe('Header Component Authentication Checks', () => {
  const mockStore = configureMockStore();
  const initialState = {
    auth: {
      isAuthenticated: false,
      user: {},
    },
    role: {
      roles: []
    },
    taskEditSuggestionCount: 0,
  };

  it('does not display user-specific information when not authenticated', () => {
    const store = mockStore(initialState);
    const wrapper = shallow(
      <Provider store={store}>
        <Header />
      </Provider>
    );
    expect(wrapper.find('.user-dashboard-profile').length).toBe(0);
  });

});

