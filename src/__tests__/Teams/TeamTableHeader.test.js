import React from 'react';
import { shallow } from 'enzyme';
import TeamTableHeader from 'components/Teams/TeamTableHeader';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

describe('TeamTableHeader Component', () => {
  it('should render correctly', () => {
    const mockStore = configureStore([]);
    const store = mockStore({});

    const wrapper = shallow(
      <Provider store={store}>
        <TeamTableHeader hasPermission={() => true} />
      </Provider>,
    );

    expect(wrapper.exists()).toBe(true);
  });
});
