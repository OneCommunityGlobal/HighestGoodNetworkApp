import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import RadarChart from '../RadarChart';

// react-chartjs-2 renders to a real <canvas>, which jsdom doesn't implement.
// Capture the props chart.js would receive instead of rendering the chart.
let lastRadarProps;
vi.mock('react-chartjs-2', () => ({
  Radar: props => {
    lastRadarProps = props;
    return null;
  },
}));

const mockStore = configureMockStore([]);

const profileData = {
  skillInfo: {
    general: { leadership_experience: 5, leadership_skills: 6, markdown_graphs: 7 },
    frontend: {},
    backend: {},
  },
};

const renderChart = compact => {
  const store = mockStore({ theme: { darkMode: false } });
  render(
    <Provider store={store}>
      <RadarChart profileData={profileData} compact={compact} />
    </Provider>,
  );
};

describe('RadarChart', () => {
  it('uses abbreviated labels even when compact is false, to avoid overlap at high dimension density', () => {
    renderChart(false);
    expect(lastRadarProps.data.labels).toContain('Leadership Skl');
    expect(lastRadarProps.data.labels).toContain('Markdown/Graphs');
    expect(lastRadarProps.data.labels).not.toContain('Leadership Skills');
  });

  it('centers point labels between grid lines to reduce crowding near the wrap-around seam', () => {
    renderChart(true);
    expect(lastRadarProps.options.scales.r.pointLabels.centerPointLabels).toBe(true);
  });

  it('shows the radial scale numbers regardless of compact, so /hgn/profile/skills matches skills-overview', () => {
    renderChart(true);
    expect(lastRadarProps.options.scales.r.ticks.display).toBe(true);

    renderChart(false);
    expect(lastRadarProps.options.scales.r.ticks.display).toBe(true);
  });
});
