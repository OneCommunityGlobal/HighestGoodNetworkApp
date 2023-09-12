import React from 'react';
import { shallow } from 'enzyme';
import TeamTableHeader from 'components/Teams/TeamTableHeader';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const mockStore = configureStore([]);
const store = mockStore({});

describe('TeamTableHeader Component', () => {
  it('should render correctly', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <TeamTableHeader hasPermission={() => true} />
      </Provider>,
    );

    expect(wrapper.exists()).toBe(true);
  });

  it('should not render delete column when both deleteTeam and putTeam permissions are not available', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <TeamTableHeader hasPermission={() => false} />
      </Provider>,
    );

    expect(wrapper.find('#teams__delete')).toHaveLength(0);
  });
});
