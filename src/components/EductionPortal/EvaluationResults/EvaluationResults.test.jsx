import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EvaluationResults from './EvaluationResults';
import styles from './EvaluationResults.module.css';
import httpService from '../../../services/httpService';
import { ENDPOINTS } from '../../../utils/URL';

vi.mock('../../../services/httpService', () => ({ default: { get: vi.fn() } }));
vi.mock('react-redux', () => ({ connect: () => Component => Component }));

const auth = { user: { userid: 'student-one', firstName: 'Student' } };
const fixture = () => ({
  summary: {
    overallScore: 72,
    earnedMarks: 120,
    maxMarks: 150,
    totalTasks: 9,
    onTimeSubmissions: 7,
    lateSubmissions: 2,
    averageScore: 75,
  },
  categories: [
    {
      evaluationId: 'category-one',
      category: 'Assignments',
      weightage: 40,
      completedItems: 1,
      marks: 90,
      maxMarks: 100,
      percentage: 90,
    },
  ],
  taskResults: [
    {
      taskId: 'task-one',
      taskName: 'Essay',
      category: 'Assignments',
      type: 'assignment',
      weightage: 0,
      marks: 90,
      maxMarks: 100,
      percentage: 90,
      status: 'graded',
      submissionStatus: 'late',
      submissionDate: '2026-11-12T12:00:00Z',
      dueDate: '2026-11-10T12:00:00Z',
      feedback: 'Clear reasoning.',
    },
  ],
  teacherFeedback: {
    teacherName: 'Teacher',
    teacherTitle: 'Educator',
    overall: 'Good progress.',
    strengths: ['Reasoning'],
    improvements: ['Timeliness'],
  },
});
const respond = data => httpService.get.mockResolvedValue({ data });
const deferred = () => {
  let resolve;
  const promise = new Promise(done => {
    resolve = done;
  });
  return { promise, resolve };
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Evaluation Results API integration', () => {
  it('maps API data and uses weighted backend scores and counts', async () => {
    respond(fixture());
    render(<EvaluationResults auth={auth} />);
    expect(screen.getByText('Loading Your Academic Performance...')).toBeInTheDocument();
    expect(await screen.findByText('72%')).toBeInTheDocument();
    expect(httpService.get).toHaveBeenCalledWith(
      `${ENDPOINTS.APIEndpoint()}/student/evaluation-results`,
    );
    expect(screen.getByRole('progressbar', { name: 'Overall performance' })).toHaveAttribute(
      'aria-valuenow',
      '72',
    );
    expect(screen.getByText('Total Score: 120/150 points')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getAllByText('Essay')).toHaveLength(2);
    expect(screen.getAllByText('Late')).toHaveLength(2);
    expect(screen.getByText('Good progress.')).toBeInTheDocument();
    const progress = screen.getByRole('progressbar', { name: 'Overall performance' });
    expect(within(progress).getByText('', { selector: `.${styles.progressFill}` })).toHaveStyle({
      width: '72%',
    });
    const category = screen.getByRole('row', { name: /^Assignments / });
    expect(
      within(category)
        .getAllByRole('cell')
        .map(cell => cell.textContent),
    ).toEqual(['Assignments', '40%', '1', '100', '90', '90%', '']);
    const task = screen.getByRole('row', { name: /^Essay / });
    const cells = within(task).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent(
      `Submitted: ${new Date(fixture().taskResults[0].submissionDate).toLocaleDateString()}`,
    );
    expect(cells[1]).toHaveTextContent(/^0%$/);
    expect(cells[2]).toHaveTextContent(/^90\/100$/);
    expect(cells[3]).toHaveTextContent(/^90%$/);
    expect(cells[4]).toHaveTextContent(/^Late$/);
    expect(screen.getByText('Teacher', { selector: `.${styles.teacherName}` })).toBeInTheDocument();
    expect(
      screen.getByText('Educator', { selector: `.${styles.teacherTitle}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Reasoning', { selector: `.${styles.feedbackTextItem}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Timeliness', { selector: `.${styles.feedbackTextItem}` }),
    ).toBeInTheDocument();
  });

  it('maps feedback to the existing modal and closes it', async () => {
    respond(fixture());
    render(<EvaluationResults auth={auth} />);
    fireEvent.click((await screen.findAllByText('View Feedback'))[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Clear reasoning.')).toBeInTheDocument();
    expect(within(dialog).getByText('assignment')).toBeInTheDocument();
    expect(within(dialog).getByText('0%')).toBeInTheDocument();
    expect(within(dialog).getByText('90/100')).toHaveTextContent('90/100(90%)');
    expect(within(dialog).getByText('Late')).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        `Due: ${new Date(fixture().taskResults[0].dueDate).toLocaleDateString()}`,
      ),
    ).toBeInTheDocument();
    const submitted = new Date(fixture().taskResults[0].submissionDate);
    expect(
      within(dialog).getByText(
        `${submitted.toLocaleDateString()} at ${submitted.toLocaleTimeString()}`,
      ),
    ).toBeInTheDocument();
    fireEvent.click(within(dialog).getByText('Close', { selector: 'button' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('preserves zero and displays missing scores and dates without fabricating values', async () => {
    const data = fixture();
    data.summary = {
      overallScore: 0,
      earnedMarks: 0,
      maxMarks: null,
      totalTasks: 1,
      onTimeSubmissions: 0,
      lateSubmissions: 0,
      averageScore: null,
    };
    data.categories[0] = { evaluationId: 'c', category: 'Ungraded', percentage: null };
    data.taskResults[0] = {
      taskId: 't',
      taskName: 'Pending task',
      weightage: 0,
      marks: 0,
      maxMarks: null,
      percentage: null,
      submissionStatus: 'pending',
    };
    data.teacherFeedback = null;
    respond(data);
    render(<EvaluationResults auth={auth} />);
    await screen.findByText('Total Score: 0/— points');
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pending')).toHaveLength(2);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Invalid Date|NaN|undefined|1970/)).not.toBeInTheDocument();
    expect(screen.queryByText('8%')).not.toBeInTheDocument();
    const progress = screen.getByRole('progressbar', { name: 'Overall performance' });
    expect(progress).toHaveAttribute('aria-valuenow', '0');
    expect(within(progress).getByText('', { selector: `.${styles.progressFill}` })).toHaveStyle({
      width: '0%',
    });
    const category = screen.getByRole('row', { name: /^Ungraded / });
    expect(
      within(category)
        .getAllByRole('cell')
        .map(cell => cell.textContent),
    ).toEqual(['Ungraded', '—', '—', '—', '—', '—', '']);
    const cells = within(screen.getByRole('row', { name: /^Pending task / })).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent('Submitted: —');
    expect(cells[1]).toHaveTextContent(/^0%$/);
    expect(cells[2]).toHaveTextContent(/^0\/—$/);
    expect(cells[3]).toHaveTextContent(/^—$/);
    expect(cells[4]).toHaveTextContent(/^Pending$/);
    expect(screen.getByText('—', { selector: `.${styles.teacherName}` })).toBeInTheDocument();
    expect(screen.getByText('—', { selector: `.${styles.teacherTitle}` })).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole('row', { name: /^Pending task / })).getByRole('button', {
        name: /View Feedback/,
      }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('0/—')).toHaveTextContent('0/—(—)');
    expect(within(dialog).getByText('0%')).toBeInTheDocument();
    expect(within(dialog).getByText('Due: —')).toBeInTheDocument();
    expect(
      within(dialog).getByText('—', { selector: `.${styles.assignmentType}` }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText('—', { selector: `.${styles.feedbackText}` }),
    ).toBeInTheDocument();
    expect(within(dialog).getAllByText('—', { selector: `.${styles.detailValue}` })).toHaveLength(
      2,
    );
    expect(within(dialog).getByText('Pending')).toBeInTheDocument();
  });

  it('does not present an unavailable overall score as zero', async () => {
    const data = fixture();
    data.summary.overallScore = null;
    respond(data);
    render(<EvaluationResults auth={auth} />);
    const progress = await screen.findByRole('progressbar', { name: 'Overall performance' });
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.queryByText('72%')).not.toBeInTheDocument();
  });

  it('shows the empty state for a successful empty response', async () => {
    respond({ summary: {}, categories: [], taskResults: [], teacherFeedback: {} });
    render(<EvaluationResults auth={auth} />);
    expect(
      await screen.findByText('No evaluation results available at this time.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Overall Grade')).not.toBeInTheDocument();
  });

  it.each([
    [401, 'Please sign in to view your evaluation results.'],
    [403, 'You do not have permission to view evaluation results.'],
    [404, 'Your student profile was not found.'],
    [500, 'Unable to load evaluation results. Please try again.'],
    [null, 'Unable to load evaluation results. Please try again.'],
  ])('handles %s errors and retries successfully', async (status, message) => {
    httpService.get.mockRejectedValueOnce(
      status ? { response: { status } } : new Error('Network error'),
    );
    render(<EvaluationResults auth={auth} />);
    expect(await screen.findByText(message)).toBeInTheDocument();
    respond(fixture());
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('72%')).toBeInTheDocument();
    expect(httpService.get).toHaveBeenCalledTimes(2);
  });

  it('keeps the six-task limit in desktop and mobile layouts', async () => {
    const data = fixture();
    data.taskResults = Array.from({ length: 7 }, (_, index) => ({
      ...data.taskResults[0],
      taskId: `task-${index}`,
      taskName: `Task ${index}`,
    }));
    respond(data);
    render(<EvaluationResults auth={auth} />);
    await screen.findByText('72%');
    expect(screen.getAllByText('Task 5')).toHaveLength(2);
    expect(screen.queryByText('Task 6')).not.toBeInTheDocument();
  });

  it('ignores an old account response after the account changes', async () => {
    const old = deferred();
    httpService.get.mockReturnValueOnce(old.promise);
    const view = render(<EvaluationResults auth={auth} />);
    const next = fixture();
    next.summary.overallScore = 81;
    respond(next);
    view.rerender(<EvaluationResults auth={{ user: { userid: 'student-two' } }} />);
    await screen.findByText('81%');
    await act(async () => {
      old.resolve({ data: fixture() });
    });
    expect(screen.queryByText('72%')).not.toBeInTheDocument();
    expect(screen.getByText('81%')).toBeInTheDocument();
  });

  it('ignores a response after unmount', async () => {
    const request = deferred();
    httpService.get.mockReturnValueOnce(request.promise);
    const view = render(<EvaluationResults auth={auth} />);
    view.unmount();
    await act(async () => {
      request.resolve({ data: fixture() });
    });
    expect(screen.queryByText('72%')).not.toBeInTheDocument();
  });

  it('does not fetch without an authenticated account', async () => {
    render(<EvaluationResults auth={{}} />);
    expect(
      await screen.findByText('Please sign in to view your evaluation results.'),
    ).toBeInTheDocument();
    expect(httpService.get).not.toHaveBeenCalled();
  });
});
