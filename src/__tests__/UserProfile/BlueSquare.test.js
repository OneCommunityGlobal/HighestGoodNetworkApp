import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authMock, userProfileMock, timeEntryMock, userProjectMock } from '../mockStates';
import BlueSquare from '../../components/UserProfile/BlueSquares';

describe('blue squre is user admin', () => {
  const handleBlueSquare = jest.fn();
  beforeEach(() => {
    render(
      <BlueSquare
        blueSquares={userProfileMock.infringments}
        handleBlueSquare={handleBlueSquare}
        isUserAdmin
      />,
    );
  });
  it('should render infrigments.length bluesquares', () => {
    expect(screen.getAllByRole('button')).toHaveLength(userProfileMock.infringments.length);
  });
  it('should produce infringments.length reports', () => {
    expect(screen.getAllByTestId('report')).toHaveLength(userProfileMock.infringments.length);
  });
  it('should fire handleBlueSquare once the user clicks ', () => {
    userEvent.click(screen.getAllByRole('button')[0]);
    expect(handleBlueSquare).toHaveBeenCalled();
  });
  it('should fire handleBlueSquare once the user clicks ', () => {
    userEvent.click(screen.getAllByRole('button')[2]);
    expect(handleBlueSquare).toHaveBeenCalled();
  });
  it('should have a + button', () => {
    expect(screen.getByText('+')).toBeInTheDocument();
  });
  it('should fire handleBlueSquare to add blue square once the admin user click +', () => {
    userEvent.click(screen.getByText('+'));
    expect(handleBlueSquare).toHaveBeenCalled();
  });
});

describe('blue square is not user admin', () => {
  const handleBlueSquare = jest.fn();
  beforeEach(() => {
    render(
      <BlueSquare
        blueSquares={userProfileMock.infringments}
        handleBlueSquare={handleBlueSquare}
        isUserAdmin={false}
      />,
    );
  });
  it('should not render the + button', () => {
    expect(screen.queryByText('+')).toBeFalsy();
  });
  //it('should fire handleBlueSquare to view the blue square once the user click',() =>{
  //  userEvent.click(screen.getByTestId('addBlueSquare'));
  //  expect(handleBlueSquare).toHaveBeenCalled();
  //});
});
