/* eslint-disable testing-library/no-node-access */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import css from '../Timer.module.css';

const websocketMocks = vi.hoisted(() => ({
  sendJsonMessage: vi.fn(),
}));

vi.mock('react-redux', async importOriginal => {
  const actual = await importOriginal();
  return { ...actual, connect: () => Component => Component, useDispatch: () => vi.fn() };
});

vi.mock('react-use-websocket', () => ({
  default: () => ({
    sendMessage: vi.fn(),
    sendJsonMessage: websocketMocks.sendJsonMessage,
    lastJsonMessage: null,
    getWebSocket: vi.fn(),
  }),
  ReadyState: { CONNECTING: 1, OPEN: 1, CLOSING: 2, CLOSED: 3 },
}));

import Timer from '../Timer';

describe('Timer reset confirmation modal', () => {
  beforeEach(() => {
    window.focus = vi.fn();
    HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
    HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    websocketMocks.sendJsonMessage.mockClear();
  });

  const openResetModal = darkMode => {
    render(<Timer authUser={{ userid: 'test-user', role: 'Owner' }} darkMode={darkMode} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset timer' }));
    return screen.getByText('Reset Time').closest('.modal');
  };

  it('uses the scoped charcoal theme in dark mode and resets the timer', async () => {
    const modal = openResetModal(true);
    const modalDialog = modal.querySelector('.modal-dialog');

    await waitFor(() => expect(modal).toHaveClass('show'));
    expect(modalDialog).toHaveClass(css.resetConfirmationModal, 'text-light');
    expect(modalDialog.querySelector('.bg-yinmn-blue')).toBeNull();
    expect(screen.getByText('Are you sure you want to reset your time?')).toBeVisible();
    expect(screen.getByLabelText('Close')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Yes, reset time!' }));

    expect(websocketMocks.sendJsonMessage).toHaveBeenCalledWith({ action: 'CLEAR_TIMER' }, false);
    await waitFor(() => expect(screen.queryByText('Reset Time')).not.toBeInTheDocument());
  });

  it('leaves the light-mode reset dialog unthemed', async () => {
    const modal = openResetModal(false);
    const modalDialog = modal.querySelector('.modal-dialog');

    await waitFor(() => expect(modal).toHaveClass('show'));
    expect(modalDialog).not.toHaveClass(css.resetConfirmationModal, 'text-light');
    expect(modalDialog.querySelector('.bg-yinmn-blue')).toBeNull();
  });
});
