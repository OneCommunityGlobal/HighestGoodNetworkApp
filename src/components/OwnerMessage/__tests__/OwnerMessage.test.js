import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import OwnerMessage from '../OwnerMessage';

describe('OwnerMessage Component', () => {
  const mockStore = configureStore(); 

  it('should render without errors', () => {
    const initialState = {
      auth: {
        user: {
          role: 'Owner', 
        },
      },
      ownerMessage: {
        message: 'Sample Message', 
        standardMessage: 'Sample Standard Message', 
      },
    };

    // Create a mock store with initial state
    const store = mockStore(initialState); 
    const wrapper = shallow(<OwnerMessage store={store} />); 

    // Access the connected component from the wrapper
    const connectedComponent = wrapper.dive();

    // Your assertions for the connected component
    expect(connectedComponent.exists()).toBe(true);
  });
});
