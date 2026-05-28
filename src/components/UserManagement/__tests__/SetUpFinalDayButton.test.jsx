import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureStore } from 'redux-mock-store';
import { Provider } from 'react-redux';
import { vi } from 'vitest';

import SetUpFinalDayButton from '../SetUpFinalDayButton';
import { SET_FINAL_DAY, CANCEL } from '../../../languages/en/ui';
import { themeMock } from '../../../__tests__/mockStates';

import {
  activateUserAction,
  scheduleDeactivationAction,
} from '../../../actions/userLifecycleActions';

vi.mock('../../../actions/userLifecycleActions', () => ({
  activateUserAction: vi.fn(),
  scheduleDeactivationAction: vi.fn(),
}));

const mockStore = configureStore();

describe('SetUpFinalDayButton', () => {
  let store;
  const loadUserProfile = vi.fn();

  beforeEach(() => {
    store = mockStore({});
    vi.clearAllMocks();
  });

  const renderComponent = (props) =>
    render(
      <Provider store={store}>
        <SetUpFinalDayButton {...props} />
      </Provider>
    );

  it(`shows "${SET_FINAL_DAY}" when hasFinalDay is false`, () => {
    renderComponent({
      userProfile: { _id: '1' },
      loadUserProfile,
      hasFinalDay: false,
      darkMode: themeMock.darkMode,
    });

    expect(screen.getByText(SET_FINAL_DAY)).toBeInTheDocument();
  });

  it(`shows "${CANCEL}" when hasFinalDay is true`, () => {
    renderComponent({
      userProfile: { _id: '1' },
      loadUserProfile,
      hasFinalDay: true,
      darkMode: themeMock.darkMode,
    });

    expect(screen.getByText(CANCEL)).toBeInTheDocument();
  });

  it('opens SetUpFinalDayPopUp when clicking SET_FINAL_DAY', async () => {
    renderComponent({
      userProfile: { _id: '1' },
      loadUserProfile,
      hasFinalDay: false,
      darkMode: themeMock.darkMode,
    });

    await userEvent.click(screen.getByText(SET_FINAL_DAY));

    expect(
      screen.getByText(/set user's final day/i)
    ).toBeInTheDocument();
  });

  it('calls activateUserAction when clicking CANCEL', async () => {
    renderComponent({
      userProfile: { _id: '1' },
      loadUserProfile,
      hasFinalDay: true,
      darkMode: themeMock.darkMode,
    });

    await userEvent.click(screen.getByText(CANCEL));

    expect(activateUserAction).toHaveBeenCalledTimes(1);
  });
});
