// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import { ReportPage } from 'components/Reports/sharedComponents/ReportPage';
import TeamReportLogs from './TeamReportLogs';
import TeamsReportLogs from './TeamsReportLogs';
import TeamReportCharts from './TeamReportCharts';
import TeamsReportCharts from './TeamsReportCharts';
import './ReportCharts.css';

function UserLoginPrivileges({
  // eslint-disable-next-line no-unused-vars
  role,
  teamName,
  teamMembers,
  totalTeamWeeklyWorkedHours,
  selectedTeams,
  selectedTeamsWeeklyEffort,
  allTeamsMembers,
}) {
  // team
  let teamWeeklyCommittedHours = 0;
  let teamTotalBlueSquares = 0;

  teamMembers.forEach(member => {
    teamWeeklyCommittedHours += member.weeklycommittedHours;
    teamTotalBlueSquares += member.infringements.length;
  });

  // selectedTeams
  const [selectedTeamsMembers, setSelectedTeamsMembers] = useState([]);

  const [selectedTeamsData, setSelectedTeamsData] = useState([]);
  const [selectedTeamsTotalValues, setSelectedTeamsTotalValues] = useState({});

  useEffect(() => {
    const teamsData = selectedTeamsMembers.map((currentTeamMembers, index) => {
      const { totalCommitedHours, totalOfMembers, totalBlueSquares } = currentTeamMembers.reduce(
        (totals, member) => {
          return {
            totalCommitedHours: totals.totalCommitedHours + member.weeklycommittedHours,
            totalOfMembers: totals.totalOfMembers + 1,
            totalBlueSquares: totals.totalBlueSquares + member.infringements.length,
          };
        },
        { totalCommitedHours: 0, totalWorkedHours: 0, totalOfMembers: 0, totalBlueSquares: 0 },
      );

      return {
        name: selectedTeams[index]?.selectedTeam.teamName,
        totalCommitedHours,
        totalOfMembers,
        totalBlueSquares,
      };
    });

    setSelectedTeamsData(teamsData);
  }, [selectedTeams, selectedTeamsMembers]);

  useEffect(() => {
    const {
      selectedTeamsTotalPeople,
      selectedTeamsTotalBlueSquares,
      selectedTeamsTotalCommitedHours,
    } = selectedTeamsData.reduce(
      (totals, teamData) => {
        return {
          selectedTeamsTotalPeople: totals.selectedTeamsTotalPeople + teamData.totalOfMembers,
          selectedTeamsTotalBlueSquares:
            totals.selectedTeamsTotalBlueSquares + teamData.totalBlueSquares,
          selectedTeamsTotalCommitedHours:
            totals.selectedTeamsTotalCommitedHours + teamData.totalCommitedHours,
        };
      },
      {
        selectedTeamsTotalPeople: 0,
        selectedTeamsTotalBlueSquares: 0,
        selectedTeamsTotalCommitedHours: 0,
      },
    );

    setSelectedTeamsTotalValues({
      selectedTeamsTotalPeople,
      selectedTeamsTotalBlueSquares,
      selectedTeamsTotalCommitedHours,
    });
  }, [selectedTeamsData]);

  useEffect(() => {
    const selectedTeamsMembersArray = selectedTeams.map(team => allTeamsMembers[team.index]);
    setSelectedTeamsMembers(selectedTeamsMembersArray);
  }, [selectedTeams, allTeamsMembers]);

  // Check if the user has admin privileges
  return (
    <div className="team-report-main-info">
      <TeamReportLogs
        title={teamName}
        teamMembers={teamMembers}
        teamWeeklyCommittedHours={teamWeeklyCommittedHours}
        totalTeamWeeklyWorkedHours={totalTeamWeeklyWorkedHours}
        teamTotalBlueSquares={teamTotalBlueSquares}
      />
      {/* Two cards with pie charts with data */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
        }}
      >
        <ReportPage.ReportBlock className="team-chart-container">
          <TeamReportCharts
            title="Breakdown of Weekly Hours So Far This Week"
            pieChartId="chart1"
            teamWeeklyCommittedHours={teamWeeklyCommittedHours}
            totalTeamWeeklyWorkedHours={totalTeamWeeklyWorkedHours}
          />
        </ReportPage.ReportBlock>
      </div>
      <TeamsReportLogs
        title="Selected Teams"
        selectedTeamsTotalValues={selectedTeamsTotalValues}
        selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
      />
      {/* Two cards with pie charts with data */}
      <div
        className="mobile-chart"
        style={{
          display: 'flex',
          gap: '16px',
        }}
      >
        <ReportPage.ReportBlock className="team-chart-container">
          <TeamsReportCharts
            title="Weekly Commited Hours"
            pieChartId="chart2"
            selectedTeamsData={selectedTeamsData}
          />
        </ReportPage.ReportBlock>
        <ReportPage.ReportBlock className="team-chart-container">
          <TeamsReportCharts
            title="Hours Worked In Current Week"
            pieChartId="chart3"
            selectedTeamsData={selectedTeamsData}
            selectedTeamsWeeklyEffort={selectedTeamsWeeklyEffort}
          />
        </ReportPage.ReportBlock>
      </div>
    </div>
  );
}

export default UserLoginPrivileges;
