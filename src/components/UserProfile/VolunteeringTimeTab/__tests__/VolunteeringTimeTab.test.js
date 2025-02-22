import React from 'react';
import axios from 'axios';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { StartDate, WeeklyCommittedHours, MissedHours } from '../VolunteeringTimeTab';
import ViewTab from '../VolunteeringTimeTab';
import { ENDPOINTS } from 'utils/URL';
import MockAdapter from 'axios-mock-adapter';
const mock = new MockAdapter(axios);

const userProfile = {
  _id: '12345',
  startDate: '2023-10-09',
  endDate: '2023-10-10',
  createdDate: '2023-01-01',
  weeklycommittedHours: 40,
  missedHours: 0,
  totalIntangibleHrs: 5,
  hoursByCategory: { design: 10, development: 20 }
};

const startOfWeek = '2023-10-01';
const endOfWeek = '2023-10-07';
const createdDate = '2023-01-01';
const today = '2023-10-10';

beforeAll(() => {
  window.alert = jest.fn(); // Mock the alert function
});
beforeEach(() => {
  mock.reset();  // Clear previous mocks

  mock.onGet(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, startOfWeek, endOfWeek)).reply(200, { data: 'mock data' });
  mock.onGet(ENDPOINTS.TIME_ENTRIES_PERIOD(userProfile._id, createdDate, today)).reply(200, { data: 'mock data' });
});


