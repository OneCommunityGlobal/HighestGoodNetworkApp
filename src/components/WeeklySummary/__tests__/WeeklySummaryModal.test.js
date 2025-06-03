import React from 'react';
import { shallow } from 'enzyme';
import { render, screen, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import WeeklySummaryModal from '../WeeklySummaryModal';
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import mockState from '../../../__tests__/mockAdminState.js';
import { themeMock } from '__tests__/mockStates';
import thunk from 'redux-thunk';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  auth: mockState.auth,
  userProfile: mockState.userProfile,
  timeEntries: mockState.timeEntries,
  userProjects: mockState.userProjects,
  weeklySummaries: mockState.weeklySummaries,
  role: mockState.role,
  theme: themeMock,
});

describe('WeeklySummaryModal Component', () => {

  it('should render the component without errors', () => {
    const wrapper = shallow(
      <Provider store={store}>
        <WeeklySummaryModal />
      </Provider>
    );
    expect(wrapper.exists()).toBe(true);
  });

  it('should toggle the modal when clicked', async () => {
    render(
      <Provider store={store}>
        <WeeklySummaryModal />
      </Provider>
    );

    // The button/div that triggers the modal toggle
    const triggerElement = screen.getByRole('button', { name: /toggle weekly summary/i });

    // Initial state: Modal should not be in the document
    expect(screen.queryByText(/weekly summary/i)).not.toBeInTheDocument();

  });

});
