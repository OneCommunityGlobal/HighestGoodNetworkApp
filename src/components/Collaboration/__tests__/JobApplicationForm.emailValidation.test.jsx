import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import JobApplicationForm from '../JobApplicationForm/JobApplicationForm';

vi.mock('axios');

const mockStore = {
  getState: () => ({ theme: { darkMode: false }, auth: { user: {} } }),
  subscribe: () => () => {},
  dispatch: vi.fn(),
};

const renderForm = () =>
  render(
    <Provider store={mockStore}>
      <MemoryRouter initialEntries={['/job-application']}>
        <JobApplicationForm />
      </MemoryRouter>
    </Provider>,
  );

const typeEmailAndBlur = value => {
  const input = screen.getByLabelText(/^Email/);
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
  return input;
};

describe('JobApplicationForm email field', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('shows an error on blur when the domain ending does not exist', () => {
    renderForm();
    const input = typeEmailAndBlur('rabstu@gmail.con');

    expect(screen.getByRole('alert')).toHaveTextContent(
      '".con" isn\'t a valid email domain ending. Check for a typo.',
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('offers a one-click fix for a likely typo without blocking', () => {
    renderForm();
    const input = typeEmailAndBlur('ada@gmial.com');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // The address is plain text; the fix is an explicit, labelled button.
    expect(screen.getByText('ada@gmail.com').tagName).toBe('STRONG');
    fireEvent.click(screen.getByRole('button', { name: 'Use this email: ada@gmail.com' }));

    expect(input).toHaveValue('ada@gmail.com');
    expect(screen.queryByText(/Did you mean/)).not.toBeInTheDocument();
    // The suggestion button disappears, so focus goes back to the field instead of the page.
    expect(input).toHaveFocus();
  });

  it('clears the error and suggestion as soon as the applicant edits the email', () => {
    renderForm();
    const input = typeEmailAndBlur('rabstu@gmail.con');

    fireEvent.change(input, { target: { value: 'rabstu@gmail.co' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/Did you mean/)).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('stays quiet on blur for a valid address', () => {
    renderForm();
    typeEmailAndBlur('ada@example.com');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/Did you mean/)).not.toBeInTheDocument();
  });
});
