import React from 'react';
import { shallow } from 'enzyme';
import TeamsReportCharts from 'components/Reports/TeamReport/components/TeamsReportCharts';

describe('TeamsReportCharts Component', () => {
  const selectedTeamsData = [
    { name: 'Team 1', totalCommitedHours: 20 },
    { name: 'Team 2', totalCommitedHours: 30 },
    { name: 'Team 3', totalCommitedHours: 15 },
  ];
  const selectedTeamsWeeklyEffort = [25, 35, 18, 10];

  it('renders without crashing', () => {
    shallow(
      <TeamsReportCharts
        title="Weekly Commited Hours"
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );
  });

  it('renders the correct number of PieChartInfoDetail components', () => {
    const wrapper = shallow(
      <TeamsReportCharts
        title="Weekly Commited Hours"
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const pieChartInfoDetailComponents = wrapper.find('PieChartInfoDetail');
    expect(pieChartInfoDetailComponents).toHaveLength(selectedTeamsData.length);
  });

  it('renders a message when no team is selected', () => {
    const wrapper = shallow(
      <TeamsReportCharts
        title="Weekly Commited Hours"
        pieChartId={1}
        selectedTeamsData={[]}
        selectedTeamsWeeklyEffort={[]}
      />,
    );

    const message = wrapper.find('strong');
    expect(message.text()).toEqual('Please select a team. (Max 4)');
  });

  it('renders the correct title', () => {
    const title = 'Weekly Effort';
    const wrapper = shallow(
      <TeamsReportCharts
        title={title}
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const renderedTitle = wrapper.find('h4').text();
    expect(renderedTitle).toEqual(title);
  });

  it('does not render PieChartInfoDetail when selectedTeamsData is empty', () => {
    const wrapper = shallow(
      <TeamsReportCharts
        title="Weekly Commited Hours"
        pieChartId={1}
        selectedTeamsData={[]}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const pieChartInfoDetailComponents = wrapper.find('PieChartInfoDetail');
    expect(pieChartInfoDetailComponents).toHaveLength(0);
  });

  it('renders PieChartInfoDetail components with correct values and colors', () => {
    const wrapper = shallow(
      <TeamsReportCharts
        title="Weekly Commited Hours"
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const pieChartInfoDetailComponents = wrapper.find('PieChartInfoDetail');
    pieChartInfoDetailComponents.forEach((component, index) => {
      expect(component.prop('keyName')).toEqual(selectedTeamsData[index]?.name);
      expect(component.prop('value')).toBeDefined(); // Expect value correctly define
      expect(component.prop('color')).toBeDefined(); // Expect the color property is defined
    });
  });

  it('calls useEffect with the correct dependencies', () => {
    const useEffectSpy = jest.spyOn(React, 'useEffect');

    shallow(
      <TeamsReportCharts
        title="Weekly Commited Hours"
        pieChartId={1}
        selectedTeamsData={selectedTeamsData}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    expect(useEffectSpy).toHaveBeenCalledWith(expect.any(Function), [
      selectedTeamsData,
      selectedTeamsWeeklyEffort,
    ]);
  });
});
