// eslint-disable-next-line no-unused-vars
import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
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
      theme: themeMock,
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
