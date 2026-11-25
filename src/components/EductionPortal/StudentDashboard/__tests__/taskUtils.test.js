import {
  calculateProgressPercentage,
  canMarkTaskAsDone,
  getMarkAsDoneTooltip,
  getTaskStatusBadge,
} from '../taskUtils';

const styles = {
  completedBadge: 'completed',
  hoursMetBadge: 'hours-met',
  commentsBadge: 'comments',
  pendingBadge: 'pending',
  inProgressBadge: 'in-progress',
};
const task = { task_type: 'read', logged_hours: 3, suggested_total_hours: 5 };

it.each([
  ['assigned', 'Assigned', styles.pendingBadge],
  ['in_progress', 'In Progress', styles.inProgressBadge],
  ['submitted', 'Pending Review', styles.pendingBadge],
  ['pending_review', 'Pending Review', styles.pendingBadge],
  ['completed', 'Completed', styles.completedBadge],
  ['graded', 'Completed', styles.completedBadge],
  ['unknown', 'Pending Review', styles.pendingBadge],
])('maps %s with partial hours to %s', (status, text, className) => {
  expect(getTaskStatusBadge({ ...task, status }, styles)).toEqual({ text, className });
});

it.each([5, 6])('shows Hours Met for an in-progress reading task with %s hours', loggedHours => {
  expect(
    getTaskStatusBadge({ ...task, status: 'in_progress', logged_hours: loggedHours }, styles),
  ).toEqual({ text: 'Hours Met', className: styles.hoursMetBadge });
});

it.each(['assigned', 'in_progress', 'submitted', 'pending_review'])(
  'preserves Comments precedence over %s',
  status => {
    expect(getTaskStatusBadge({ ...task, status, has_comments: true }, styles)).toEqual({
      text: 'Comments',
      className: styles.commentsBadge,
    });
  },
);

it('preserves feedback-based Comments', () => {
  expect(
    getTaskStatusBadge({ ...task, status: 'in_progress', feedback: 'Review me' }, styles),
  ).toEqual({
    text: 'Comments',
    className: styles.commentsBadge,
  });
});

it.each(['assigned', 'in_progress', 'submitted', 'pending_review'])(
  'preserves Hours Met precedence over Comments and %s',
  status => {
    expect(
      getTaskStatusBadge({ ...task, status, logged_hours: 5, has_comments: true }, styles),
    ).toEqual({ text: 'Hours Met', className: styles.hoursMetBadge });
  },
);

it.each(['completed', 'graded'])('preserves %s precedence over Hours Met and Comments', status => {
  expect(
    getTaskStatusBadge({ ...task, status, logged_hours: 5, has_comments: true }, styles),
  ).toEqual({ text: 'Completed', className: styles.completedBadge });
});

it('preserves Hours Met precedence for uploaded write tasks', () => {
  expect(
    getTaskStatusBadge(
      { ...task, status: 'in_progress', task_type: 'write', has_upload: true, has_comments: true },
      styles,
    ),
  ).toEqual({ text: 'Hours Met', className: styles.hoursMetBadge });
});

it('preserves the subtask completion requirement for the Completed badge', () => {
  const completedTask = { ...task, status: 'completed' };
  expect(getTaskStatusBadge(completedTask, styles, [{ status: 'completed' }])).toEqual({
    text: 'Completed',
    className: styles.completedBadge,
  });
  expect(getTaskStatusBadge(completedTask, styles, [{ status: 'assigned' }])).toEqual({
    text: 'Pending Review',
    className: styles.pendingBadge,
  });
});

describe('manual completion eligibility', () => {
  it.each([0, -1, null, undefined, NaN, Infinity, '5'])(
    'rejects invalid suggested hours %s even with completed subtasks',
    suggestedHours => {
      const readTask = { ...task, logged_hours: 5, suggested_total_hours: suggestedHours };
      [[], [{ status: 'completed' }]].forEach(subtasks => {
        expect(canMarkTaskAsDone(readTask, subtasks)).toBe(false);
        expect(getMarkAsDoneTooltip(readTask, subtasks)).toBe(
          'Cannot mark as done: Task type or suggested hours are missing or invalid',
        );
      });
    },
  );

  it('preserves valid reading hours and subtask checks', () => {
    expect(canMarkTaskAsDone(task)).toBe(false);
    expect(canMarkTaskAsDone({ ...task, logged_hours: 5 })).toBe(true);
    expect(canMarkTaskAsDone({ ...task, logged_hours: 6 })).toBe(true);
    expect(canMarkTaskAsDone(task, [{ status: 'assigned' }])).toBe(false);
    expect(canMarkTaskAsDone(task, [{ status: 'completed' }])).toBe(true);
    expect(canMarkTaskAsDone({ ...task, is_completed: true, logged_hours: 5 })).toBe(false);
  });

  it('does not enable manual completion for a write task that reaches its hours target', () => {
    expect(canMarkTaskAsDone({ ...task, task_type: 'write', logged_hours: 5 })).toBe(false);
  });
});

describe('Write completion progress', () => {
  it.each(['completed', 'graded'])(
    'shows 100 percent for %s Write tasks regardless of hours or subtasks',
    status => {
      [0, 0.5, undefined].forEach(hours => {
        [[], [{ status: 'assigned' }]].forEach(subtasks => {
          expect(
            calculateProgressPercentage(
              { ...task, task_type: 'write', status, logged_hours: hours },
              subtasks,
            ),
          ).toBe(100);
        });
      });
    },
  );

  it.each(['read', 'write'])(
    'preserves hours and subtask progress for unfinished %s tasks',
    taskType => {
      const activeTask = { ...task, task_type: taskType, status: 'in_progress' };
      expect(calculateProgressPercentage(activeTask)).toBe(60);
      expect(
        calculateProgressPercentage(activeTask, [{ status: 'completed' }, { status: 'assigned' }]),
      ).toBe(50);
    },
  );

  it('preserves completed Read progress calculations', () => {
    expect(calculateProgressPercentage({ ...task, status: 'completed' })).toBe(60);
  });
});
