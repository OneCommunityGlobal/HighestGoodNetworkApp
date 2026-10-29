/* eslint-disable testing-library/no-node-access -- the honeypot, script tag and form fields are checked by id/selector on purpose */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import JobApplicationForm from '../JobApplicationForm/JobApplicationForm';
import { resetTurnstileLoaderForTests } from '../JobApplicationForm/turnstile';

vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

const mockStore = {
  getState: () => ({ theme: { darkMode: false }, auth: { user: {} } }),
  subscribe: () => () => {},
  dispatch: vi.fn(),
};

const FORM = { _id: '507f1f77bcf86cd799439011', title: 'Software Engineer', questions: [] };

const renderForm = () =>
  render(
    <Provider store={mockStore}>
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/job-application',
            state: { formId: FORM._id, jobTitle: FORM.title },
          },
        ]}
      >
        <JobApplicationForm />
      </MemoryRouter>
    </Provider>,
  );

const fillProfile = async () => {
  await screen.findByLabelText(/^First Name/i);
  fireEvent.change(screen.getByLabelText(/^First Name/i), { target: { value: 'Ada' } });
  fireEvent.change(screen.getByLabelText(/^Last Name/i), { target: { value: 'Lovelace' } });
  fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: 'ada@example.com' } });
  fireEvent.change(document.getElementById('jaf-location'), { target: { value: 'London, UK' } });
  fireEvent.change(document.getElementById('jaf-timezone'), { target: { value: 'GMT' } });
  fireEvent.change(document.getElementById('jaf-phone'), { target: { value: '+442071838750' } });
};

const fillAndSubmit = async () => {
  await fillProfile();
  fireEvent.click(screen.getByRole('checkbox', { name: /I agree to terms and conditions/i }));
  fireEvent.click(screen.getByRole('button', { name: /submit your application/i }));
};

const submittedFormData = () => axios.post.mock.calls[0][1];

