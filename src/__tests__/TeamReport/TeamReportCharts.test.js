import React from 'react';
import { mount } from 'enzyme';
import TeamReportCharts from 'components/Reports/TeamReport/components/TeamReportCharts';

describe('TeamReportCharts', () => {
  const props = {
    title: 'Team Report',
    pieChartId: 'chart-1',
    teamWeeklyCommittedHours: 100,
    totalTeamWeeklyWorkedHours: 50,
  };

  // Test if the component rendered successfully and resulted in a single root element in the DOM.
  it('renders without crashing', () => {
    const wrapper = mount(<TeamReportCharts {...props} />);
    expect(wrapper).toHaveLength(1);
  });

  // Test if the component render correct title
  it('renders the correct title', () => {
    const wrapper = mount(<TeamReportCharts {...props} />);
    expect(wrapper.find('h4').text()).toEqual(props.title);
  });

  // Test if the components render correct 3 pie chart
  it('renders the correct number of pie chart slices', () => {
    const wrapper = mount(<TeamReportCharts {...props} />);
    expect(wrapper.find('PieChartInfoDetail')).toHaveLength(3);
  });

  // Test if the component render correct pieChartId
  it('renders the correct pie chart id', () => {
    const wrapper = mount(<TeamReportCharts {...props} />);
    expect(wrapper.find('.pie-chart').prop('id')).toEqual(
      `pie-chart-container-${props.pieChartId}`,
    );
  });

  // Test if the component render correct teamWeeklyCommittedHours
  it('renders the correct teamWeeklyCommittedHours', () => {
    const wrapper = mount(<TeamReportCharts {...props} />);
    const teamWeeklyChart = wrapper.find('PieChartInfoDetail').first(); // Get the first chart which is teamWeeklyCommittedHours Chart
    expect(teamWeeklyChart.prop('value')).toEqual(props.teamWeeklyCommittedHours);
  });

  // Test if the component render correct totalTeamWeeklyWorkedHours
  it('renders the correct totalTeamWeeklyWorkedHours', () => {
    const wrapper = mount(<TeamReportCharts {...props} />);
    const teamWeeklyChart = wrapper.find('PieChartInfoDetail').at(1); // Get the second chart which is totalTeamWeeklyWorkedHours Chart
    expect(teamWeeklyChart.prop('value')).toEqual(props.totalTeamWeeklyWorkedHours);
  });

  // Test the style css
  it('renders the correct colors for the pie chart slices', () => {
    const wrapper = mount(<TeamReportCharts {...props} />);
    const colors = ['#B88AD5', '#FAE386', '#E4E4E4'];
    wrapper.find('path').forEach((path, index) => {
      expect(path.prop('fill')).toEqual(colors[index]);
    });
  });
});