describe('Date and Hours Input Validations', () => {

  test('StartDate component should correctly validate and display a success style if the start date is before the end date', () => {
    const userProfile = {
      startDate: '2023-10-09',
      endDate: '2023-10-10',
      createdDate: '2023-01-01'
    };
    const setUserProfile = jest.fn();
    const onStartDateComponent = jest.fn();
    render(
      <StartDate
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        canEdit={true}
        onStartDateComponent={onStartDateComponent}
        darkMode={false}
      />
    );
    const startDateInput = document.getElementById('startDate');
    expect(startDateInput).toHaveClass('form-control');
  });

  // StartDate component should handle the case when the start date is null or undefined
  test('StartDate component should handle the case when the start date is null or undefined', () => {
    const userProfile = {
      startDate: null,
      endDate: '2023-10-10',
      createdDate: '2023-01-01'
    };
    const setUserProfile = jest.fn();
    const onStartDateComponent = jest.fn();
    const { getByPlaceholderText } = render(
      <StartDate
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        canEdit={true}
        onStartDateComponent={onStartDateComponent}
        darkMode={false}
      />
    );
    const startDateInput = getByPlaceholderText('Start Date');
    expect(startDateInput).not.toHaveClass('border-error-validation');
  });
  test('StartDate component should correctly validate and display an error style if the start date is after the end date', () => {
    const userProfile = {
      startDate: '2023-10-10',
      endDate: '2023-10-09',
      createdDate: '2023-01-01'
    };
    const setUserProfile = jest.fn();
    const onStartDateComponent = jest.fn();
    const { getByPlaceholderText } = render(
      <StartDate
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        canEdit={true}
        onStartDateComponent={onStartDateComponent}
        darkMode={false}
      />
    );
    const startDateInput = getByPlaceholderText('Start Date');
    expect(startDateInput).toHaveClass('border-error-validation');
  });


  test('WeeklyCommittedHours component should handle the case when the entered value is equal to the defined maximum', () => {
    const userProfile = { weeklycommittedHours: 10 };
    const setUserProfile = jest.fn();
    const { getByTestId } = render(
      <WeeklyCommittedHours
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        canEdit={true}
        darkMode={false}
      />
    );
    const input = getByTestId('weeklycommittedHours');
    fireEvent.change(input, { target: { value: '40' } });
    expect(setUserProfile).toHaveBeenCalledWith({
      ...userProfile,
      weeklycommittedHours: 40
    });
  });

  test('WeeklyCommittedHours component should prevent users from entering hours beyond the defined maximum or below the minimum', () => {
    const userProfile = { weeklycommittedHours: 10 };
    const setUserProfile = jest.fn();
    const { getByTestId } = render(
      <WeeklyCommittedHours
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        canEdit={true}
        darkMode={false}
      />
    );
    const input = getByTestId('weeklycommittedHours');
    fireEvent.change(input, { target: { value: '200' } });
    expect(setUserProfile).toHaveBeenCalledWith({
      ...userProfile,
      weeklycommittedHours: 168
    });
    fireEvent.change(input, { target: { value: '-10' } });
    expect(setUserProfile).toHaveBeenCalledWith({
      ...userProfile,
      weeklycommittedHours: 0
    });
  });


  test('MissedHours component should handle the case when userProfile.missedHours is null or undefined', () => {
    const userProfile = {
      missedHours: null
    };
    const setUserProfile = jest.fn();
    const { getByTestId } = render(
      <MissedHours
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        canEdit={true}
        darkMode={false}
      />
    );
    const missedHoursText = getByTestId('missedHours');
    expect(missedHoursText.textContent).toBe('');
  });

  test('MissedHours component should display the missed hours if the user cannot edit', () => {
    const userProfile = { missedHours: 10 };
    const setUserProfile = jest.fn();
    const { getByText } = render(
      <MissedHours
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        canEdit={false}
        darkMode={false}
      />
    );
    const missedHoursText = getByText('10');
    expect(missedHoursText).toBeInTheDocument();
  });
  test('MissedHours component should only allow non-negative values for additional make-up hours', () => {
    const userProfile = { missedHours: 5 };
    const setUserProfile = jest.fn();
    const { getByTestId } = render(
      <MissedHours
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        canEdit={true}
        darkMode={false}
      />
    );
    const input = getByTestId('missedHours');
    fireEvent.change(input, { target: { value: '-1' } });
    expect(setUserProfile).toHaveBeenCalledWith({
      ...userProfile,
      missedHours: 0
    });
  });

});
describe('ViewTab component and all child components', () => {
  test('ViewTab component and all child components should render correctly', () => {
    const userProfile = {
      startDate: '2023-10-09',
      endDate: '2023-10-10',
      createdDate: '2023-01-01',
      weeklycommittedHours: 40,
      missedHours: 0,
      totalIntangibleHrs: 5,
      hoursByCategory: { design: 10, development: 20 }
    };
    const setUserProfile = jest.fn();
    const role = 'Admin';
    const canEdit = true;
    const darkMode = false;
    const onStartDate = jest.fn();
    const onEndDate = jest.fn();
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <ViewTab
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        role={role}
        canEdit={canEdit}
        darkMode={darkMode}
        onStartDate={onStartDate}
        onEndDate={onEndDate}
      />
    );

    expect(getByText('Account Created Date')).toBeInTheDocument();
    expect(getByText('Start Date')).toBeInTheDocument();
    expect(getByPlaceholderText('Start Date')).toBeInTheDocument();
    expect(getByText('End Date')).toBeInTheDocument();
    expect(getByText('Total Tangible Hours This Week')).toBeInTheDocument();
    expect(getByText('Weekly Summary Options')).toBeInTheDocument();
    expect(getByText('Weekly Committed Hours')).toBeInTheDocument();
    expect(getByTestId('weeklycommittedHours')).toBeInTheDocument();
    expect(getByText('Total Intangible Hours')).toBeInTheDocument();
    expect(getByText('Total Tangible Hours')).toBeInTheDocument();
    expect(getByText('Total Tangible Design Hours')).toBeInTheDocument();
    expect(getByText('Total Tangible Development Hours')).toBeInTheDocument();
  });

  test('ViewTab component and all child components should render correctly in dark mode', () => {
    const userProfile = {
      startDate: '2023-10-09',
      endDate: '2023-10-10',
      createdDate: '2023-01-01',
      weeklycommittedHours: 40,
      missedHours: 0,
      totalIntangibleHrs: 5,
      hoursByCategory: { 'design': 10, 'development': 20 },
    };
    const setUserProfile = jest.fn();
    const onStartDate = jest.fn();
    const onEndDate = jest.fn();
    const loadUserProfile = jest.fn();

    const { getByTestId, getByPlaceholderText, getByText } = render(
      <ViewTab
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        role="Member"
        canEdit={true}
        darkMode={true}
        onStartDate={onStartDate}
        onEndDate={onEndDate}
        loadUserProfile={loadUserProfile}
      />
    );

    expect(getByTestId('volunteering-time-tab')).toBeInTheDocument();
    expect(getByPlaceholderText('Start Date')).toBeInTheDocument();
    expect(getByPlaceholderText('End Date')).toBeInTheDocument();
    expect(getByText('Total Tangible Hours This Week')).toBeInTheDocument();
    expect(getByTestId('weeklycommittedHours')).toBeInTheDocument();
    expect(getByTestId('totalIntangibleHours')).toBeInTheDocument();

    expect(getByText('Start Date').classList).toContain('text-light');
    expect(getByText('End Date').classList).toContain('text-light');
    expect(getByText('Total Tangible Hours This Week').classList).toContain('text-light');
  });
});
=======
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import VolunteeringTimeTab from '../VolunteeringTimeTab';
import { authMock, userProfileMock, rolesMock, themeMock } from '../../../../__tests__/mockStates';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { renderWithProvider } from '../../../../__tests__/utils.js';

