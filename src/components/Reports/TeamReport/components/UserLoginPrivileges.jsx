import React, { useEffect, useState } from 'react';
import { ReportPage } from 'components/Reports/sharedComponents/ReportPage';
import TeamReportLogs from './TeamReportLogs';
import TeamsReportLogs from './TeamsReportLogs';
import TeamReportCharts from './TeamReportCharts';
import TeamsReportCharts from './TeamsReportCharts';
import ReportCharts from './ReportCharts';

function UserLoginPrivileges({ 
  role,
  teamName, 
  teamMembers, 
  totalTeamWeeklyWorkedHours,
  selectedTeams, 
  allTeamsMembers }) {
  // team
  let teamWeeklyCommittedHours = 0;
  let teamTotalTangibleHours = 0;
  let teamTotalBlueSquares = 0;

  teamMembers.map(member => {
    teamWeeklyCommittedHours += member.weeklycommittedHours;
    teamTotalTangibleHours += member.totalTangibleHrs;
    teamTotalBlueSquares += member.infringements.length;
  })

  //selectedTeams
  const [selectedTeamsMembers, setSelectedTeamsMembers] = useState([])

  const [selectedTeamsData, setSelectedTeamsData] = useState([])
  const [selectedTeamsTotalValues, setSelectedTeamsTotalValues] = useState({})

  useEffect(() => {
    const teamsData = selectedTeamsMembers.map((teamMembers, index) => {
      const { totalCommitedHours, totalWorkedHours, totalOfMembers, totalBlueSquares } = teamMembers.reduce((totals, member) => {
        return {
          totalCommitedHours: totals.totalCommitedHours + member.weeklycommittedHours,
          totalWorkedHours: totals.totalWorkedHours + member.totalTangibleHrs,
          totalOfMembers: totals.totalOfMembers + 1,
          totalBlueSquares: totals.totalBlueSquares + member.infringements.length
        };
      }, { totalCommitedHours: 0, totalWorkedHours: 0, totalOfMembers: 0, totalBlueSquares: 0 });
      
      return {
        name: selectedTeams[index]?.selectedTeam.teamName,
        totalCommitedHours,
        totalWorkedHours,
        totalOfMembers,
        totalBlueSquares
      };
    });
  
    setSelectedTeamsData(teamsData);
  }, [selectedTeams, selectedTeamsMembers]);

  useEffect(() => {
    const { 
      selectedTeamsTotalPeople, 
      selectedTeamsTotalBlueSquares, 
      selectedTeamsTotalCommitedHours, 
      selectedTeamsTotalWorkedHours 
    } = selectedTeamsData.reduce((totals, teamData) => {
      return {
        selectedTeamsTotalPeople: totals.selectedTeamsTotalPeople + teamData.totalOfMembers,
        selectedTeamsTotalBlueSquares: totals.selectedTeamsTotalBlueSquares + teamData.totalBlueSquares,
        selectedTeamsTotalCommitedHours: totals.selectedTeamsTotalCommitedHours + teamData.totalCommitedHours,
        selectedTeamsTotalWorkedHours: totals.selectedTeamsTotalWorkedHours + teamData.totalWorkedHours
      };
    }, { selectedTeamsTotalPeople: 0, selectedTeamsTotalBlueSquares: 0, selectedTeamsTotalCommitedHours: 0, selectedTeamsTotalWorkedHours: 0 });
    
    setSelectedTeamsTotalValues({
      selectedTeamsTotalPeople,
      selectedTeamsTotalBlueSquares,
      selectedTeamsTotalCommitedHours,
      selectedTeamsTotalWorkedHours
    });
  }, [selectedTeamsData]);

  useEffect(() => {
    const selectedTeamsMembersArray = selectedTeams.map((team) => allTeamsMembers[team.index]);
    setSelectedTeamsMembers(selectedTeamsMembersArray);
  }, [selectedTeams, allTeamsMembers]);
  
  // Check if the user has admin privileges
  if (role == 'Manager') {
    // Render the component if the user has admin privileges
    return (
      <div className="team-report-main-info">
        <TeamReportLogs 
          title={teamName} 
          teamMembers={teamMembers} 
          teamWeeklyCommittedHours={teamWeeklyCommittedHours} 
          teamTotalTangibleHours={teamTotalTangibleHours} 
          teamTotalBlueSquares={teamTotalBlueSquares}
        />
        {/* Two cards with pie charts with data */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '16px',
        }}
        >
          {/* The pieChartId prop has to be different for each chart,
          otherwise it will render all of them in the first card. */}

          <ReportPage.ReportBlock className="team-chart-container">
            <TeamReportCharts
              title="Breakdown of Weekly Hours So Far This Week" 
              pieChartId="chart1" 
              teamWeeklyCommittedHours={teamWeeklyCommittedHours} 
              teamTotalTangibleHours={teamTotalTangibleHours} 
            />
          </ReportPage.ReportBlock>
        </div>
      </div>
    );
  } if (role == ('Administrator' || 'Owner')) {
    return (
      <div className="team-report-main-info">
        <TeamReportLogs 
          title={teamName} 
          teamMembers={teamMembers} 
          teamWeeklyCommittedHours={teamWeeklyCommittedHours} 
          teamTotalTangibleHours={teamTotalTangibleHours} 
          teamTotalBlueSquares={teamTotalBlueSquares}
        />
        {/* Two cards with pie charts with data */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '16px',
        }}
        >
          <ReportPage.ReportBlock className="team-chart-container">
            <TeamReportCharts
                title="Breakdown of Weekly Hours So Far This Week" 
                pieChartId="chart1" 
                teamWeeklyCommittedHours={teamWeeklyCommittedHours} 
                teamTotalTangibleHours={teamTotalTangibleHours} 
            />
          </ReportPage.ReportBlock>
        </div>
        <TeamsReportLogs 
          title="Selected Teams" 
          selectedTeamsTotalValues={selectedTeamsTotalValues}
        />
        {/* Two cards with pie charts with data */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '16px',
        }}
        >
          <ReportPage.ReportBlock className="team-chart-container">
            <TeamsReportCharts
              title="Commited Hours" 
              pieChartId="chart2" 
              selectedTeamsData={selectedTeamsData}
            />
          </ReportPage.ReportBlock>
          <ReportPage.ReportBlock className="team-chart-container">
            <TeamsReportCharts
              title="Worked Hours - This Week" 
              pieChartId="chart3" 
              selectedTeamsData={selectedTeamsData}
            />
          </ReportPage.ReportBlock>
        </div>
      </div>
    );
  // } if (selectedInput == 'isOwner') {
  //   return (
  //     <div className="team-report-main-info">
  //       {/* Cards with report logged */}
  //       <ReportLogs title="Organization" />
  //       {/* Two cards with pie charts with data */}
  //       <div style={{
  //         display: 'flex', flexDirection: 'row', gap: '16px',
  //       }}
  //       >
  //         <ReportPage.ReportBlock className="team-chart-container">
  //           <ReportCharts title="Breakdown of Weekly Hours So Far This Week" pieChartId="chart1-3" />
  //         </ReportPage.ReportBlock>
  //         <ReportPage.ReportBlock className="team-chart-container">
  //           <ReportCharts title="Hours to Complete Tasks" pieChartId="chart2-3" />
  //         </ReportPage.ReportBlock>
  //       </div>
  //       <TeamReportLogs 
  //         title={teamName} 
  //         teamMembers={teamMembers} 
  //         teamWeeklyCommittedHours={teamWeeklyCommittedHours} 
  //         teamTotalTangibleHours={teamTotalTangibleHours} 
  //         teamTotalBlueSquares={teamTotalBlueSquares}
  //       />
  //       {/* Two cards with pie charts with data */}
  //       <div style={{
  //         display: 'flex', flexDirection: 'row', gap: '16px',
  //       }}
  //       >
  //         <ReportPage.ReportBlock className="team-chart-container">
  //           <ReportCharts title="Breakdown of Weekly Hours So Far This Week" pieChartId="chart3-1" />
  //         </ReportPage.ReportBlock>
  //         <ReportPage.ReportBlock className="team-chart-container">
  //           <ReportCharts title="Hours to Complete Tasks" pieChartId="chart4-1" />
  //         </ReportPage.ReportBlock>
  //       </div>
  //       {/* Teams checked will contact and appear here */}
  //       <ReportLogs title="Teams A, B and C" />
  //       {/* Two cards with pie charts with data */}
  //       <div style={{
  //         display: 'flex', flexDirection: 'row', gap: '16px',
  //       }}
  //       >
  //         <ReportPage.ReportBlock className="team-chart-container">
  //           <ReportCharts title="Breakdown of Weekly Hours So Far This Week" pieChartId="chart5" />
  //         </ReportPage.ReportBlock>
  //         <ReportPage.ReportBlock className="team-chart-container">
  //           <ReportCharts title="Hours to Complete Tasks" pieChartId="chart6" />
  //         </ReportPage.ReportBlock>
  //       </div>
  //     </div>
  //   );
  // }
  // Otherwise, return null to prevent the component from being rendered
  return null;
  }
}

export default UserLoginPrivileges;