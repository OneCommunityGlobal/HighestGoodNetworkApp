import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Countdown from '../Countdown'; 

describe('Countdown Component', () => {
  const defaultProps = {
    message: {
      started: false,
      goal: 3600000, // 1 hour in milliseconds
      initialGoal: 3600000,
    },
    timerRange: {
      MAX_HOURS: 24,
      MIN_MINS: 1,
    },
    running: false,
    wsMessageHandler: {
      sendPause: jest.fn(),
      sendSetGoal: jest.fn(),
    },
    remaining: 1800000, // 30 minutes in milliseconds
    setConfirmationResetModal: jest.fn(),
    checkBtnAvail: jest.fn(() => true),
    handleStartButton: jest.fn(),
    handleAddButton: jest.fn(),
    handleSubtractButton: jest.fn(),
    handleStopButton: jest.fn(),
    toggleTimer: jest.fn(),
  };

  it('renders the countdown component with the correct initial values', () => {
    render(<Countdown {...defaultProps} />);
    expect(screen.getByText('Goal: 01:00:00')).toBeInTheDocument();
    expect(screen.getByText('Elapsed: 00:30:00')).toBeInTheDocument();
    expect(screen.getByText('Time Remaining')).toBeInTheDocument();
    expect(screen.getByText('00')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('calls toggleTimer when the close button is clicked', () => {
    render(<Countdown {...defaultProps} />);
    const closeButton = screen.getByTitle('close timer dropdown');
    fireEvent.click(closeButton);
    expect(defaultProps.toggleTimer).toHaveBeenCalled();
  });

  it('displays correct remaining time based on props', () => {
    const { rerender } = render(<Countdown {...defaultProps} />);
    expect(screen.getByText('00')).toBeInTheDocument(); // Hours
    expect(screen.getByText('30')).toBeInTheDocument(); // Minutes
    expect(screen.getByText('00')).toBeInTheDocument(); // Seconds

    rerender(
      <Countdown
        {...defaultProps}
        remaining={5400000} // 1 hour 30 minutes in milliseconds
      />,
    );
    expect(screen.getByText('01')).toBeInTheDocument(); // Updated hours
    expect(screen.getByText('30')).toBeInTheDocument(); // Updated minutes
  });

  it('calls handleStartButton when the start button is clicked', () => {
    render(<Countdown {...defaultProps} />);
    const startButton = screen.getByLabelText('Start timer');
    fireEvent.click(startButton);
    expect(defaultProps.handleStartButton).toHaveBeenCalled();
  });

  it('calls handleStopButton when the stop button is clicked', () => {
    const props = {
      ...defaultProps,
      message: { ...defaultProps.message, started: true },
      running: true,
    };
    render(<Countdown {...props} />);
    const stopButton = screen.getByLabelText('Stop timer and log timer');
    fireEvent.click(stopButton);
    expect(defaultProps.handleStopButton).toHaveBeenCalled();
  });

  it('calls wsMessageHandler.sendSetGoal when a new goal is validated', () => {
    const { rerender } = render(<Countdown {...defaultProps} />);
    const editButton = screen.getByTitle('edit initial goal');
    fireEvent.click(editButton);
  
    const hourInput = screen.getByDisplayValue('1');
    fireEvent.change(hourInput, { target: { value: '2' } });
  
    const saveButton = screen.getByTitle('save initial goal');
    fireEvent.click(saveButton);
  
    expect(defaultProps.wsMessageHandler.sendSetGoal).toHaveBeenCalledWith(7200000); // 2 hours in milliseconds
  });
});