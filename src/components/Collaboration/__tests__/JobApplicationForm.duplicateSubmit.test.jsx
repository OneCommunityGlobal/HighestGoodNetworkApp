import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import JobApplicationForm from '../JobApplicationForm/JobApplicationForm';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const mockStore = {
  getState: () => ({ theme: { darkMode: false }, auth: { user: {} } }),
  subscribe: () => () => {},
  dispatch: vi.fn(),
};

const JOB_FORM = { _id: 'form-1', title: 'Test Role', questions: [] };

const renderForm = () =>
  render(
    <Provider store={mockStore}>
      <MemoryRouter
        initialEntries={[{ pathname: '/job-application', state: { jobTitle: 'Test Role' } }]}
      >
        <JobApplicationForm />
      </MemoryRouter>
    </Provider>,
  );

const fillValidApplication = async () => {
  // Wait for the form list to load and the role to be selected.
  await screen.findByLabelText(/^Email/);
  await waitFor(() => expect(axios.get).toHaveBeenCalled());
  fireEvent.change(screen.getByLabelText(/^First Name/), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText(/^Last Name/), { target: { value: 'Lovelace' } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByLabelText(/^Location/), { target: { value: 'Charlotte, NC' } });
  fireEvent.change(screen.getByLabelText(/^Time Zone/), { target: { value: 'America/New_York' } });
  fireEvent.change(screen.getByLabelText(/^Phone/), { target: { value: '+1 213-456-7890' } });
};

const submit = async () => {
  const button = await screen.findByRole('button', { name: 'Submit your application' });
  fireEvent.click(button);
};

describe('JobApplicationForm duplicate application handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation(url =>
      Promise.resolve(
        String(url).includes('positions')
          ? { data: { positions: [] } }
          : { data: { forms: [JOB_FORM] } },
      ),
    );
  });

  it('shows the success toast and resets the form when the server answers 201', async () => {
    axios.post.mockResolvedValue({
      status: 201,
      data: { message: 'Application submitted successfully.' },
    });
    renderForm();
    await fillValidApplication();
    await submit();

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Application submitted successfully. A confirmation email will be sent.',
      ),
    );
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/^Email/)).toHaveValue('');
    expect(screen.getByLabelText(/^First Name/)).toHaveValue('');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('routes a 409 through the generic error path and never shows the old duplicate text', async () => {
    axios.post.mockRejectedValue({
      response: { status: 409, data: { error: 'Application already submitted.' } },
    });
    renderForm();
    await fillValidApplication();
    await submit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Application already submitted.', {
        autoClose: 7000,
      }),
    );
    const shown = [...toast.error.mock.calls, ...toast.success.mock.calls, ...toast.warn.mock.calls]
      .map(call => String(call[0]))
      .join('\n');
    expect(shown).not.toContain('You already applied for this position.');
    expect(toast.success).not.toHaveBeenCalled();
  });
});
