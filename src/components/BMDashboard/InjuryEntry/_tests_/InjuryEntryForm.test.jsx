import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import InjuryEntryForm, { validateInjuryField, validateInjuryForm } from '../InjuryEntryForm';
import { ENDPOINTS } from '../../../../utils/URL';

vi.mock('axios', () => ({ default: { post: vi.fn() } }));
vi.mock('react-redux', () => ({
  useSelector: selector => selector({ theme: { darkMode: false } }),
}));
vi.mock('react-router-dom', () => ({
  useParams: () => ({ projectId: '654946c8bc5772e8caf7e963' }),
  useHistory: () => ({ push: vi.fn() }),
}));

const PROJECT_ID = '654946c8bc5772e8caf7e963';
const validValues = () => ({
  date: '2025-06-15',
  severity: 'Major',
  injuryType: 'Cut',
  workerCategory: 'Electrical',
  description: 'Worker sustained a minor cut.',
});
const fillForm = () => {
  fireEvent.change(screen.getByLabelText('Incident Date'), { target: { value: '2025-06-15' } });
  fireEvent.change(screen.getByLabelText('Injury Severity'), { target: { value: 'Major' } });
  fireEvent.change(screen.getByLabelText('Injury Type'), { target: { value: ' Cut ' } });
  fireEvent.change(screen.getByLabelText('Worker Category'), { target: { value: ' Electrical ' } });
  fireEvent.change(screen.getByLabelText('Incident Description'), {
    target: { value: ' Worker sustained a minor cut. ' },
  });
};

beforeEach(() => vi.clearAllMocks());

describe('injury field validation', () => {
  it('rejects invalid dates, severity, and descriptions', () => {
    expect(validateInjuryField('date', '2999-01-01', PROJECT_ID)).toBe(
      'Incident date cannot be in the future.',
    );
    expect(validateInjuryField('date', '2025-02-30', PROJECT_ID)).toBe(
      'Enter a valid incident date.',
    );
    expect(validateInjuryField('severity', 'Serious', PROJECT_ID)).toBe(
      'Select a valid injury severity.',
    );
    expect(validateInjuryField('description', 'short', PROJECT_ID)).toBe(
      'Please provide at least 10 characters describing the incident.',
    );
    expect(validateInjuryField('injuryType', 'Cut123', PROJECT_ID)).toContain('letters only');
    expect(validateInjuryForm(validValues(), PROJECT_ID)).toEqual({});
  });
});

describe('InjuryEntryForm', () => {
  it('renders the selected project and required fields', () => {
    render(<InjuryEntryForm />);
    expect(screen.getByLabelText('Project')).toHaveValue(PROJECT_ID);
    expect(screen.getByLabelText('Project')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Save Incident' })).toBeInTheDocument();
  });

  it('blocks empty submission without an API request', async () => {
    render(<InjuryEntryForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Save Incident' }));
    expect(
      await screen.findByText('Please correct the highlighted fields before proceeding.'),
    ).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('sends a normalized payload, locks the saved form, and resets for another incident', async () => {
    axios.post.mockResolvedValue({
      status: 201,
      data: { message: 'Injury incident saved successfully.', injury: { _id: 'saved-id' } },
    });
    render(<InjuryEntryForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Save Incident' }));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(axios.post).toHaveBeenCalledWith(ENDPOINTS.BM_INJURY_CREATE, {
      projectId: PROJECT_ID,
      date: '2025-06-15',
      severity: 'Major',
      injuryType: 'Cut',
      workerCategory: 'Electrical',
      description: 'Worker sustained a minor cut.',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Injury incident saved successfully.',
    );
    expect(screen.getByLabelText('Injury Type')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save Incident' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add Another Incident' }));
    expect(screen.getByLabelText('Injury Type')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Save Incident' })).toBeEnabled();
  });

  it('prevents duplicate submissions while the request is pending', async () => {
    let resolveRequest;
    axios.post.mockReturnValue(
      new Promise(resolve => {
        resolveRequest = resolve;
      }),
    );
    render(<InjuryEntryForm />);
    fillForm();
    const save = screen.getByRole('button', { name: 'Save Incident' });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Saving Incident...' })).toBeDisabled();
    resolveRequest({ status: 201, data: { injury: { _id: 'saved-id' } } });
    await screen.findByRole('button', { name: 'Add Another Incident' });
  });

  it('displays a server error and allows retry', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'Unable to save incident.' } } });
    render(<InjuryEntryForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Save Incident' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save incident.');
    expect(screen.getByRole('button', { name: 'Save Incident' })).toBeEnabled();
  });

  it('does not report success without a saved injury ID', async () => {
    axios.post.mockResolvedValue({ status: 201, data: {} });
    render(<InjuryEntryForm />);
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Save Incident' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'The server did not confirm that the injury was saved.',
    );
  });
});
