import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Timer from '../Timer';
import moment from 'moment-timezone';

// Mock the websocket
jest.mock('react-use-websocket', () => ({
  __esModule: true,
  default: () => ({
    sendMessage: jest.fn(),
    sendJsonMessage: jest.fn(),
    lastJsonMessage: null,
    getWebSocket: jest.fn(() => ({ close: jest.fn() })),
  }),
  ReadyState: {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  },
}));

// Mock the time entry actions
jest.mock('../../../actions/timeEntries', () => ({
  postTimeEntry: jest.fn(() => ({ type: 'POST_TIME_ENTRY' })),
}));

// Mock the task actions
jest.mock('../../TeamMemberTasks/actions', () => ({
  updateIndividualTaskTime: jest.fn(() => ({ type: 'UPDATE_TASK_TIME' })),
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockStore = configureStore({
  reducer: {
    auth: () => ({ user: { _id: 'test-user-id', role: 'Volunteer' } }),
  },
});

const defaultProps = {
  authUser: { _id: 'test-user-id', role: 'Volunteer' },
  darkMode: false,
  isPopout: false,
};

describe('Timer Week-End Auto-Logging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle week-end forced pause and auto-log time', async () => {
    const { postTimeEntry } = require('../../../actions/timeEntries');
    const { toast } = require('react-toastify');

    // Mock successful time entry submission
    postTimeEntry.mockResolvedValue(200);

    const { rerender } = render(
      <Provider store={mockStore}>
        <Timer {...defaultProps} />
      </Provider>
    );

    // Simulate a week-end forced pause message
    const weekEndMessage = {
      time: 900000,
      paused: false,
      forcedPause: true,
      started: true,
      goal: 900000,
      startAt: Date.now() - 3600000, // 1 hour ago
      weekEndPause: true,
      taskId: 'test-task-id',
    };

    // Mock the websocket to return the week-end message
    const { useWebSocket } = require('react-use-websocket');
    useWebSocket.mockReturnValue({
      sendMessage: jest.fn(),
      sendJsonMessage: jest.fn(),
      lastJsonMessage: weekEndMessage,
      getWebSocket: jest.fn(() => ({ close: jest.fn() })),
    });

    rerender(
      <Provider store={mockStore}>
        <Timer {...defaultProps} />
      </Provider>
    );

    // Wait for the auto-logging to complete
    await waitFor(() => {
      expect(postTimeEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          personId: 'test-user-id',
          taskId: 'test-task-id',
          hours: 1, // 1 hour logged
          minutes: 0,
          description: 'Time logged automatically because the week ended',
          isTangible: true,
          entryType: 'default',
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Time automatically logged: 1h 0m - Week ended'
    );
  });

  it('should not auto-log if less than 1 minute of time', async () => {
    const { postTimeEntry } = require('../../../actions/timeEntries');

    const { rerender } = render(
      <Provider store={mockStore}>
        <Timer {...defaultProps} />
      </Provider>
    );

    // Simulate a week-end forced pause with minimal time
    const weekEndMessage = {
      time: 900000,
      paused: false,
      forcedPause: true,
      started: true,
      goal: 900000,
      startAt: Date.now() - 30000, // 30 seconds ago
      weekEndPause: true,
    };

    const { useWebSocket } = require('react-use-websocket');
    useWebSocket.mockReturnValue({
      sendMessage: jest.fn(),
      sendJsonMessage: jest.fn(),
      lastJsonMessage: weekEndMessage,
      getWebSocket: jest.fn(() => ({ close: jest.fn() })),
    });

    rerender(
      <Provider store={mockStore}>
        <Timer {...defaultProps} />
      </Provider>
    );

    // Wait a bit to ensure no auto-logging occurs
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(postTimeEntry).not.toHaveBeenCalled();
  });

  it('should not auto-log if already auto-logged for this session', async () => {
    const { postTimeEntry } = require('../../../actions/timeEntries');

    const { rerender } = render(
      <Provider store={mockStore}>
        <Timer {...defaultProps} />
      </Provider>
    );

    // First week-end message
    const weekEndMessage1 = {
      time: 900000,
      paused: false,
      forcedPause: true,
      started: true,
      goal: 900000,
      startAt: Date.now() - 3600000,
      weekEndPause: true,
    };

    const { useWebSocket } = require('react-use-websocket');
    useWebSocket.mockReturnValue({
      sendMessage: jest.fn(),
      sendJsonMessage: jest.fn(),
      lastJsonMessage: weekEndMessage1,
      getWebSocket: jest.fn(() => ({ close: jest.fn() })),
    });

    rerender(
      <Provider store={mockStore}>
        <Timer {...defaultProps} />
      </Provider>
    );

    // Wait for first auto-log
    await waitFor(() => {
      expect(postTimeEntry).toHaveBeenCalledTimes(1);
    });

    // Second week-end message (should not trigger another auto-log)
    const weekEndMessage2 = {
      ...weekEndMessage1,
      weekEndPause: true,
    };

    useWebSocket.mockReturnValue({
      sendMessage: jest.fn(),
      sendJsonMessage: jest.fn(),
      lastJsonMessage: weekEndMessage2,
      getWebSocket: jest.fn(() => ({ close: jest.fn() })),
    });

    rerender(
      <Provider store={mockStore}>
        <Timer {...defaultProps} />
      </Provider>
    );

    // Wait a bit to ensure no additional auto-logging
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(postTimeEntry).toHaveBeenCalledTimes(1);
  });
});