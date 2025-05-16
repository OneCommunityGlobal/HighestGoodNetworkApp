import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import axios from 'axios';
import { themeMock } from '../../../__tests__/mockStates';
import SetUpFinalDayButton from '../SetUpFinalDayButton';
import { SET_FINAL_DAY, CANCEL } from '../../../languages/en/ui';
// import { updateUserFinalDayStatus } from '../../../actions/userManagement.js';

jest.mock('axios');

const mockToastSuccess = jest.fn();

beforeAll(() => {
  jest.mock('react-toastify', () => ({
    toast: { success: mockToastSuccess },
  }));
});

const mockStore = configureStore();

// const userProfileUrl = ENDPOINTS.USER_PROFILE(mockState.auth.user.userid);

describe('SetUpFinalDayButton', () => {
  const store = mockStore({
    theme: themeMock,
  });
  const renderSetUpFinalDayButton = props => {
    render(
      <Provider store={store}>
        <SetUpFinalDayButton {...props} />
      </Provider>,
    );
  };

  describe('useEffect tests', () => {
    let props;

    it(`If user profile end date is not set, then button text is ${SET_FINAL_DAY}`, () => {
      props.userProfile.endDate = undefined;
      renderSetUpFinalDayButton(props);

      // Renders with SET_FINAL_DAY text
      expect(screen.getByText(SET_FINAL_DAY)).toBeInTheDocument();
    });

    it(`If user profile end date is set, then button text is ${CANCEL}`, () => {
      renderSetUpFinalDayButton(props);

      // Renders with CANCEL text
      expect(screen.getByText(CANCEL)).toBeInTheDocument();
    });

    beforeEach(() => {
      props = {
        userProfile: {
          endDate: 'mockEndDate',
        },
        loadUserProfile: jest.fn(),
        isBigBtn: true,
        darkMode: themeMock.darkMode,
      };
    });
  });

  describe('onFinalDayClick tests ', () => {
    let props;

    const finalDayDeletedMessage = "This user's final day has been deleted.";
    it(`If isSet is true, then an alert will appear with message: ${finalDayDeletedMessage}`, async () => {
      renderSetUpFinalDayButton(props);
      const mockedResponse = { data: { status: 200 } };
      axios.patch.mockResolvedValue(mockedResponse);

      const cancelFinalDayButton = screen.getByText(CANCEL);
      fireEvent.click(cancelFinalDayButton);

      // Clicking CANCEL button calls final day deleted toast
      waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(finalDayDeletedMessage);
      });
    });

    it('If isSet is false then SetUpFinalDayPopUp will be present', async () => {
      props.userProfile.endDate = undefined;

      renderSetUpFinalDayButton(props);
      fireEvent.click(screen.getByText(SET_FINAL_DAY));
      const setYourFinalDayElement = await screen.findByText('Set Your Final Day');

      // Clicking SET_FINAL_DAY button causes popup to appear
      await waitFor(() => expect(setYourFinalDayElement).toBeInTheDocument());
    });

    it('setUpFinalDayPopupClose should close SetUpFinalDayPopUp', async () => {
      props.userProfile.endDate = undefined;

      renderSetUpFinalDayButton(props);
      fireEvent.click(screen.getByText(SET_FINAL_DAY));
      const setYourFinalDayElement = await screen.findByText('Set Your Final Day');
      // Popup is open
      await waitFor(() => expect(setYourFinalDayElement).toBeInTheDocument());

      const closeFinalDayPopup = screen.getByText('Close');
      fireEvent.click(closeFinalDayPopup);

      // Clicking close on popup closes it (popup uses function defined in button element)
      await waitFor(() => expect(setYourFinalDayElement).not.toBeInTheDocument());
    });

    const finalDaySetMessage = "This user's final day has been set.";
    it(`When deactiveUser is called by child component, popup should close and alert will appear with following text: ${finalDaySetMessage}`, async () => {
      props.userProfile.endDate = undefined;

      renderSetUpFinalDayButton(props);
      fireEvent.click(screen.getByText(SET_FINAL_DAY));
      // Popup is open
      const setYourFinalDayElement = await screen.findByText('Set Your Final Day');
      await waitFor(() => expect(setYourFinalDayElement).toBeInTheDocument());

      const dateInput = screen.getByTestId('date-input');
      fireEvent.change(dateInput, { target: { value: '12-07-2019' } });
      const saveFinalDayPopup = screen.getByText('Save');
      fireEvent.click(saveFinalDayPopup);

      // When final day is set, expect toast to be called with appropriate message
      waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(finalDaySetMessage);
      });
    });

    beforeEach(() => {
      props = {
        userProfile: {
          endDate: '20210311',
          _id: '1',
        },
        loadUserProfile: jest.fn().mockReturnValueOnce(200),
        isBigBtn: true,
        darkMode: themeMock.darkMode,
      };
    });
  });
});
