import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useQuestionnaire } from '../context/QuestionnaireContext';
import QuestionnaireGuard from '../components/QuestionnaireGuard';

vi.mock('../context/QuestionnaireContext', () => ({
  useQuestionnaire: vi.fn(),
}));

vi.mock('../components/QuestionnaireReminder', () => ({
  default: ({ onComplete }) => (
    <button type="button" onClick={onComplete}>
      Complete Questionnaire
    </button>
  ),
}));

describe('QuestionnaireGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading while questionnaire status is loading', () => {
    useQuestionnaire.mockReturnValue({
      completed: null,
      loading: true,
    });

    render(
      <QuestionnaireGuard>
        <div>Dashboard Content</div>
      </QuestionnaireGuard>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('should display loading when completion status is null', () => {
    useQuestionnaire.mockReturnValue({
      completed: null,
      loading: false,
    });

    render(
      <QuestionnaireGuard>
        <div>Dashboard Content</div>
      </QuestionnaireGuard>,
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display the reminder when questionnaire is incomplete', () => {
    useQuestionnaire.mockReturnValue({
      completed: false,
      loading: false,
    });

    render(
      <QuestionnaireGuard>
        <div>Dashboard Content</div>
      </QuestionnaireGuard>,
    );

    expect(screen.getByRole('button', { name: 'Complete Questionnaire' })).toBeInTheDocument();

    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('should navigate to questionnaire when reminder button is clicked', () => {
    const assignSpy = vi.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign: assignSpy },
    });

    useQuestionnaire.mockReturnValue({
      completed: false,
      loading: false,
    });

    render(
      <QuestionnaireGuard>
        <div>Dashboard Content</div>
      </QuestionnaireGuard>,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Complete Questionnaire',
      }),
    );

    expect(assignSpy).toHaveBeenCalledWith('/hgnform');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('should render dashboard when questionnaire is completed', () => {
    useQuestionnaire.mockReturnValue({
      completed: true,
      loading: false,
    });

    render(
      <QuestionnaireGuard>
        <div>Dashboard Content</div>
      </QuestionnaireGuard>,
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Complete Questionnaire' }),
    ).not.toBeInTheDocument();
  });
});
