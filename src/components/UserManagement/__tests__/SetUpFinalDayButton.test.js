import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import { Provider } from 'react-redux';
import axios from 'axios';
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
  let renderSetUpFinalDayButton = props => {
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
      expect(screen.getByText(SET_FINAL_DAY)).toBeInTheDocument();
    });

    it(`If user profile end date is set, then button text is ${CANCEL}`, () => {
      renderSetUpFinalDayButton(props);
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

  describe('onFinalDayClick tests', () => {
    let props;

    it('If isSet is true, then an alert will appear', async () => {
      renderSetUpFinalDayButton(props);
      const mockedResponse = { data: { status: 200 } };
      axios.patch.mockResolvedValue(mockedResponse);

      const message = "This user's final day has been deleted.";

      const cancelFinalDayButton = screen.getByText(CANCEL);
      fireEvent.click(cancelFinalDayButton);
      waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(message);
      });
    });

    it('If isSet is false then SetUpFinalDayPopUp will be present', async () => {
      props.userProfile.endDate = undefined;

      renderSetUpFinalDayButton(props);
      fireEvent.click(screen.getByText(SET_FINAL_DAY));
      const setYourFinalDayElement = await screen.findByText('Set Your Final Day');
      await waitFor(() => expect(setYourFinalDayElement).toBeInTheDocument());
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
