import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QuestionnaireProvider, useQuestionnaire } from '../context/QuestionnaireContext';
import { getQuestionnaireStatus } from '../services/questionnaireService';

vi.mock('../services/questionnaireService', () => ({
  getQuestionnaireStatus: vi.fn(),
}));

const TestConsumer = () => {
  const { completed, loading, error, refreshQuestionnaireStatus } = useQuestionnaire();

  return (
    <div>
      <span data-testid="completed">{String(completed)}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{String(error)}</span>
      <button type="button" onClick={refreshQuestionnaireStatus}>
        Refresh
      </button>
    </div>
  );
};

describe('QuestionnaireContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProvider = () =>
    render(
      <QuestionnaireProvider>
        <TestConsumer />
      </QuestionnaireProvider>,
    );

  it('should show loading initially', () => {
    getQuestionnaireStatus.mockReturnValue(new Promise(() => {}));

    renderProvider();

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  it('should set completed to true when questionnaire is submitted', async () => {
    getQuestionnaireStatus.mockResolvedValue({ completed: true });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('completed')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('error')).toHaveTextContent('false');
  });

  it('should set completed to false when questionnaire is incomplete', async () => {
    getQuestionnaireStatus.mockResolvedValue({ completed: false });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('completed')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('error')).toHaveTextContent('false');
  });

  it('should set error when the API request fails', async () => {
    getQuestionnaireStatus.mockRejectedValue(new Error('API error'));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('true');
      expect(screen.getByTestId('completed')).toHaveTextContent('null');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should refresh questionnaire status when requested', async () => {
    getQuestionnaireStatus
      .mockResolvedValueOnce({ completed: false })
      .mockResolvedValueOnce({ completed: true });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('completed')).toHaveTextContent('false');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    await waitFor(() => {
      expect(screen.getByTestId('completed')).toHaveTextContent('true');
    });

    expect(getQuestionnaireStatus).toHaveBeenCalledTimes(2);
  });

  it('should throw an error when useQuestionnaire is used outside the provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useQuestionnaire must be used within QuestionnaireProvider',
    );

    consoleError.mockRestore();
  });
});
