import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import JobApplicationForm from '../JobApplicationForm/JobApplicationForm';
import {
  MAX_UPLOAD_BYTES,
  getUploadSizeError,
} from '../JobApplicationForm/jobApplicationQuestionUtils';

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

const makeFile = (name, size, type = 'application/pdf') => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const chooseResume = file => {
  const input = screen.getByLabelText('Choose file');
  fireEvent.change(input, { target: { files: [file] } });
  return input;
};

describe('getUploadSizeError', () => {
  it('allows files up to exactly 5 MB', () => {
    expect(MAX_UPLOAD_BYTES).toBe(5 * 1024 * 1024);
    expect(getUploadSizeError(makeFile('ok.pdf', MAX_UPLOAD_BYTES))).toBe('');
    expect(getUploadSizeError(null)).toBe('');
  });

  it('rejects files over 5 MB with a readable message', () => {
    expect(getUploadSizeError(makeFile('big.pdf', MAX_UPLOAD_BYTES + 1))).toBe(
      'File too large, max 5 MB.',
    );
  });
});

describe('JobApplicationForm upload size limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('shows an inline error and keeps no file when the resume is over 5 MB', () => {
    renderForm();
    const input = chooseResume(makeFile('huge.pdf', MAX_UPLOAD_BYTES + 1));

    expect(screen.getByRole('alert')).toHaveTextContent('File too large, max 5 MB.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'jaf-resume-upload-error');
    expect(screen.queryByText(/huge\.pdf/)).not.toBeInTheDocument();
  });

  it('clears the error once a resume within the limit is chosen', () => {
    renderForm();
    chooseResume(makeFile('huge.pdf', MAX_UPLOAD_BYTES + 1));
    const input = chooseResume(makeFile('resume.pdf', 1024));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByText(/resume\.pdf/)).toBeInTheDocument();
  });
});
