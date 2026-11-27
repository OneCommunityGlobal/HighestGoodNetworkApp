import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CompletedTasksPieChart, {
  ColorSwatchCell,
  MAX_VISIBLE_TASKS,
  PieTooltip,
  TotalHoursLabel,
} from '../CompletedTasksPieChart';

const mockUseSelector = vi.fn();

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useSelector: selector => mockUseSelector(selector),
  };
});

const makeTasks = count =>
  Array.from({ length: count }, (unused, i) => ({
    projectId: `proj-${i}`,
    projectName: `Task ${i}`,
    totalTime: 1,
  }));

const renderChart = taskCount => {
  mockUseSelector.mockReturnValue({ tasksWithLoggedHoursById: makeTasks(taskCount) });
  return render(<CompletedTasksPieChart darkMode={false} />);
};

const countTaskRows = () =>
  screen.getAllByTestId('color-swatch').length;

describe('CompletedTasksPieChart task list cap', () => {
  beforeEach(() => {
    mockUseSelector.mockReset();
  });

  // Pinned to the literal on purpose: the other tests reference MAX_VISIBLE_TASKS
  // symbolically, so they stay green if the cap is lowered for local debugging.
  // This one fails if a temporary value gets committed.
  it('caps the collapsed list at 20, the agreed product limit', () => {
    expect(MAX_VISIBLE_TASKS).toBe(20);
  });

  it('caps the collapsed list at the limit', () => {
    renderChart(MAX_VISIBLE_TASKS + 13);

    expect(countTaskRows()).toBe(MAX_VISIBLE_TASKS);
  });

  it('renders every task without a toggle when at or under the cap', () => {
    renderChart(MAX_VISIBLE_TASKS);

    expect(countTaskRows()).toBe(MAX_VISIBLE_TASKS);
    expect(screen.queryByTestId('toggle-more-tasks')).not.toBeInTheDocument();
  });

  it('labels the toggle with the number of hidden tasks', () => {
    renderChart(MAX_VISIBLE_TASKS + 13);

    expect(screen.getByTestId('toggle-more-tasks')).toHaveTextContent('+ 13 more tasks');
  });

  it('singularizes the label when exactly one task is hidden', () => {
    renderChart(MAX_VISIBLE_TASKS + 1);

    expect(screen.getByTestId('toggle-more-tasks')).toHaveTextContent('+ 1 more task');
  });

  it('expands to every task and collapses back to the cap', () => {
    renderChart(MAX_VISIBLE_TASKS + 13);
    const toggle = screen.getByTestId('toggle-more-tasks');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(countTaskRows()).toBe(MAX_VISIBLE_TASKS + 13);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveTextContent('Show less');

    fireEvent.click(toggle);
    expect(countTaskRows()).toBe(MAX_VISIBLE_TASKS);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveTextContent('+ 13 more tasks');
  });

  it('keeps the total hours row rendered after the list in both states', () => {
    renderChart(MAX_VISIBLE_TASKS + 5);

    expect(screen.getByText('Total Hours:')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('toggle-more-tasks'));
    expect(screen.getByText('Total Hours:')).toBeInTheDocument();
  });
});

describe('ColorSwatchCell', () => {
  const colorScale = { proj1: '#ff00aa', proj2: '#00aaff' };

  it('paints the swatch with the color looked up from column.colorScale', () => {
    render(<ColorSwatchCell value="proj1" column={{ colorScale }} />);
    const swatch = screen.getByTestId('color-swatch');

    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(255, 0, 170)' });
  });

  it('renders no background color when the value is not in the colorScale', () => {
    render(<ColorSwatchCell value="unknown" column={{ colorScale }} />);
    const swatch = screen.getByTestId('color-swatch');

    expect(swatch).not.toHaveAttribute('style');
  });
});

