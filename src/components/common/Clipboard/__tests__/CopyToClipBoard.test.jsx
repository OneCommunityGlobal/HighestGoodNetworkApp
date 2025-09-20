import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { vi } from 'vitest';

const mockStore = configureMockStore();

vi.mock('react-toastify', () => {
  const mockToastSuccess = vi.fn();
  const mockToastError = vi.fn();

  return {
    __esModule: true,
    toast: {
      success: mockToastSuccess,
      error: mockToastError,
    },
    __mocked_toast: {
      success: mockToastSuccess,
      error: mockToastError,
    },
  };
});

import CopyToClipboard from '../CopyToClipboard';
import { themeMock } from '../../../../__tests__/mockStates';
// eslint-disable-next-line import/named
import { __mocked_toast } from 'react-toastify';

const mockWriteText = vi.fn();

beforeAll(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
  });
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
      </Provider>,
    );

    fireEvent.click(screen.getByTestId('copy-icon'));

    expect(mockWriteText).toHaveBeenCalledWith(writeText);

    await waitFor(() => {
      expect(__mocked_toast.success).toHaveBeenCalledWith(message);
    });
  });
});
