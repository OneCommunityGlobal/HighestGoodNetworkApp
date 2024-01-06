import React from 'react';
import { shallow } from 'enzyme'; 
import TeamChartsGroup from '../TeamChartsGroup';

describe('Test Suite for TeamChartsGroup Component', () => {
  it('Test case 1 : Renders two ReportCharts components', () => {
    const wrapper = shallow(<TeamChartsGroup />);
    const reportCharts = wrapper.find('ReportCharts');
    expect(reportCharts).toHaveLength(2);
  });

  it('Test case 2 : Renders divs with appropriate classNames', () => {
    const wrapper = shallow(<TeamChartsGroup />);
    const divs = wrapper.find('.team-chart-wrapper').find('.team-chart-container');
    expect(divs).toHaveLength(2);
  });

  it('Test case 3 : Passes correct props to ReportCharts components', () => {
    const wrapper = shallow(<TeamChartsGroup />);
    const reportCharts = wrapper.find('ReportCharts');

    expect(reportCharts.at(0).props()).toEqual({
      title: 'Breakdown of Weekly Hours So Far This Week',
      pieChartId: 'chart1'
    });

    expect(reportCharts.at(1).props()).toEqual({
      title: 'Breakdown of Weekly Hours So Far This Week',
      pieChartId: 'chart2'
    });
  });
  it('Test case 4 : Renders two ReportCharts components', () => {
    const wrapper = shallow(<TeamChartsGroup />);
    const reportCharts = wrapper.find('ReportCharts');
  
    expect(reportCharts).toHaveLength(2);
  });
  
  });