describe('submitted task links', () => {
  const firstLink = 'https://example.com/first';
  const secondLink = 'https://example.com/second';

  const renderInactiveUserReport = relatedWorkLinks => {
    const userId = 'inactive-user';
    const state = {
      userProfile: { _id: userId, isActive: false },
      userTask: [],
      timeEntries: {
        period: [
          { personId: userId, taskId: 'task-1', taskName: 'Historical task', hours: 1 },
          { personId: userId, taskId: 'task-1', taskName: 'Historical task', hours: 2, relatedWorkLinks },
          { personId: userId, taskId: 'task-2', taskName: 'Unlinked task', hours: 1 },
          { personId: 'another-user', taskId: 'task-2', hours: 1, relatedWorkLinks: [secondLink] },
        ],
      },
    };
    mockUseSelector.mockImplementation(selector => selector(state));
    return render(<CompletedTasksPieChart darkMode />);
  };

  afterEach(() => vi.restoreAllMocks());

  it('omits the icon for tasks without usable links', () => {
    renderInactiveUserReport(['', null, 'https://', 'javascript:alert(1)', '//example.com']);

    expect(screen.getByText('Historical task')).toBeInTheDocument();
    expect(screen.getByText('Unlinked task')).toBeInTheDocument();
    expect(screen.queryByLabelText(/open submitted link/i)).not.toBeInTheDocument();
  });

  it('opens one valid link from a deactivated user’s historical task in a popup', () => {
    const popup = { opener: window, location: { replace: vi.fn() } };
    const open = vi.spyOn(window, 'open').mockReturnValue(popup);
    renderInactiveUserReport(['javascript:alert(1)', ' example.com/first ', firstLink]);

    const trigger = screen.getByRole('link', { name: 'Open submitted link for Historical task' });
    fireEvent.click(trigger);

    expect(open).toHaveBeenCalledWith('', '_blank', expect.stringContaining('popup'));
    expect(popup.opener).toBeNull();
    expect(popup.location.replace).toHaveBeenCalledWith(firstLink);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('leaves Command and Control clicks to native new-tab navigation', () => {
    const open = vi.spyOn(window, 'open');
    renderInactiveUserReport([firstLink]);

    const trigger = screen.getByRole('link', { name: 'Open submitted link for Historical task' });
    expect(trigger).toHaveAttribute('href', firstLink);
    expect(trigger).toHaveAttribute('target', '_blank');
    expect(fireEvent.click(trigger, { metaKey: true })).toBe(true);
    expect(fireEvent.click(trigger, { ctrlKey: true })).toBe(true);
    expect(open).not.toHaveBeenCalled();
  });

  it('provides an individual link when a single popup is blocked', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    renderInactiveUserReport([firstLink]);

    fireEvent.click(screen.getByRole('link', { name: 'Open submitted link for Historical task' }));

    const dialog = within(screen.getByRole('dialog', { name: 'Submitted Links' }));
    expect(dialog.getByRole('status')).toHaveTextContent('Your browser blocked a window.');
    expect(dialog.getByRole('link', { name: firstLink })).toHaveAttribute('href', firstLink);
  });

  it('lists multiple links, handles partially blocked Open All, and closes only via Close', async () => {
    const popup = { opener: window, location: { replace: vi.fn() } };
    const open = vi.spyOn(window, 'open').mockReturnValueOnce(popup).mockReturnValueOnce(null);
    renderInactiveUserReport([firstLink, '', secondLink]);

    const trigger = screen.getByRole('button', { name: 'Open submitted links for Historical task' });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Submitted Links' });
    const contents = within(dialog);
    expect(contents.getAllByRole('link')).toHaveLength(2);
    expect(contents.getByRole('link', { name: firstLink })).toHaveAttribute('target', '_blank');
    const individual = contents.getByRole('link', { name: secondLink });
    expect(individual).toHaveAttribute('href', secondLink);
    fireEvent.click(individual);
    expect(dialog).toBeInTheDocument();

    fireEvent.click(contents.getByRole('button', { name: 'Open All' }));
    expect(open).toHaveBeenCalledTimes(2);
    expect(popup.location.replace).toHaveBeenCalledWith(firstLink);
    expect(contents.getByRole('status')).toHaveTextContent('Your browser blocked a window.');
    expect(contents.getByRole('link', { name: secondLink })).toBeInTheDocument();

    fireEvent.keyUp(dialog, { key: 'Escape', keyCode: 27 });
    fireEvent.mouseDown(dialog);
    fireEvent.click(dialog);
    expect(dialog).toBeInTheDocument();

    fireEvent.click(contents.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  });
});

describe('TotalHoursLabel', () => {
  it('renders the total hours formatted to two decimals with the Hrs suffix', () => {
    render(
      <svg>
        <TotalHoursLabel total={12.345} darkMode={false} />
      </svg>,
    );
    const text = screen.getByTestId('total-hours-label');

    expect(text).toHaveTextContent('12.35 Hrs');
  });

  it('uses white text in dark mode and black in light mode', () => {
    render(
      <svg>
        <TotalHoursLabel total={1} darkMode />
      </svg>,
    );
    render(
      <svg>
        <TotalHoursLabel total={1} darkMode={false} />
      </svg>,
    );
    const [dark, light] = screen.getAllByTestId('total-hours-label');

    expect(dark).toHaveAttribute('fill', '#ffffff');
    expect(light).toHaveAttribute('fill', '#000000');
  });

  it('centers the label at 50%/50% with text-anchor middle', () => {
    render(
      <svg>
        <TotalHoursLabel total={0} darkMode={false} />
      </svg>,
    );
    const text = screen.getByTestId('total-hours-label');

    expect(text).toHaveAttribute('x', '50%');
    expect(text).toHaveAttribute('y', '50%');
    expect(text).toHaveAttribute('text-anchor', 'middle');
    expect(text).toHaveAttribute('dominant-baseline', 'central');
  });
});

describe('PieTooltip', () => {
  const baseProps = {
    active: true,
    payload: [
      {
        name: 'Project A',
        value: 3.5,
        payload: { fill: '#abcdef', index: 0 },
      },
    ],
    colors: ['#abcdef'],
    darkMode: false,
    total: 10,
  };

  it('renders the project name and the padded hours + percentage detail', () => {
    render(<PieTooltip {...baseProps} />);

    expect(screen.getByTestId('tooltip-name')).toHaveTextContent('Project A');
    expect(screen.getByTestId('tooltip-detail')).toHaveTextContent('3.50 hrs (35.0%)');
  });

  it('renders the swatch when one is supplied', () => {
    const payload = [{ ...baseProps.payload[0], payload: { fill: '#112233', index: 0 } }];
    render(<PieTooltip {...baseProps} payload={payload} />);
    const swatch = screen.getByTestId('tooltip-swatch');

    expect(swatch).toHaveStyle({ backgroundColor: 'rgb(17, 34, 51)' });
  });

  it('omits the swatch when none is supplied', () => {
    const payload = [{ ...baseProps.payload[0], payload: {} }];
    render(<PieTooltip {...baseProps} payload={payload} colors={[]} />);

    expect(screen.queryByTestId('tooltip-swatch')).not.toBeInTheDocument();
  });

  it('reports 0.0% when total is zero', () => {
    const payload = [{ ...baseProps.payload[0], value: 5 }];
    render(<PieTooltip {...baseProps} payload={payload} total={0} />);

    expect(screen.getByTestId('tooltip-detail')).toHaveTextContent('5.00 hrs (0.0%)');
  });
});
