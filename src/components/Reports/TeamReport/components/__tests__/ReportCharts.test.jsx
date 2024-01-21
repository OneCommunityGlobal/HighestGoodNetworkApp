import { render, cleanup } from '@testing-library/react';
import ReportCharts from '../ReportCharts';

describe('ReportCharts Component', () => {
  afterEach(cleanup); // make sure testing environment is cleaned up after each test

  it('renders the component with the given title', () => {
    const title = 'Team Report';
    const pieChartId = 'team-pie-chart';

    const { getByText } = render(<ReportCharts title={title} pieChartId={pieChartId} />);

    const titleElement = getByText(title);
    expect(titleElement).toBeInTheDocument();
  });

  it('renders PieChartInfoDetail components with correct data', () => {
    const title = 'Team Report';
    const pieChartId = 'team-pie-chart';

    const { getByText, getAllByText } = render(
      <ReportCharts title={title} pieChartId={pieChartId} />,
    );

    const taskAElement = getByText('Task A');
    const taskBElement = getByText('Task B');
    const taskCElement = getByText('Task C');
    const taskDElement = getByText('Task D');
    const totalElement = getByText('Total Available for week');

    expect(taskAElement).toBeInTheDocument();
    expect(taskBElement).toBeInTheDocument();
    expect(taskCElement).toBeInTheDocument();
    expect(taskDElement).toBeInTheDocument();
    expect(totalElement).toBeInTheDocument();

    // Additional assertions to check if values and colors are rendered
    const values = getAllByText(/\d+\.\d+/);
    expect(values).toHaveLength(5);

    const colorSquares = document.querySelectorAll('.pie-chart-legend-color-square');
    expect(colorSquares).toHaveLength(5);
  });

//   it('renders the correct number of PieChartInfoDetail components', () => {
//     const title = 'Team Report';
//     const pieChartId = 'team-pie-chart';

//     const { container } = render(<ReportCharts title={title} pieChartId={pieChartId} />);

//     const infoDetailElements = container.querySelectorAll('.pie-chart-info-detail');
//     expect(infoDetailElements.length).toBe(5); // There should be 5 PieChartInfoDetail components
//   });

  it('renders the PieChartInfoDetail components with the correct color squares', () => {
    const title = 'Team Report';
    const pieChartId = 'team-pie-chart';

    const { container } = render(<ReportCharts title={title} pieChartId={pieChartId} />);

    const colorSquares = container.querySelectorAll('.pie-chart-legend-color-square');
    expect(colorSquares.length).toBe(5); // There should be 5 color squares
  });

  it('renders the PieChartInfoDetail components with the correct text', () => {
    const title = 'Team Report';
    const pieChartId = 'team-pie-chart';

    const { getByText } = render(<ReportCharts title={title} pieChartId={pieChartId} />);

    const taskAElement = getByText('Task A');
    const taskBElement = getByText('Task B');
    const taskCElement = getByText('Task C');
    const taskDElement = getByText('Task D');
    const totalElement = getByText('Total Available for week');

    expect(taskAElement).toBeInTheDocument();
    expect(taskBElement).toBeInTheDocument();
    expect(taskCElement).toBeInTheDocument();
    expect(taskDElement).toBeInTheDocument();
    expect(totalElement).toBeInTheDocument();
  });
});