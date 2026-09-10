import { Pie } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import sharedStyles from './ReviewsInsight.module.css';
import { useSelector } from 'react-redux';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

function PRQualityGraph({ selectedTeams, qualityData, isDataViewActive, orderedTeamIds }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  if (!selectedTeams || selectedTeams.length === 0) {
    return <div> </div>;
  }

  if (!qualityData || Object.keys(qualityData).length === 0) {
    return <div className={sharedStyles.noData}>No data available for Quality Graph.</div>;
  }

  const isAllTeams = selectedTeams.some(team => team.value === 'All');
  const teamsToDisplay = isAllTeams ? orderedTeamIds : selectedTeams.map(team => team.value);

  const generateChartData = team => {
    const teamQualityData = qualityData[team] || {};

    const counts = [
      teamQualityData.NotApproved || 0,
      teamQualityData.LowQuality || 0,
      teamQualityData.Sufficient || 0,
      teamQualityData.Exceptional || 0,
    ];

    const total = counts.reduce((sum, v) => sum + v, 0);
    const values = isDataViewActive ? counts.map(v => (total ? (v / total) * 100 : 0)) : counts;

    return {
      labels: ['Not Approved', 'Low Quality', 'Sufficient', 'Exceptional'],
      datasets: [
        {
          label: `PR Quality Distribution for ${team}`,
          data: values,
          backgroundColor: ['#DC3545', '#FFC107', '#28A745', '#5940CB'],
          hoverOffset: 4,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    interaction: {
      // Per-slice hover so the tooltip describes the single slice under the
      // cursor, not the whole dataset.
      mode: 'nearest',
      intersect: true,
    },
    plugins: {
      // ProjectStatus.jsx registers a "centerText" plugin globally, so it draws
      // "Total Projects / 0" on top of every chart.js chart app-wide. Opt this
      // chart out (chart.js skips a plugin whose options key is literally false).
      centerText: false,
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          color: darkMode ? '#fff' : '#333',
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          // Heading: the chart's own title ("PR Quality Distribution for <team>").
          title: items => items?.[0]?.dataset?.label ?? '',
          // Colour-key line: the hovered slice's category and its value
          // ("Sufficient: 1", or "Sufficient: 33.3%" in the percentage view).
          label: ctx => {
            const value = isDataViewActive ? `${Number(ctx.raw).toFixed(1)}%` : ctx.raw;
            return `${ctx.label}: ${value}`;
          },
        },
      },
      datalabels: {
        color: darkMode ? '#fff' : '#000',
        font: { weight: 'bold', size: 11 },
        formatter: value => {
          if (!value) return '';
          return isDataViewActive ? `${value}%` : value;
        },
      },
    },
  };

  return (
    <div className={sharedStyles.riQualityGraph}>
      <h2 className={`${sharedStyles.heading} ${darkMode ? sharedStyles.darkModeForeground : ''}`}>
        PR Quality Distribution
      </h2>

      <div className={`${sharedStyles.riCharts}`}>
        {teamsToDisplay.map(team => (
          <div
            key={team}
            className={`${sharedStyles.riChart} ${darkMode ? sharedStyles.riChartDarkMode : ''}`}
          >
            <h3
              className={`${sharedStyles.heading} ${
                darkMode ? sharedStyles.darkModeForeground : ''
              }`}
            >
              {team}
            </h3>
            <Pie data={generateChartData(team)} options={options} />
          </div>
        ))}
      </div>
    </div>
  );
}

PRQualityGraph.propTypes = {
  selectedTeams: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ),
  qualityData: PropTypes.objectOf(
    PropTypes.shape({
      NotApproved: PropTypes.number,
      LowQuality: PropTypes.number,
      Sufficient: PropTypes.number,
      Exceptional: PropTypes.number,
    }),
  ),
  isDataViewActive: PropTypes.bool,
  orderedTeamIds: PropTypes.arrayOf(PropTypes.string),
};

PRQualityGraph.defaultProps = {
  selectedTeams: [],
  qualityData: {},
  isDataViewActive: false,
  orderedTeamIds: [],
};

export default PRQualityGraph;
