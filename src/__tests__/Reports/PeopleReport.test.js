import PeopleReport from '../../components/Reports/PeopleReport/PeopleReport.jsx';


import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux'; // Import your Redux store creation code
import { shallow } from 'enzyme';
import PeopleReport from '../path/to/PeopleReport'; // Replace with the actual path

describe('PeopleReport Component', () => {
  let store;
  
  beforeAll(() => {
    // Create a Redux store or mock one depending on your application
    // Replace 'yourReducer' with your actual reducer function
    store = createStore(yourReducer);
  });

  it('should render without errors', () => {
    const props = {
      userProfile: {}, // Define necessary user profile data for testing
      userTask: [],
      userProjects: {},
      auth: {
        user: {
          role: 'Administrator', // Set the user role for testing
        },
      },
    };

    const wrapper = shallow(
      <Provider store={store}>
        <PeopleReport {...props} />
      </Provider>
    );

    // Your assertions for the component
    expect(wrapper.exists()).toBe(true);
    // You can add more specific assertions as needed
  });
});