jest.mock('axios');

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

describe('VolunteeringTimeTab Component', () => {
  let store;
  let props;
  const mockStore = configureStore([thunk]);

  beforeEach(() => {
    store = mockStore({
      auth: authMock,
      userProfile: userProfileMock,
      role: rolesMock,
      theme: themeMock,
    });

    props = {
      userProfile: userProfileMock,
      setUserProfile: jest.fn(),
      role: rolesMock,
      canEdit: true,
      canUpdateSummaryRequirements: true,
      darkMode: false,
      onStartDate: jest.fn(),
      onEndDate: jest.fn(),
      loadUserProfile: jest.fn(),
    };

    axios.get.mockResolvedValue({
      data: {
        hoursByCategory: {
          education: 10,
          society: 20,
          energy: 15,
          food: 12,
          housing: 8,
        },
        weeklycommittedHours: 40,
      },
    });
  });

  it('renders without crashing', async () => {
    await act(async () => {
      renderWithProvider(<VolunteeringTimeTab {...props} />, { store });
    });
    expect(screen.getByTestId('volunteering-time-tab')).toBeInTheDocument();
  });

  it('displays the correct Total Tangible Education Hours', async () => {
    await act(async () => {
      renderWithProvider(<VolunteeringTimeTab {...props} />, { store });
    });
    const input1 = screen.getByPlaceholderText('Total Tangible Education Hours');
    expect(input1).toHaveValue(userProfileMock.hoursByCategory.education);
  });

  it('displays the correct Total Tangible Society Hours', async () => {
    await act(async () => {
      renderWithProvider(<VolunteeringTimeTab {...props} />, { store });
    });
    const input2 = screen.getByPlaceholderText('Total Tangible Society Hours');
    expect(input2).toHaveValue(userProfileMock.hoursByCategory.society);
  });

  it('displays the correct Total Tangible Energy Hours', async () => {
    await act(async () => {
      renderWithProvider(<VolunteeringTimeTab {...props} />, { store });
    });
    const input3 = screen.getByPlaceholderText('Total Tangible Energy Hours');
    expect(input3).toHaveValue(userProfileMock.hoursByCategory.energy);
  });

  it('displays the correct Total Tangible Food Hours', async () => {
    await act(async () => {
      renderWithProvider(<VolunteeringTimeTab {...props} />, { store });
    });
    const input4 = screen.getByPlaceholderText('Total Tangible Food Hours');
    expect(input4).toHaveValue(userProfileMock.hoursByCategory.food);
  });

  it('displays the correct Total Tangible Housing Hours', async () => {
    await act(async () => {
      renderWithProvider(<VolunteeringTimeTab {...props} />, { store });
    });
    const input5 = screen.getByPlaceholderText('Total Tangible Housing Hours');
    expect(input5).toHaveValue(userProfileMock.hoursByCategory.housing);
  });

  it('displays the correct Weekly Committed Hours', async () => {
    await act(async () => {
      renderWithProvider(<VolunteeringTimeTab {...props} />, { store });
    });
    const input6 = screen.getByPlaceholderText('Weekly Committed Hours');
    expect(input6).toHaveValue(userProfileMock.weeklycommittedHours);
  });
});


