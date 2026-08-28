import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { vi } from 'vitest';
import {
  distributeLabels,
  getChartLayout,
  ProjectPieChart,
} from '../ProjectPieChart/ProjectPieChart';

vi.mock('recharts', () => ({
  LabelList: () => null,
  Pie: ({ activeIndex = [], children, data, onMouseEnter }) => (
    <div>
      {data.map((item, index) => (
        <button
          type="button"
          aria-label={`Select ${item.name}`}
          aria-pressed={activeIndex.includes(index)}
          key={`${item.name}-${index}`}
          onMouseEnter={event => onMouseEnter?.(item, index, event)}
        />
      ))}
      {children}
    </div>
  ),
  PieChart: ({ children }) => <div>{children}</div>,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  Sector: () => null,
}));

describe('ProjectPieChart responsive layout', () => {
  it.each([320, 390, 576])(
    'keeps usable donut geometry inside a %ipx-wide container',
    width => {
      const layout = getChartLayout(width);

      expect(layout.innerRadius).toBeGreaterThanOrEqual(44);
      expect(layout.outerRadius).toBeGreaterThan(layout.innerRadius);
      expect(layout.outerRadius * 2 + layout.horizontalMargin * 2).toBeLessThanOrEqual(width);
    },
  );

  it('uses an in-flow summary and member list instead of external labels on mobile', () => {
    const userData = [
      {
        name: 'MemberWithAnUnusuallyLongUnbrokenName',
        lastName: 'Example',
        value: 2,
        totalHoursCalculated: 2,
      },
    ];

    render(<ProjectPieChart userData={userData} windowSize={390} darkMode={false} />);

    expect(screen.getByText('Selected values')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Chart value display' })).toBeInTheDocument();
    expect(screen.getByLabelText('Chart member values')).toHaveTextContent(
      'MemberWithAnUnusuallyLongUnbrokenName',
    );
  });

  it('preserves the existing desktop chart geometry', () => {
    const layout = getChartLayout(1000);

    expect(layout.innerRadius).toBe(110);
    expect(layout.outerRadius).toBe(170);
    expect(layout.textOffset).toBe(85);
    expect(layout.horizontalMargin).toBe(0);
  });

  it('keeps the desktop toggle in normal flow beneath the summary', () => {
    const userData = [{ name: 'Member', lastName: 'Example', value: 2, totalHoursCalculated: 2 }];

    render(<ProjectPieChart userData={userData} windowSize={1000} darkMode={false} />);

    const toggle = screen.getByRole('group', { name: 'Chart value display' });
    expect(toggle.className).toContain('centerToggle');
    expect(screen.getByText('Total hrs (2.00)')).toBeInTheDocument();
  });

  it('accumulates hours while multiple slices remain selected in Select mode', () => {
    const userData = [
      { name: 'First', lastName: 'Member', value: 2, totalHoursCalculated: 5 },
      { name: 'Second', lastName: 'Member', value: 3, totalHoursCalculated: 5 },
    ];

    render(<ProjectPieChart userData={userData} windowSize={1000} darkMode={false} />);

    const firstSlice = screen.getByRole('button', { name: 'Select First' });
    const secondSlice = screen.getByRole('button', { name: 'Select Second' });
    fireEvent.mouseEnter(firstSlice);
    fireEvent.mouseEnter(secondSlice, { ctrlKey: true });

    expect(firstSlice).toHaveAttribute('aria-pressed', 'true');
    expect(secondSlice).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Selected values')).toBeInTheDocument();
    expect(screen.getByText('5.00 hrs')).toBeInTheDocument();
  });

  it('keeps the All/Select controls independent across two chart instances', () => {
    const userData = [{ name: 'Member', lastName: 'Example', value: 2, totalHoursCalculated: 2 }];

    render(
      <>
        <ProjectPieChart userData={userData} windowSize={1000} darkMode={false} />
        <ProjectPieChart userData={userData} windowSize={1000} darkMode={false} />
      </>,
    );

    const toggles = screen.getAllByRole('checkbox');
    const toggleLabels = screen.getAllByLabelText('Toggle setting');
    expect(toggles[0]).not.toHaveAttribute('id', toggles[1].id);

    fireEvent.click(toggleLabels[1]);

    expect(toggles[0]).not.toBeChecked();
    expect(toggles[1]).toBeChecked();
  });

  it('separates clustered desktop labels and keeps connector endpoints in bounds', () => {
    const labels = [
      { idx: 0, rawY: 246 },
      { idx: 1, rawY: 247 },
      { idx: 2, rawY: 249 },
      { idx: 3, rawY: 251 },
      { idx: 4, rawY: 253 },
    ];

    distributeLabels(labels, 18, 180, 320);

    const sortedLabels = [...labels].sort((a, b) => a.y - b.y);
    sortedLabels.forEach(label => {
      expect(label.y).toBeGreaterThanOrEqual(180);
      expect(label.y).toBeLessThanOrEqual(320);
    });
    for (let index = 1; index < sortedLabels.length; index += 1) {
      expect(sortedLabels[index].y - sortedLabels[index - 1].y).toBeGreaterThanOrEqual(18);
    }
  });
});