describe('JobApplicationForm bot protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation(url =>
      Promise.resolve(
        String(url).includes('positions')
          ? { data: { positions: [] } }
          : { data: { form: FORM, forms: [FORM] } },
      ),
    );
    axios.post.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    delete window.turnstile;
    document.querySelectorAll('script[src*="challenges.cloudflare.com"]').forEach(s => s.remove());
    resetTurnstileLoaderForTests();
  });

  describe('honeypot', () => {
    it('exists but is not reachable by keyboard or screen readers', () => {
      renderForm();
      const field = screen.getByTestId('jaf-honeypot');

      expect(field).toHaveAttribute('name', 'website_url');
      expect(field).toHaveAttribute('tabindex', '-1');
      expect(field).toHaveAttribute('autocomplete', 'off');
      expect(field.closest('[aria-hidden="true"]')).not.toBeNull();
      expect(field).toHaveValue('');
      // No accessible name and not exposed in the accessibility tree
      expect(screen.getAllByRole('textbox')).not.toContain(field);
      // Off-screen via a CSS-module class, not display:none
      expect(field.parentElement.className).toMatch(/honeypot/);
    });

    it('is sent empty with the submit', async () => {
      renderForm();
      await fillAndSubmit();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

      expect(submittedFormData().get('website_url')).toBe('');
    });
  });

  describe('fillMs', () => {
    it('is sent as a number of milliseconds since the form opened', async () => {
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1_000_000);
      renderForm();
      await screen.findByLabelText(/^First Name/i);
      nowSpy.mockReturnValue(1_005_500);
      await fillAndSubmit();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

      const raw = submittedFormData().get('fillMs');
      expect(Number.isFinite(Number(raw))).toBe(true);
      expect(Number(raw)).toBe(5500);
    });
  });

  describe('Turnstile', () => {
    it('adds no widget, no token and no script without a site key', async () => {
      vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '');
      renderForm();
      await fillAndSubmit();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

      expect(screen.queryByTestId('turnstile-widget')).not.toBeInTheDocument();
      expect(document.querySelector('script[src*="challenges.cloudflare.com"]')).toBeNull();
      expect(submittedFormData().has('cf-turnstile-response')).toBe(false);
    });

    it('renders the widget and sends its token when a site key is set', async () => {
      vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
      let options;
      window.turnstile = {
        render: vi.fn((el, opts) => {
          options = opts;
          return 'widget-1';
        }),
        reset: vi.fn(),
        remove: vi.fn(),
      };
      renderForm();

      expect(screen.getByTestId('turnstile-widget')).toBeInTheDocument();
      await waitFor(() => expect(window.turnstile.render).toHaveBeenCalledTimes(1));
      expect(options.sitekey).toBe('test-site-key');

      options.callback('token-abc');
      await fillAndSubmit();
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

      expect(submittedFormData().get('cf-turnstile-response')).toBe('token-abc');
      await waitFor(() =>
        expect(
          screen.getByRole('checkbox', { name: /I agree to terms and conditions/i }),
        ).not.toBeChecked(),
      );
      expect(screen.getByRole('button', { name: /submit your application/i })).toBeDisabled();
    });

    it('requires consent even after verification succeeds', async () => {
      vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
      let options;
      window.turnstile = {
        render: vi.fn((el, opts) => {
          options = opts;
          return 'widget-1';
        }),
        reset: vi.fn(),
        remove: vi.fn(),
      };
      renderForm();
      await waitFor(() => expect(window.turnstile.render).toHaveBeenCalledTimes(1));
      options.callback('token-abc');
      await fillProfile();

      const checkbox = screen.getByRole('checkbox', { name: /I agree to terms and conditions/i });
      expect(screen.getByRole('button', { name: /submit your application/i })).toBeDisabled();
      fireEvent.submit(screen.getByRole('form', { name: 'Job application' }));
      expect(axios.post).not.toHaveBeenCalled();
      expect(checkbox).toHaveFocus();
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Please agree to the terms and conditions',
      );

      fireEvent.click(checkbox);
      fireEvent.click(screen.getByRole('button', { name: /submit your application/i }));
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
      expect(submittedFormData().get('cf-turnstile-response')).toBe('token-abc');
    });

    it('loads the script once when window.turnstile is not there yet', async () => {
      vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
      renderForm();

      await waitFor(() =>
        expect(
          document.querySelectorAll(
            'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]',
          ),
        ).toHaveLength(1),
      );
    });

    it('resets the widget after a failed verification and shows the server text', async () => {
      vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'test-site-key');
      let options;
      window.turnstile = {
        render: vi.fn((el, opts) => {
          options = opts;
          return 'widget-1';
        }),
        reset: vi.fn(),
        remove: vi.fn(),
      };
      axios.post.mockRejectedValueOnce({
        response: { status: 400, data: { error: 'Verification failed. Please try again.' } },
      });
      renderForm();
      await waitFor(() => expect(window.turnstile.render).toHaveBeenCalled());
      await fillAndSubmit();

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Verification failed. Please try again.');
      expect(window.turnstile.reset).toHaveBeenCalledWith('widget-1');
      expect(
        screen.getByRole('checkbox', { name: /I agree to terms and conditions/i }),
      ).toBeChecked();
      expect(screen.getByLabelText(/^First Name/i)).toHaveValue('Ada');

      options.callback('retry-token');
      fireEvent.click(screen.getByRole('button', { name: /submit your application/i }));
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
      expect(axios.post.mock.calls[1][1].get('cf-turnstile-response')).toBe('retry-token');
      await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    });
  });

  describe('rate limit', () => {
    it('shows the server message on a 429', async () => {
      axios.post.mockRejectedValue({
        response: {
          status: 429,
          headers: { 'retry-after': '120' },
          data: { error: 'Too many applications for this email address. Please try again later.' },
        },
      });
      renderForm();
      await fillAndSubmit();

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent(
        'Too many applications for this email address. Please try again later.',
      );
      expect(alert.className).toMatch(/fieldError/);
    });

    it('falls back to a safe message when a 429 has no body', async () => {
      axios.post.mockRejectedValue({ response: { status: 429, data: {} } });
      renderForm();
      await fillAndSubmit();

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'Too many applications from this connection. Please try again later.',
      );
    });

    it('clears the message when the applicant submits again', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 429, data: { error: 'Slow down.' } },
      });
      renderForm();
      await fillAndSubmit();
      await screen.findByRole('alert');

      fireEvent.click(screen.getByRole('button', { name: /submit your application/i }));
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    });
  });
});
