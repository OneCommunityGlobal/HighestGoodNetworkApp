import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { vi } from 'vitest';
import TwoWayToggleSwitch from '../../../common/TwoWayToggleSwitch/TwoWayToggleSwitch';
import twoWayStyles from '../../../common/TwoWayToggleSwitch/TwoWayToggleSwitch.module.css';
import { PieChartByProject } from '../PiechartByProject/PieChartByProject';
import pieChartStyles from '../PiechartByProject/PieChartByProject.module.css';
import TriMembersStateToggleSwitch from '../TriMembersStateToggleSwitch/TriMembersStateToggleSwitch';
import triStateStyles from '../TriMembersStateToggleSwitch/TriMembersStateToggleSwitch.module.css';

vi.mock('../ProjectPieChart/ProjectPieChart', () => ({
  ProjectPieChart: () => <div data-testid="project-pie-chart" />,
}));

describe('Project Report pie chart controls', () => {
  it('wires the TwoWayToggleSwitch CSS Module classes', () => {
    const handleToggle = vi.fn();
    render(
      <TwoWayToggleSwitch id="chart-values" isOn={false} handleToggle={handleToggle} />,
    );

    expect(screen.getByRole('group', { name: 'Chart value display' })).toHaveClass(
      twoWayStyles['two-way-toggle-switch'],
    );
    expect(screen.getByRole('checkbox')).toHaveClass(twoWayStyles['toggle-switch-checkbox']);
    expect(screen.getByLabelText('Toggle setting')).toHaveClass(
      twoWayStyles['toggle-switch-label'],
    );

    fireEvent.click(screen.getByLabelText('Toggle setting'));
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it('wires the TriMembersStateToggleSwitch CSS Module classes and states', () => {
    const handleChange = vi.fn();
    render(<TriMembersStateToggleSwitch onChange={handleChange} />);

    const filter = screen.getByRole('group', { name: 'Member status filter' });
    expect(filter).toHaveClass(
      triStateStyles['toggle-switch'],
      triStateStyles['bg-darkgray'],
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show requested' }));

    expect(filter).toHaveClass(triStateStyles['bg-green']);
    expect(handleChange).toHaveBeenLastCalledWith({ showInactive: false, showActive: true });
  });

  it('uses scoped light-mode colors and still mounts the chart from the existing checkbox', () => {
    const members = [
      {
        personId: { firstName: 'Ada', lastName: 'Lovelace', isActive: true },
        totalSeconds: 3600,
      },
    ];

    render(
      <PieChartByProject
        mergedProjectUsersArray={members}
        projectName="Test Project"
        darkMode={false}
      />,
    );

    expect(screen.queryByTestId('project-pie-chart')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));

    expect(screen.getByTestId('project-pie-chart')).toBeInTheDocument();
    expect(screen.getByText('Inactive Members')).toHaveClass(pieChartStyles.inactiveLabel);
    expect(screen.getByText('Active Members')).toHaveClass(pieChartStyles.activeLabel);
    expect(screen.getByText(/Total Active Members:/)).toHaveClass(pieChartStyles.statText);
  });
});
