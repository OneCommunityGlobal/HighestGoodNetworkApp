import React from 'react';
import { mount } from 'enzyme';
import TeamReportLogs from 'components/Reports/TeamReport/components/TeamReportLogs';

describe('TeamReportLogs', () => {
  const props = {
    title: 'Team Report',
    teamMembers: ['Alice', 'Bob', 'Charlie'],
    teamTotalBlueSquares: 3,
    teamWeeklyCommittedHours: 3,
    totalTeamWeeklyWorkedHours: 3,
  };

  it('renders without crashing', () => {
    const wrapper = mount(<TeamReportLogs {...props} />);
    expect(wrapper).toHaveLength(1);
  });

  it('renders the correct title', () => {
    const wrapper = mount(<TeamReportLogs {...props} />);
    expect(wrapper.find('h2').text()).toEqual(props.title);
  });

  it('renders the correct number of report blocks', () => {
    const wrapper = mount(<TeamReportLogs {...props} />);
    expect(wrapper.find('.team-report-time-log-block')).toHaveLength(8);
  });

  it('renders the correct number of team members', () => {
    const wrapper = mount(<TeamReportLogs {...props} />);
    expect(
      wrapper
        .find('.team-report-time-log-block')
        .at(0)
        .find('h3')
        .text(),
    ).toEqual(props.teamMembers.length.toString());
  });

  it('renders the correct number of total team blue squares', () => {
    const wrapper = mount(<TeamReportLogs {...props} />);
    expect(
      wrapper
        .find('.team-report-time-log-block')
        .at(1)
        .find('h3')
        .text(),
    ).toEqual(props.teamTotalBlueSquares.toString());
  });

  it('renders the correct number of weekly committed hours', () => {
    const wrapper = mount(<TeamReportLogs {...props} />);
    expect(
      wrapper
        .find('.team-report-time-log-block')
        .at(2)
        .find('h3')
        .text(),
    ).toEqual(props.teamWeeklyCommittedHours.toString());
  });

  it('renders the correct number of total worked hours this week', () => {
    const wrapper = mount(<TeamReportLogs {...props} />);
    expect(
      wrapper
        .find('.team-report-time-log-block')
        .at(3)
        .find('h3')
        .text(),
    ).toEqual(props.totalTeamWeeklyWorkedHours.toString());
  });
});
