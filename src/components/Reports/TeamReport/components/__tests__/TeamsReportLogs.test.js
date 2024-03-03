import React from 'react';
import { shallow } from 'enzyme';
import TeamsReportLogs from '../TeamsReportLogs';

describe('TeamsReportLogs Component', () => {
  const selectedTeamsTotalValues = {
    selectedTeamsTotalPeople: 10,
    selectedTeamsTotalBlueSquares: 25,
    selectedTeamsTotalCommitedHours: 200,
  };

  const selectedTeamsWeeklyEffort = [30, 40, 20, 35]; // Example values for selectedTeamsWeeklyEffort

  // it('renders without crashing', () => {
  //   shallow(
  //     <TeamsReportLogs
  //       title="Teams Report"
  //       selectedTeamsTotalValues={selectedTeamsTotalValues}
  //       selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
  //     />,
  //   );
  // });

  it('displays the correct title', () => {
    const title = 'Teams Report';
    const wrapper = shallow(
      <TeamsReportLogs
        title={title}
        selectedTeamsTotalValues={selectedTeamsTotalValues}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const renderedTitle = wrapper.find('.teams-report-time-title').text();
    expect(renderedTitle).toEqual(title);
  });

  it('displays the correct number of members', () => {
    const wrapper = shallow(
      <TeamsReportLogs
        title="Teams Report"
        selectedTeamsTotalValues={selectedTeamsTotalValues}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const numberOfMembers = wrapper.findWhere(
      node =>
        node.hasClass('team-report-time-log-block') && node.contains(<p>Number of Members</p>),
    );
    expect(numberOfMembers.find('h3').text()).toEqual(
      String(selectedTeamsTotalValues.selectedTeamsTotalPeople),
    );
  });

  it('displays the correct total team blue squares', () => {
    const wrapper = shallow(
      <TeamsReportLogs
        title="Teams Report"
        selectedTeamsTotalValues={selectedTeamsTotalValues}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const totalBlueSquaresBlock = wrapper.findWhere(
      node =>
        node.hasClass('team-report-time-log-block') &&
        node.contains(<p>Total Team Blue Squares</p>),
    );
    expect(totalBlueSquaresBlock.find('h3').text()).toEqual(
      String(selectedTeamsTotalValues.selectedTeamsTotalBlueSquares),
    );
  });

  it('displays the correct total Weekly Committed Hours', () => {
    const wrapper = shallow(
      <TeamsReportLogs
        title="Teams Report"
        selectedTeamsTotalValues={selectedTeamsTotalValues}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const totalWeeklyCommitedHour = wrapper.findWhere(
      node =>
        node.hasClass('team-report-time-log-block') && node.contains(<p>Weekly Committed Hours</p>),
    );
    expect(totalWeeklyCommitedHour.find('h3').text()).toEqual(
      String(selectedTeamsTotalValues.selectedTeamsTotalCommitedHours),
    );
  });

  it('displays the correct total Teams Work Hours', () => {
    const wrapper = shallow(
      <TeamsReportLogs
        title="Teams Report"
        selectedTeamsTotalValues={selectedTeamsTotalValues}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />,
    );

    const totalWeeklyWorkedHour = wrapper.findWhere(
      node =>
        node.hasClass('team-report-time-log-block') &&
        node.contains(<p>Total Worked Hours This Week</p>),
    );
    expect(totalWeeklyWorkedHour.find('h3').text()).toEqual(
      String(selectedTeamsWeeklyEffort.reduce((accumulator, current) => accumulator + current, 0)), // Calculate the weekly hour of team follow the rule in TeamsReportLogs component
    );
  });

  it('component still display empty blocks when no team data is provided', () => {
    const wrapper = shallow(
      <TeamsReportLogs
        title="Teams Report"
        selectedTeamsTotalValues={{}}
        selectedTeamsWeeklyEffort={[]}
      />,
    );

    const reportBlocks = wrapper.find('.team-report-time-log-block');
    expect(reportBlocks).toHaveLength(4);
  });
});
