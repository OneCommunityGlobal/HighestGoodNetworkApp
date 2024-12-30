import React from 'react';
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


