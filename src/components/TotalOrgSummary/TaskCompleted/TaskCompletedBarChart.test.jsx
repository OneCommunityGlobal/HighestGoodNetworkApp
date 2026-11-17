import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TaskCompletedBarChart, { normalizeTaskCompletedStats } from './TaskCompletedBarChart';

afterEach(() => {
  vi.restoreAllMocks();
});

const readBlob = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });

describe('TaskCompletedBarChart', () => {
  it('supports assigned/completed alias keys returned by the API', () => {
    const stats = normalizeTaskCompletedStats({
      assigned: {
        current: 12,
        percentage: 0.2,
      },
      completed: {
        current: 9,
        percentage: -0.1,
      },
    });

    expect(stats).toEqual([
      {
        name: 'Assigned',
        amount: 12,
        change: 0.2,
      },
      {
        name: 'Completed',
        amount: 9,
        change: -0.1,
      },
    ]);
  });

  it('supports active/complete keys', () => {
    const stats = normalizeTaskCompletedStats({
      active: {
        current: 25,
        percentage: 10,
      },
      complete: {
        current: 20,
        percentage: 5,
      },
    });

    expect(stats).toEqual([
      {
        name: 'Assigned',
        amount: 25,
        change: 10,
      },
      {
        name: 'Completed',
        amount: 20,
        change: 5,
      },
    ]);
  });

  it('returns zero values when data is missing', () => {
    const stats = normalizeTaskCompletedStats({});

    expect(stats).toEqual([
      {
        name: 'Assigned',
        amount: 0,
        change: 0,
      },
      {
        name: 'Completed',
        amount: 0,
        change: 0,
      },
    ]);
  });

  it('exports counts from paired current and comparison response objects', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:task-stats');
    const clickLink = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <TaskCompletedBarChart
        isLoading
        data={{
          raw: {
            current: { assigned: 7, completed: 8 },
            comparison: { assigned: 3, completed: 4 },
          },
        }}
        darkMode={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    const csv = await readBlob(createObjectURL.mock.calls[0][0]);

    expect(csv).toBe(
      'Range,Status,Count\n' +
        'Current,assigned,7\n' +
        'Current,completed,8\n' +
        'Comparison,assigned,3\n' +
        'Comparison,completed,4\n',
    );
    expect(clickLink).toHaveBeenCalledOnce();
  });

  it('continues to export legacy raw-data arrays', async () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:task-stats');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(
      <TaskCompletedBarChart
        isLoading
        data={{
          raw: {
            current: [
              { _id: 'assigned', count: 7 },
              { _id: 'completed', count: 8 },
            ],
          },
        }}
        darkMode={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));

    const csv = await readBlob(createObjectURL.mock.calls[0][0]);

    expect(csv).toBe('Range,Status,Count\nCurrent,assigned,7\nCurrent,completed,8\n');
  });
});
