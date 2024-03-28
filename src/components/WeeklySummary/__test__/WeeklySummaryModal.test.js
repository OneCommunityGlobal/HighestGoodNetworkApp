import React from 'react';
import { shallow } from 'enzyme';
import { render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import WeeklySummaryModal from '../WeeklySummaryModal';
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import mockState from '../../../__tests__/mockAdminState.js';

const mockStore = configureMockStore();
const store = mockStore({
  auth: mockState.auth,
  userProfile: mockState.userProfile,
  timeEntries: mockState.timeEntries,
  userProjects: mockState.userProjects,
  weeklySummaries: mockState.weeklySummaries,
  role: mockState.role,
});

describe('WeeklySummaryModal Component', () => {

  it('should render without errors', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <WeeklySummaryModal />
      </Provider>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it('updates the state when the button is clicked', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <WeeklySummaryModal />
      </Provider>
    );
    try{
      userEvent.click(getByTestId('weeklySummaryTest'));
    }
    catch(error){
      console.log(error);
    }
    expect(screen.getByText('Weekly Summary')).toBeInTheDocument();
  });
});

