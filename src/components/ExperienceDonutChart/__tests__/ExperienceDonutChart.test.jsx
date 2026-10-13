import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import axios from 'axios';
import ExperienceDonutChart from '../ExperienceDonutChart';

vi.mock('axios');

const mockStore = {
  getState: () => ({ theme: { darkMode: false } }),
  subscribe: () => () => {},
  dispatch: vi.fn(),
};

const breakdownResponse = {
  total: 52,
  notReported: 5,
  breakdown: [
    { experience: '0-1 years', count: 14, percentage: 26.9 },
    { experience: '1-3 years', count: 23, percentage: 44.2 },
    { experience: '3-5 years', count: 9, percentage: 17.3 },
    { experience: '5+ years', count: 6, percentage: 11.5 },
  ],
};

const mockApi = (breakdown = breakdownResponse) => {
  axios.get.mockImplementation(url =>
    Promise.resolve({
      data: url.endsWith('/experience-roles')
        ? ['Project Manager', 'Software Engineer', 'UX Designer']
        : breakdown,
    }),
  );
};

const breakdownCalls = () =>
  axios.get.mock.calls.filter(([url]) => url.endsWith('/experience-breakdown'));

const experienceRows = async () => {
  const list = await screen.findByRole('list', { name: 'Applicants by experience' });
  return within(list)
    .getAllByRole('listitem')
    .map(item => item.textContent);
};

const renderChart = () =>
  render(
    <Provider store={mockStore}>
      <ExperienceDonutChart />
    </Provider>,
  );

describe('ExperienceDonutChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
    mockApi();
  });

  it('shows the spec title and each experience group with count and percentage', async () => {
    renderChart();

    expect(
      screen.getByRole('heading', { name: 'Breakdown of Applicants by Experience' }),
    ).toBeInTheDocument();
    expect(await experienceRows()).toEqual([
      '0-1 years14 applicants26.9%',
      '1-3 years23 applicants44.2%',
      '3-5 years9 applicants17.3%',
      '5+ years6 applicants11.5%',
    ]);
  });

  it('says how many applicants did not report their experience', async () => {
    renderChart();

    expect(
      await screen.findByText("5 applicants didn't report years of experience."),
    ).toBeInTheDocument();
  });

  it('offers the roles applicants actually applied for', async () => {
    renderChart();
    await experienceRows();

    fireEvent.keyDown(screen.getByLabelText('Roles'), { key: 'ArrowDown' });

    expect(await screen.findByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('UX Designer')).toBeInTheDocument();
    expect(screen.queryByText('DevOps Engineer')).not.toBeInTheDocument();
  });

  it("sends the viewer's local start and end of the chosen days when filters are applied", async () => {
    renderChart();
    await experienceRows();

    fireEvent.change(screen.getByPlaceholderText('Start date'), {
      target: { value: '2026-09-01' },
    });
    fireEvent.change(screen.getByPlaceholderText('End date'), {
      target: { value: '2026-09-30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(breakdownCalls()).toHaveLength(2));
    expect(breakdownCalls()[1][1].params).toEqual({
      startDate: new Date(2026, 8, 1, 0, 0, 0, 0).toISOString(),
      endDate: new Date(2026, 8, 30, 23, 59, 59, 999).toISOString(),
    });
  });

  it('sends selected roles as a list so titles with commas survive', async () => {
    mockApi();
    axios.get.mockImplementation(url =>
      Promise.resolve({
        data: url.endsWith('/experience-roles')
          ? ['Software Engineer, Frontend', 'UX Designer']
          : breakdownResponse,
      }),
    );
    renderChart();
    await experienceRows();

    fireEvent.keyDown(screen.getByLabelText('Roles'), { key: 'ArrowDown' });
    fireEvent.click(await screen.findByText('Software Engineer, Frontend'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(breakdownCalls()).toHaveLength(2));
    expect(breakdownCalls()[1][1].params).toEqual({ roles: ['Software Engineer, Frontend'] });
  });

  it('says so when the role list cannot be loaded', async () => {
    axios.get.mockImplementation(url =>
      url.endsWith('/experience-roles')
        ? Promise.reject(new Error('Network Error'))
        : Promise.resolve({ data: breakdownResponse }),
    );
    renderChart();

    expect(await screen.findByText('Roles unavailable')).toBeInTheDocument();
  });

  it('shows a no-data message when nothing matches', async () => {
    mockApi({ breakdown: [], total: 0, notReported: 0 });
    renderChart();

    expect(await screen.findByText('No Data Available')).toBeInTheDocument();
  });
});
