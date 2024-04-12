import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import TriStateToggleSwitch from '../ToggleSwitch/TriStateToggleSwitch';

describe('ToggleSwitch Component', () => {
  it('renders correctly with switch type bluesquares and state false', () => {
    const { getByTestId } = render(<ToggleSwitch switchType="bluesquares" state={true} />);
    const blueSwitch = getByTestId('blue-switch');
    expect(blueSwitch).toBeInTheDocument();
    expect(blueSwitch.checked).toEqual(false);
  });



  it('renders correctly with switch type email and state true', () => {
    const { getByTestId } = render(<ToggleSwitch switchType="email" state={false} />);
    const emailSwitch = getByTestId('email-switch');
    expect(emailSwitch).toBeInTheDocument();
    expect(emailSwitch.checked).toEqual(true);
  });



  it('triggers handleUserProfile when toggle is clicked', () => {
    const handleUserProfile = jest.fn();
    const { getByTestId } = render(<ToggleSwitch switchType="phone" state={true} handleUserProfile={handleUserProfile} />);
    const phoneSwitch = getByTestId('phone-switch');
    fireEvent.click(phoneSwitch);
    expect(handleUserProfile).toHaveBeenCalledTimes(1);
  });


  it('renders an error message when an invalid switch type is provided', () => {
    const { getByText } = render(<ToggleSwitch switchType="invalid" />);
    const errorMessage = getByText('ERROR: Toggle Switch.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('triggers handleUserProfile when toggle is clicked for switch type bluesquares', () => {
    const handleUserProfile = jest.fn();
    const { getByTestId } = render(<ToggleSwitch switchType="bluesquares" state={true} handleUserProfile={handleUserProfile} />);
    const blueSwitch = getByTestId('blue-switch');
    fireEvent.click(blueSwitch);
    expect(handleUserProfile).toHaveBeenCalledTimes(1);
  });

  it('renders correctly with switch type email-subcription and state false', () => {
    const { getByTestId } = render(<ToggleSwitch switchType="email-subcription" state={false} />);
    const emailSubSwitch = getByTestId('email-subcription-switch');
    expect(emailSubSwitch).toBeInTheDocument();
    expect(emailSubSwitch.checked).toEqual(true);
  });

  it('triggers handleUserProfile when toggle is clicked for switch type email', () => {
    const handleUserProfile = jest.fn();
    const { getByTestId } = render(<ToggleSwitch switchType="email" state={true} handleUserProfile={handleUserProfile} />);
    const emailSwitch = getByTestId('email-switch');
    fireEvent.click(emailSwitch);
    expect(handleUserProfile).toHaveBeenCalledTimes(1);
  });

  it('triggers handleUserProfile when toggle is clicked for switch type bluesquares', () => {
    const handleUserProfile = jest.fn();
    const { getByTestId } = render(<ToggleSwitch switchType="bluesquares" state={true} handleUserProfile={handleUserProfile} />);
    const blueSwitch = getByTestId('blue-switch');
    fireEvent.click(blueSwitch);
    expect(handleUserProfile).toHaveBeenCalledTimes(1);
  });

  it('triggers handleUserProfile when toggle is clicked for switch type visible', () => {
    const handleUserProfile = jest.fn();
    const { getByTestId } = render(<ToggleSwitch switchType="visible" state={true} handleUserProfile={handleUserProfile} />);
    const visibilitySwitch = getByTestId('visibility-switch');
    fireEvent.click(visibilitySwitch);
    expect(handleUserProfile).toHaveBeenCalledTimes(1);
  });

  it('triggers handleUserProfile when TriStateToggleSwitch is clicked for switch type bio', () => {

    const handleUserProfile = jest.fn();

    const { container } = render(
      <TriStateToggleSwitch pos="default" onChange={handleUserProfile} />
    );

    const postedArea = container.querySelector('.knob-area > div:nth-child(1)');
    const defaultArea = container.querySelector('.knob-area > div:nth-child(2)');
    const requestedArea = container.querySelector('.knob-area > div:nth-child(3)');

    fireEvent.click(requestedArea);

    expect(handleUserProfile).toHaveBeenCalledWith('requested');
  });



  it('triggers handleUserProfile when toggle is clicked for switch type active_members', () => {
    const handleUserProfile = jest.fn();
    const { getByTestId } = render(<ToggleSwitch switchType="active_members" state={true} handleUserProfile={handleUserProfile} />);
    const activeSwitch = getByTestId('active-switch');
    fireEvent.click(activeSwitch);
    expect(handleUserProfile).toHaveBeenCalledTimes(1);
  });

  const handleUserProfile = jest.fn();
  it('renders correctly with switch type bluesquares and state ', () => {
    const { container } = render(<ToggleSwitch switchType="bluesquares" state={false} handleUserProfile={handleUserProfile} />);
    const blueSwitch = container.querySelector('#blueSquaresPubliclyAccessible');
    expect(blueSwitch).toBeInTheDocument();
    expect(blueSwitch.checked).toBe(true);
  });

});


