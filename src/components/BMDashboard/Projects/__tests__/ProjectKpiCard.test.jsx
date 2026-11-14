import { createEvent, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { MemoryRouter, useLocation } from 'react-router-dom';
import ProjectKpiCard from '../ProjectKpiCard';
import ProjectSummary from '../ProjectSummary';
import ProjectsList from '../ProjectsList';
import cardStyles from '../ProjectKpiCard.module.css';
import summaryStyles from '../ProjectSummary.module.css';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ data, children }) => (
    <div data-testid="line-chart" data-points={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: () => null,
}));

vi.mock('react-select', () => ({
  default: ({ options, onChange, value }) => (
    <select
      aria-label="Select projects"
      multiple
      value={value.map(option => option.value)}
      onChange={event => {
        const selected = Array.from(event.target.selectedOptions, option => option.value);
        onChange(options.filter(option => selected.includes(option.value)));
      }}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

const mockStore = configureMockStore([]);
const renderWithStore = (element, state = {}) =>
  render(
    <Provider store={mockStore({ theme: { darkMode: false }, ...state })}>
      <MemoryRouter>{element}</MemoryRouter>
    </Provider>,
  );

describe('ProjectKpiCard', () => {
  const firePointer = (element, type, pointerType, relatedTarget = null) => {
    const eventType = { pointerEnter: 'pointerOver', pointerLeave: 'pointerOut' }[type] || type;
    const event = createEvent[eventType](element, { bubbles: true });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    Object.defineProperty(event, 'relatedTarget', { value: relatedTarget });
    fireEvent(element, event);
  };

  it('opens on hover, stays open over the tooltip and closes on pointer leave', () => {
    renderWithStore(<ProjectKpiCard title="Hours" tooltip="Recorded hours" value={1} />);
    const trigger = screen.getByRole('button', { name: 'About Hours' });
    firePointer(trigger, 'pointerEnter', 'mouse');
    const popup = screen.getByRole('tooltip');
    expect(popup).toHaveTextContent('Recorded hours');
    expect(screen.getByRole('article', { name: 'Hours' })).not.toContainElement(popup);
    expect(document.body).toContainElement(popup);
    expect(trigger).toHaveAccessibleDescription('Recorded hours');
    firePointer(trigger, 'pointerLeave', 'mouse', popup);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    firePointer(popup, 'pointerLeave', 'mouse');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('dismisses on Escape without losing focus, and reopens only on a new interaction', async () => {
    renderWithStore(<ProjectKpiCard title="Hours" tooltip="Recorded hours" value={1} />);
    const trigger = screen.getByRole('button', { name: 'About Hours' });
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Recorded hours');
    firePointer(trigger, 'pointerEnter', 'mouse');
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleDescription('Recorded hours');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    firePointer(trigger, 'pointerLeave', 'mouse');
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    firePointer(trigger, 'pointerEnter', 'mouse');
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('allows touch activation and dismissal by a second tap or outside click', () => {
    renderWithStore(
      <>
        <ProjectKpiCard title="Hours" tooltip="Recorded hours" value={1} />
        <button type="button">Outside</button>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'About Hours' });
    firePointer(trigger, 'pointerDown', 'touch');
    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    firePointer(trigger, 'pointerLeave', 'touch');
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    firePointer(trigger, 'pointerDown', 'touch');
    fireEvent.click(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    firePointer(trigger, 'pointerDown', 'touch');
    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('keeps tooltip interactions independent for multiple cards', () => {
    renderWithStore(
      <>
        <ProjectKpiCard title="Hours" tooltip="Hours explanation" value={1} />
        <ProjectKpiCard title="Members" tooltip="Members explanation" value={2} />
      </>,
    );
    const hours = screen.getByRole('button', { name: 'About Hours' });
    const members = screen.getByRole('button', { name: 'About Members' });
    firePointer(hours, 'pointerEnter', 'mouse');
    firePointer(members, 'pointerEnter', 'mouse');
    expect(screen.getAllByRole('tooltip')).toHaveLength(2);
    firePointer(hours, 'pointerLeave', 'mouse');
    expect(screen.getByRole('tooltip')).toHaveTextContent('Members explanation');
    expect(members).toHaveAccessibleDescription('Members explanation');
  });

  it('removes document listeners when an open card unmounts', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderWithStore(
      <ProjectKpiCard title="Hours" tooltip="Recorded hours" value={1} />,
    );
    fireEvent.focus(screen.getByRole('button', { name: 'About Hours' }));
    const keyHandler = addSpy.mock.calls.find(
      ([type, handler]) => type === 'keydown' && typeof handler === 'function',
    )?.[1];
    const clickHandler = addSpy.mock.calls.find(
      ([type, handler]) => type === 'click' && typeof handler === 'function',
    )?.[1];
    unmount();
    expect(keyHandler).toBeDefined();
    expect(clickHandler).toBeDefined();
    expect(removeSpy).toHaveBeenCalledWith('keydown', keyHandler);
    expect(removeSpy).toHaveBeenCalledWith('click', clickHandler);
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('renders zero as a valid value with a unit and a described tooltip', () => {
    renderWithStore(<ProjectKpiCard title="Hours" value={0} unit="hrs" tooltip="Recorded hours" />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('hrs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About Hours' })).toHaveAccessibleDescription(
      'Recorded hours',
    );
  });

  it.each([undefined, null, '', '  ', NaN, Infinity])(
    'shows an explanation rather than a value for missing data (%s)',
    value => {
      renderWithStore(
        <ProjectKpiCard title="Hours" value={value} unavailableReason="Not recorded" />,
      );
      expect(screen.getByText('N/A')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'About Hours' })).toHaveAccessibleDescription(
        'Not recorded',
      );
    },
  );

  it('shows a loading skeleton instead of a value, alert, or link', () => {
    renderWithStore(
      <ProjectKpiCard title="Hours" value={12} loading status="warning" detailsTo="/details" />,
    );
    expect(screen.getByRole('article', { name: 'Hours' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading Hours');
    expect(screen.queryByText('12')).not.toBeInTheDocument();
    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each(['warning', 'critical'])('renders the %s status when supplied', status => {
    renderWithStore(
      <ProjectKpiCard title="Stock" value={4} status={status} alertDescription="Low stock" />,
    );
    expect(screen.getByText(/Low stock/)).toHaveClass(cardStyles[status]);
    expect(screen.getByText(/Low stock/)).toHaveTextContent(
      `${status === 'warning' ? 'Warning' : 'Critical'}: Low stock`,
    );
  });

  it('does not present an alert for an unavailable value', () => {
    renderWithStore(<ProjectKpiCard title="Stock" status="critical" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.queryByText('Critical')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About Stock' })).toHaveAccessibleDescription(
      'Data is not available.',
    );
  });

  it('renders supplied percentage changes and a details link', () => {
    renderWithStore(
      <ProjectKpiCard
        title="Hours"
        value={10}
        comparisons={{ wow: 5, mom: -2 }}
        detailsTo="/details"
      />,
    );
    expect(screen.getByText('+5% WoW')).toBeInTheDocument();
    expect(screen.getByText('-2% MoM')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Details for Hours' })).toHaveAttribute(
      'href',
      '/details',
    );
  });

  it.each([7, 30, 90])('renders only the supplied %s-day trend points', days => {
    const points = [{ value: 3 }, { value: 6 }];
    renderWithStore(<ProjectKpiCard title="Hours" value={6} trend={{ days, points }} />);
    expect(
      screen.getByRole('img', { name: `Hours trend over ${days} days: increased from 3 to 6.` }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toHaveAttribute('data-points', JSON.stringify(points));
  });

  it.each([
    [[{ value: 6 }, { value: 3 }], 'decreased from 6 to 3 hrs.'],
    [[{ value: 3 }, { value: 3 }], 'unchanged from 3 to 3 hrs.'],
  ])('describes the start and end values of a trend', (points, description) => {
    renderWithStore(
      <ProjectKpiCard title="Hours" value={3} unit="hrs" trend={{ days: 7, points }} />,
    );
    expect(
      screen.getByRole('img', { name: `Hours trend over 7 days: ${description}` }),
    ).toBeInTheDocument();
  });

  it('allows keyboard navigation to a details link', async () => {
    function CurrentLocation() {
      const location = useLocation();
      return <div>{location.pathname}</div>;
    }

    renderWithStore(
      <>
        <ProjectKpiCard title="Hours" value={10} detailsTo="/details" />
        <CurrentLocation />
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('link', { name: 'View Details for Hours' })).toHaveFocus();
    await userEvent.type(screen.getByRole('link', { name: 'View Details for Hours' }), '{enter}', {
      skipClick: true,
    });
    expect(screen.getByText('/details')).toBeInTheDocument();
  });

  it('does not render a sparkline without sufficient valid data', () => {
    const { rerender } = render(
      <ProjectKpiCard title="Hours" value={1} trend={{ days: 7, points: [] }} />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(
      <ProjectKpiCard
        title="Hours"
        value={1}
        trend={{ days: 7, points: [{ value: NaN }, { value: 1 }] }}
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies the dark-mode class', () => {
    renderWithStore(<ProjectKpiCard title="Hours" value={1} darkMode />);
    expect(screen.getByRole('article')).toHaveClass(cardStyles.card, cardStyles.darkCard);
  });
});

describe('Project summaries', () => {
  it('renders all eight cards without using unreliable legacy values', () => {
    const project = {
      name: 'Alpha',
      members: [{}, {}],
      hoursWorked: 123,
      totalMaterialsCost: 1500,
      totalEquipmentCost: 3000,
      mostMaterialBought: { stockBought: 7, itemType: { name: 'Wood', unit: 'kg' } },
    };
    renderWithStore(<ProjectSummary project={project} />);
    const titles = [
      'Hours',
      'Materials Cost',
      'Equipment Cost',
      'Waste %',
      'Members',
      'Rentals',
      'Most-Bought Material',
      'Stock Health',
    ];
    titles.forEach(title =>
      expect(screen.getByRole('article', { name: title })).toBeInTheDocument(),
    );
    expect(
      within(screen.getByRole('article', { name: 'Members' })).getByText('2'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('N/A')).toHaveLength(7);
    expect(screen.queryByText('1500')).not.toBeInTheDocument();
    expect(screen.queryByText('3000')).not.toBeInTheDocument();
    expect(screen.queryByText('123')).not.toBeInTheDocument();
    expect(screen.queryByText(/Excavator/)).not.toBeInTheDocument();
    expect(screen.queryByText('Wood')).not.toBeInTheDocument();
  });

  it('handles missing members and applies responsive and dark-mode classes', () => {
    renderWithStore(<ProjectSummary project={{ name: 'Alpha' }} />, {
      theme: { darkMode: true },
    });
    expect(screen.getAllByText('N/A')).toHaveLength(8);
    expect(screen.getByRole('region', { name: 'Alpha Summary' })).toHaveClass(
      summaryStyles.darkProjectSummaryContent,
    );
    expect(screen.getByRole('group', { name: 'Project KPI cards' })).toHaveClass(
      summaryStyles.kpiGrid,
    );
    expect(screen.getByRole('article', { name: 'Members' })).toHaveClass(cardStyles.darkCard);
  });

  it('preserves multiple-project selection and separate summaries', () => {
    const projects = [
      { _id: '1', name: 'Alpha', members: [{}] },
      { _id: '2', name: 'Beta', members: [{}, {}] },
      { _id: '3', name: 'Gamma', members: [] },
    ];
    renderWithStore(<ProjectsList />, { bmProjects: projects });
    expect(screen.getByRole('list')).toHaveClass(summaryStyles.summaryList);
    const select = screen.getByRole('listbox', { name: 'Select projects' });
    const options = within(select).getAllByRole('option');
    options[0].selected = true;
    options[1].selected = true;
    fireEvent.change(select);
    expect(screen.getByText('Alpha Summary')).toBeInTheDocument();
    expect(screen.getByText('Beta Summary')).toBeInTheDocument();
    expect(screen.queryByText('Gamma Summary')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article', { name: 'Members' })).toHaveLength(2);
    expect(
      within(
        within(screen.getByRole('region', { name: 'Alpha Summary' })).getByRole('article', {
          name: 'Members',
        }),
      ).getByText('1'),
    ).toBeInTheDocument();
    expect(
      within(
        within(screen.getByRole('region', { name: 'Beta Summary' })).getByRole('article', {
          name: 'Members',
        }),
      ).getByText('2'),
    ).toBeInTheDocument();
    options[0].selected = false;
    options[1].selected = false;
    fireEvent.change(select);
    expect(screen.getByText('Gamma Summary')).toBeInTheDocument();
  });
});
