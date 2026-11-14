import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import axios from 'axios';
import { ENDPOINTS } from '../../../../../utils/URL';
import ToolsHorizontalBarChart from '../ToolsHorizontalBarChart';

vi.mock('axios');

// Render the chart data as text so the test can read what each bar would show.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ data, children }) => (
    <div>
      {data.map(row => (
        <span key={row.name} data-testid="row">
          {`${row.name}: inUse=${row.inUse} needsReplacement=${row.needsReplacement} yetToReceive=${row.yetToReceive} available=${row.available}`}
        </span>
      ))}
      {children}
    </div>
  ),
  Bar: ({ name }) => <span data-testid="bar">{name}</span>,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

const projectId = '65419e61105441587e2dec99';

describe('ToolsHorizontalBarChart', () => {
  beforeEach(() => {
    axios.get.mockImplementation(url =>
      Promise.resolve({
        data:
          url === ENDPOINTS.TOOLS_AVAILABILITY_PROJECTS
            ? [{ projectId, projectName: 'Building 1' }]
            : [
                {
                  toolName: 'Circular Saw',
                  inUse: 1,
                  needsReplacement: 0,
                  yetToReceive: 0,
                  available: 1,
                },
              ],
      }),
    );
  });

  it('loads the current tool statuses once per project and shows the Available count', async () => {
    const store = configureStore([])({ theme: { darkMode: false } });
    render(
      <Provider store={store}>
        <ToolsHorizontalBarChart />
      </Provider>,
    );

    // No date range: tool statuses are current, like the Tools List.
    expect(screen.queryByLabelText('Start date')).not.toBeInTheDocument();

    const projectInput = screen.getByLabelText('Project');
    await waitFor(() => expect(projectInput).not.toBeDisabled());
    fireEvent.keyDown(projectInput, { key: 'ArrowDown' });
    fireEvent.click(await screen.findByText('Building 1'));

    expect(await screen.findByTestId('row')).toHaveTextContent(
      'Circular Saw: inUse=1 needsReplacement=0 yetToReceive=0 available=1',
    );
    expect(screen.getAllByTestId('bar').map(bar => bar.textContent)).toEqual([
      'In Use',
      'Needs Replacement',
      'Yet to Receive',
      'Available',
    ]);
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId));
    expect(
      axios.get.mock.calls.filter(([url]) => url.includes('/tools-availability?')),
    ).toHaveLength(0);
  });
});
