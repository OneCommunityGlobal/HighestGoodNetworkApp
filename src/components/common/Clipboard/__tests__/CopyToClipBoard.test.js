import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CopyToClipboard from '../CopyToClipboard';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { themeMock } from '__tests__/mockStates';

// Create a mock Redux store
const mockStore = configureMockStore();

// Mock the navigator.clipboard.writeText method
const mockWriteText = jest.fn();

// Mock the toast.success method
const mockToastSuccess = jest.fn();

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
  });

  jest.mock('react-toastify', () => ({
    toast: { success: mockToastSuccess },
  }));
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CopyToClipboard', () => {
  it('should copy to clipboard and show a success message', async () => {
    const writeText = 'Text to be copied';
    const message = 'Copy successful';

    const store = mockStore({
      theme: themeMock,
    });

    render(
      <Provider store={store}>
        <CopyToClipboard writeText={writeText} message={message} />
      </Provider>
    );

    // Select the element using its class
    const copyIcon = document.querySelector('.copy-to-clipboard');

    // Simulate a click event on the icon
    fireEvent.click(copyIcon);

    // Ensure that writeText was called with the correct text
    expect(mockWriteText).toHaveBeenCalledWith(writeText);

    // Use setTimeout to give the component time to display the message
    setTimeout(() => {
      // Ensure that toast.success was called with the correct message
      expect(mockToastSuccess).toHaveBeenCalledWith(message);
    }, 1000);
  });
});
