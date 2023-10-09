import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import OwnerMessage from '../components/OwnerMessage/OwnerMessage';

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
        0: {
          message: 'Sample Message', 
          _id: 'sampleId', 
        },
      },
      ownerStandardMessage: {
        0: {
          message: 'Sample Standard Message', 
          _id: 'standardSampleId', 
        },
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
