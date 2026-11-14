import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Provider } from 'react-redux';
import axios from 'axios';
import ExperienceDonutChart, { renderSegmentLabel } from '../ExperienceDonutChart';

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

    // The note says these people are not part of the total or the percentages
    expect(
      await screen.findByText(
        "5 more applicants didn't report years of experience and aren't counted above.",
      ),
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

  it('says there are no applicants yet when nothing has been submitted', async () => {
    mockApi({ breakdown: [], total: 0, notReported: 0 });
    renderChart();

    expect(await screen.findByText('No applicants yet.')).toBeInTheDocument();
  });

  it('suggests widening the filters when they match nobody', async () => {
    renderChart();
    await experienceRows();
    mockApi({ breakdown: [], total: 0, notReported: 0 });

    fireEvent.change(screen.getByPlaceholderText('Start date'), {
      target: { value: '2025-01-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(
      await screen.findByText(
        'No applicants match these filters. Try a wider date range or fewer roles.',
      ),
    ).toBeInTheDocument();
  });

  it('explains an empty chart when every applicant left years blank', async () => {
    mockApi({ breakdown: [], total: 0, notReported: 3 });
    renderChart();

    expect(
      await screen.findByText('None of the 3 applicants here reported years of experience.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/more applicants? didn't report/)).not.toBeInTheDocument();
  });

  it('announces a failed request', async () => {
    axios.get.mockImplementation(url =>
      url.endsWith('/experience-roles')
        ? Promise.resolve({ data: [] })
        : Promise.reject({
            response: { data: { error: 'startDate must be on or before endDate.' } },
          }),
    );
    renderChart();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'startDate must be on or before endDate.',
    );
  });

  it('shows the newest filter results even if an older request answers last', async () => {
    let answerFirst;
    axios.get.mockImplementation((url, config) => {
      if (url.endsWith('/experience-roles')) return Promise.resolve({ data: [] });
      if (!config.params.startDate) {
        // The initial load is slow and answers after the filtered request
        return new Promise(resolve => {
          answerFirst = () => resolve({ data: breakdownResponse });
        });
      }
      return Promise.resolve({
        data: {
          total: 1,
          notReported: 0,
          breakdown: [
            { experience: '0-1 years', count: 1, percentage: 100 },
            { experience: '1-3 years', count: 0, percentage: 0 },
            { experience: '3-5 years', count: 0, percentage: 0 },
            { experience: '5+ years', count: 0, percentage: 0 },
          ],
        },
      });
    });
    renderChart();

    fireEvent.change(screen.getByPlaceholderText('Start date'), {
      target: { value: '2026-09-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect((await experienceRows())[0]).toBe('0-1 years1 applicant100.0%');

    answerFirst();
    await new Promise(r => setTimeout(r, 0));
    expect((await experienceRows())[0]).toBe('0-1 years1 applicant100.0%');
  });

  it('tells the admin when roles are loading or there are none yet', async () => {
    let answerRoles;
    axios.get.mockImplementation(url =>
      url.endsWith('/experience-roles')
        ? new Promise(resolve => {
            answerRoles = () => resolve({ data: [] });
          })
        : Promise.resolve({ data: breakdownResponse }),
    );
    renderChart();

    expect(screen.getByText('Loading roles…')).toBeInTheDocument();
    answerRoles();
    expect(await screen.findByText('No roles yet')).toBeInTheDocument();
  });
});

describe('renderSegmentLabel', () => {
  const props = { cx: 100, cy: 100, midAngle: 45, innerRadius: 40, outerRadius: 60, value: 1 };
  const labelTexts = labelProps => {
    const { container } = render(<svg>{renderSegmentLabel(labelProps)}</svg>);
    return within(container)
      .queryAllByText(/./)
      .map(node => node.textContent);
  };

  it('shows the count inside and the percentage outside a normal segment', () => {
    expect(labelTexts({ ...props, value: 12, percent: 0.316 })).toEqual(['12', '31.6%']);
  });

  it('drops the inside count on a sliver too thin to hold it', () => {
    expect(labelTexts({ ...props, percent: 0.03 })).toEqual(['3.0%']);
  });

  it('drops both labels on a tiny sliver so neighbours do not overlap', () => {
    expect(labelTexts({ ...props, percent: 0.015 })).toEqual([]);
  });
});
