// Version 1.0.0
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import ReturnedLateChart from '../ReturnedLateChart';

vi.mock('axios', () => ({ default: { get: vi.fn() } }));
vi.mock('react-redux', () => ({ useSelector: () => false }));
vi.mock('antd', () => {
  const Select = ({ children, onChange, popupClassName, ...props }) => (
    <select {...props} onChange={event => onChange(event.target.value)}>
      {children}
    </select>
  );
  Select.Option = function Option({ children, ...props }) {
    return <option {...props}>{children}</option>;
  };
  return { Select };
});
vi.mock('react-chartjs-2', () => ({
  Bar: ({ data }) => <div data-testid="chart">{JSON.stringify(data)}</div>,
}));
vi.mock('react-datepicker', () => ({ default: () => <input aria-label="Date" /> }));
vi.mock('react-multi-select-component', () => ({
  MultiSelect: ({ options, disabled, onChange }) => (
    <select
      aria-label="Tool choices"
      disabled={disabled}
      onChange={event => onChange(options.filter(option => option.value === event.target.value))}
    >
      <option value="">All Tools</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const projects = [
  { projectId: 'p1', projectName: 'Project 1' },
  { projectId: 'p2', projectName: 'Project 2' },
];
const tools = [
  { ...projects[0], toolName: 'Project 1 - Drill', percentLate: 50 },
  { ...projects[1], toolName: 'Project 2 - Drill', percentLate: 20 },
  { ...projects[1], toolName: 'Saw & Blade', percentLate: 30 },
];

describe('ReturnedLateChart tool filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockImplementation(url =>
      Promise.resolve({
        data: { data: url.endsWith('/projects') ? projects : tools },
      }),
    );
  });

  it('enables All Projects tools and sends every saved name for a shared tool', async () => {
    render(<ReturnedLateChart />);
    const select = screen.getByRole('combobox', { name: 'Tool choices' });
    await screen.findByRole('option', { name: 'Drill' });
    expect(select.disabled).toBe(false);
    expect(screen.getAllByRole('option', { name: 'Drill' })).toHaveLength(1);
    fireEvent.change(select, { target: { value: 'Drill' } });
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('tools=Project%201%20-%20Drill%2CProject%202%20-%20Drill'),
        expect.anything(),
      ),
    );
  });

  it('limits tools to the selected project and encodes special characters', async () => {
    render(<ReturnedLateChart />);
    await screen.findByRole('option', { name: 'Drill' });
    fireEvent.change(screen.getByLabelText('Project:'), { target: { value: 'p2' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Tool choices' }), {
      target: { value: 'Saw & Blade' },
    });
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringMatching(/projectId=p2.*tools=Saw%20%26%20Blade/),
        expect.anything(),
      ),
    );
  });
  it('ignores a slower response from a previously selected project', async () => {
    render(<ReturnedLateChart />);
    await screen.findByRole('option', { name: 'Drill' });
    let resolveOld;
    axios.get.mockImplementation(url =>
      url.includes('projectId=p1')
        ? new Promise(resolve => {
            resolveOld = resolve;
          })
        : Promise.resolve({ data: { data: tools.filter(tool => tool.projectId === 'p2') } }),
    );
    fireEvent.change(screen.getByLabelText('Project:'), { target: { value: 'p1' } });
    await waitFor(() => expect(resolveOld).toBeDefined());
    fireEvent.change(screen.getByLabelText('Project:'), { target: { value: 'p2' } });
    await waitFor(() => expect(screen.getByTestId('chart').textContent).toContain('Saw & Blade'));
    await act(async () =>
      resolveOld({ data: { data: tools.filter(tool => tool.projectId === 'p1') } }),
    );
    expect(screen.getByTestId('chart').textContent).toContain('Saw & Blade');
  });
});
