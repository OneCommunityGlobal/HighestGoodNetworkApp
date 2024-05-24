import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';
import { Provider } from 'react-redux';
import SetUpFinalDayButton from '../SetUpFinalDayButton';
import { SET_FINAL_DAY, CANCEL } from '../../../languages/en/ui';
import { updateUserFinalDayStatus } from '../../../actions/userManagement.js';
import axios from 'axios';

jest.mock('react-toastify');
jest.mock('axios', () => {
  return {
    patch: jest.fn(() => Promise.resolve({ data: { status: 200 } })),
  };
});
const mockStore = configureStore([]);

// const userProfileUrl = ENDPOINTS.USER_PROFILE(mockState.auth.user.userid);

describe('SetUpFinalDayButton', () => {
  let renderSetUpFinalDayButton = props => {
    const store = mockStore({
      theme: themeMock,
    });

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

    // it('If isSet is true, then an alert will apear', async () => {
    //   renderSetUpFinalDayButton(props);
    //   fireEvent.click(screen.getByText(CANCEL));

    //   // expect(await screen.findByRole('dialog')).toBeInTheDocument();
    //   await waitFor(
    //     async () =>
    //       expect(
    //         await screen.findByText("This user's final day has been deleted."),
    //       ).toBeInTheDocument(),
    //     { timeout: 1000 },
    //   );
    // });

    it('If isSet is false then SetUpFinalDayPopUp will be present', async () => {
      console.log(axios.patch('', {}));
      props.userProfile.endDate = undefined;

      renderSetUpFinalDayButton(props);
      fireEvent.click(screen.getByText(SET_FINAL_DAY));
      await waitFor(async () =>
        expect(await screen.findByText('Set Your Final Day')).toBeInTheDocument(),
      );
    });

    beforeEach(() => {
      props = {
        userProfile: {
          endDate: 'mockEndDate',
        },
        loadUserProfile: jest.fn().mockReturnValueOnce(200),
        isBigBtn: true,
        darkMode: themeMock.darkMode,
      };
    });
  });
});
