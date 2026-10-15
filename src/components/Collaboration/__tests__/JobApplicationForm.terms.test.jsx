import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { toast } from 'react-toastify';
import JobApplicationForm from '../JobApplicationForm/JobApplicationForm';
import { ENDPOINTS } from '../../../utils/URL';

vi.mock('axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

const formId = '507f1f77bcf86cd799439011';
const form = { _id: formId, title: 'Software Engineer', questions: [] };

async function mountApplication(darkMode = false) {
  const store = {
    getState: () => ({ theme: { darkMode }, auth: { user: null } }),
    subscribe: () => () => {},
    dispatch: vi.fn(),
  };
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/job-application']}>
        <JobApplicationForm />
      </MemoryRouter>
    </Provider>,
  );
  await waitFor(() =>
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.GET_ALL_JOB_FORMS, expect.any(Object)),
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Select a position' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Software Engineer' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Select a position' })).toHaveTextContent(
      'Software Engineer',
    ),
  );
}

function fillProfile() {
  fireEvent.change(screen.getByRole('textbox', { name: /First Name/i }), {
    target: { value: 'Fixture' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /Last Name/i }), {
    target: { value: 'Applicant' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/i }), {
    target: { value: 'fixture@example.test' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^Location/i }), {
    target: { value: 'Los Angeles, United States' },
  });
  fireEvent.change(screen.getByRole('combobox', { name: /^Time Zone/i }), {
    target: { value: 'America/Los_Angeles' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^Phone/i }), {
    target: { value: '+12133734253' },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  axios.get.mockImplementation(async url => {
    if (url === ENDPOINTS.GET_JOB_POSITIONS) return { data: { positions: ['Software Engineer'] } };
    if (url === ENDPOINTS.GET_ALL_JOB_FORMS) return { data: { forms: [form] } };
    throw new Error(`Unexpected read: ${url}`);
  });
  axios.post.mockResolvedValue({ data: {} });
});

describe('job application terms acknowledgement', () => {
  it.each([false, true])('starts unchecked and required in darkMode=%s', async darkMode => {
    await mountApplication(darkMode);
    const checkbox = screen.getByRole('checkbox', { name: /I agree to terms and conditions/i });
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toBeRequired();
    expect(screen.getByRole('button', { name: 'Submit your application' })).toBeDisabled();
    const link = screen.getByRole('link', { name: 'terms and conditions' });
    expect(link).toHaveAttribute('href', 'https://onecommunityglobal.org/terms-and-conditions/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('form', { name: 'Job application' })).toContainElement(link);
    expect(
      checkbox.compareDocumentPosition(
        screen.getByRole('button', { name: 'Submit your application' }),
      ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('enables submission only while the applicant agrees', async () => {
    await mountApplication();
    const checkbox = screen.getByRole('checkbox', { name: /I agree to terms and conditions/i });
    fireEvent.click(checkbox);
    expect(screen.getByRole('button', { name: 'Submit your application' })).toBeEnabled();
    fireEvent.click(checkbox);
    expect(screen.getByRole('button', { name: 'Submit your application' })).toBeDisabled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('also blocks a direct submit event, focuses the checkbox and explains the error', async () => {
    await mountApplication();
    const checkbox = screen.getByRole('checkbox', { name: /I agree to terms and conditions/i });
    fillProfile();
    fireEvent.submit(screen.getByRole('form', { name: 'Job application' }));
    expect(axios.post).not.toHaveBeenCalled();
    expect(checkbox).toHaveFocus();
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Please agree to the terms and conditions');
    fireEvent.click(checkbox);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-invalid', 'false');
  });

  it('keeps existing required-profile validation after agreement', async () => {
    await mountApplication();
    const checkbox = screen.getByRole('checkbox', { name: /I agree to terms and conditions/i });
    fireEvent.click(checkbox);
    fireEvent.submit(screen.getByRole('form', { name: 'Job application' }));
    expect(toast.error).toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
    expect(checkbox).toBeChecked();
  });

  it('submits valid agreed data through the existing mocked API and resets agreement', async () => {
    await mountApplication();
    const checkbox = screen.getByRole('checkbox', { name: /I agree to terms and conditions/i });
    fillProfile();
    fireEvent.click(checkbox);
    fireEvent.submit(screen.getByRole('form', { name: 'Job application' }));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    const [url, body, config] = axios.post.mock.calls[0];
    expect(url).toBe(ENDPOINTS.SUBMIT_JOB_APPLICATION(formId));
    expect(body.get('respondent')).toBe('Fixture Applicant');
    expect(body.get('email')).toBe('fixture@example.test');
    expect(JSON.parse(body.get('payload')).profile.jobTitle).toBe('Software Engineer');
    expect(config.headers.Authorization).toBe(false);
    await waitFor(() => expect(checkbox).not.toBeChecked());
    expect(screen.getByRole('button', { name: 'Submit your application' })).toBeDisabled();
  });

  it('preserves agreement and profile data after an API failure so the applicant can retry', async () => {
    axios.post.mockRejectedValueOnce(new Error('Synthetic network failure'));
    await mountApplication();
    const checkbox = screen.getByRole('checkbox', { name: /I agree to terms and conditions/i });
    fillProfile();
    fireEvent.click(checkbox);
    fireEvent.submit(screen.getByRole('form', { name: 'Job application' }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Synthetic network failure', expect.any(Object)),
    );
    expect(checkbox).toBeChecked();
    expect(screen.getByRole('textbox', { name: /First Name/i })).toHaveValue('Fixture');
    expect(screen.getByRole('button', { name: 'Submit your application' })).toBeEnabled();
  });

  it('keeps submission disabled while the agreed application is in flight', async () => {
    let resolve;
    axios.post.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done;
        }),
    );
    await mountApplication();
    const checkbox = screen.getByRole('checkbox', { name: /I agree to terms and conditions/i });
    fillProfile();
    fireEvent.click(checkbox);
    fireEvent.submit(screen.getByRole('form', { name: 'Job application' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submitting…' })).toBeDisabled());
    resolve({ data: {} });
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });
});
