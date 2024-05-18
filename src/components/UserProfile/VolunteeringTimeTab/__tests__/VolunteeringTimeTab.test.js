import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ViewTab, StartDate, WeeklyCommittedHours, MissedHours } from '../VolunteeringTimeTab';

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
