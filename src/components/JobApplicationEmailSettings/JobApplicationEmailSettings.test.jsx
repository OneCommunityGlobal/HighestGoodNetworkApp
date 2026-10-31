import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import JobApplicationEmailSettings from './JobApplicationEmailSettings';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '~/utils/URL';

vi.mock('../../services/httpService', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('JobApplicationEmailSettings', () => {
  const defaultRecipients = ['owner@example.com'];

  const renderModal = (props = {}) =>
    render(<JobApplicationEmailSettings isOpen onClose={vi.fn()} darkMode={false} {...props} />);

  beforeEach(() => {
    vi.clearAllMocks();

    httpService.get.mockResolvedValue({
      data: {
        recipients: defaultRecipients,
      },
    });

    httpService.put.mockImplementation((url, payload) =>
      Promise.resolve({
        data: {
          recipients: payload.recipients,
        },
      }),
    );
  });

  it('loads configured recipients from the backend', async () => {
    renderModal();

    expect(await screen.findByText('owner@example.com')).toBeTruthy();

    expect(httpService.get).toHaveBeenCalledWith(ENDPOINTS.JOB_APPLICATION_EMAIL_RECIPIENTS);
  });

  it('normalizes and saves a new email recipient', async () => {
    renderModal();

    await screen.findByText('owner@example.com');

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: {
        value: ' NEW@Example.COM ',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('new@example.com')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Save Recipients' }));

    await waitFor(() => {
      expect(httpService.put).toHaveBeenCalledWith(ENDPOINTS.JOB_APPLICATION_EMAIL_RECIPIENTS, {
        recipients: ['owner@example.com', 'new@example.com'],
      });
    });

    expect(await screen.findByText('Email recipients saved successfully.')).toBeTruthy();
  });

  it('blocks invalid email addresses', async () => {
    renderModal();

    await screen.findByText('owner@example.com');

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: {
        value: 'invalid-email',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('alert').textContent).toContain('valid email');

    expect(httpService.put).not.toHaveBeenCalled();
  });

  it('prevents duplicate email addresses', async () => {
    renderModal();

    await screen.findByText('owner@example.com');

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: {
        value: 'OWNER@EXAMPLE.COM',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('alert').textContent).toContain('already listed');

    expect(screen.getAllByText('owner@example.com')).toHaveLength(1);
  });

  it('removes recipients and saves the updated list', async () => {
    renderModal();

    await screen.findByText('owner@example.com');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove owner@example.com',
      }),
    );

    expect(screen.getByText('No notification recipients configured.')).toBeTruthy();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save Recipients',
      }),
    );

    await waitFor(() => {
      expect(httpService.put).toHaveBeenCalledWith(ENDPOINTS.JOB_APPLICATION_EMAIL_RECIPIENTS, {
        recipients: [],
      });
    });
  });

  it('shows an error if recipients cannot be loaded', async () => {
    httpService.get.mockRejectedValueOnce(new Error('Network unavailable'));

    renderModal();

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Unable to load recipients. Please close and reopen to try again.',
    );

    expect(screen.getByRole('button', { name: 'Save Recipients' }).disabled).toBe(true);

    expect(httpService.put).not.toHaveBeenCalled();
  });

  it('reloads the recipients when reopened', async () => {
    const onClose = vi.fn();

    const { rerender } = renderModal({ onClose });

    await screen.findByText('owner@example.com');

    rerender(<JobApplicationEmailSettings isOpen={false} onClose={onClose} darkMode={false} />);

    rerender(<JobApplicationEmailSettings isOpen onClose={onClose} darkMode={false} />);

    await waitFor(() => {
      expect(httpService.get).toHaveBeenCalledTimes(2);
    });
  });

  it('shows save failures without claiming success', async () => {
    httpService.put.mockRejectedValueOnce(new Error('Save unavailable'));

    renderModal();

    await screen.findByText('owner@example.com');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save Recipients',
      }),
    );

    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Unable to save recipients. Please try again.',
    );

    expect(screen.queryByText('Email recipients saved successfully.')).toBeNull();
  });

  it('applies dark-mode styling and closes without saving', async () => {
    const onClose = vi.fn();

    renderModal({
      darkMode: true,
      onClose,
    });

    await screen.findByText('owner@example.com');

    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(httpService.put).not.toHaveBeenCalled();
  });

  it('rejects email addresses containing consecutive dots', async () => {
    renderModal();

    await screen.findByText('owner@example.com');

    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'richa@gmail..com' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.');
    expect(screen.queryByText('richa@gmail..com')).not.toBeInTheDocument();
    expect(httpService.put).not.toHaveBeenCalled();
  });
});
