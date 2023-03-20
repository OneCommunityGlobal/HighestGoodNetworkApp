import React from 'react';
import { ReportPage } from 'components/Reports/sharedComponents/ReportPage';
import TeamReportLogs from './TeamReportLogs';
import ReportLogs from './ReportLogs';
import TeamReportCharts from './TeamReportCharts';
import ReportCharts from './ReportCharts';

function UserLoginPrivileges({ selectedInput, teamName, teamMembers }) {
  let teamWeeklyCommittedHours = 0;
  let teamTotalTangibleHours = 0;
  let teamTotalBlueSquares = 0;

  teamMembers.map(member => {
    teamWeeklyCommittedHours += member.weeklycommittedHours;
    teamTotalTangibleHours += member.totalTangibleHrs;
    teamTotalBlueSquares += member.infringements.length;
  })
  
  // Check if the user has admin privileges
  if (selectedInput == 'isManager') {
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
              title="Breakdown of Weekly Hours So Far this Week" 
              pieChartId="chart1" 
              teamWeeklyCommittedHours={teamWeeklyCommittedHours} 
              teamTotalTangibleHours={teamTotalTangibleHours} 
            />
          </ReportPage.ReportBlock>
        </div>
      </div>
    );
  } if (selectedInput == 'isAdmin') {
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
            <ReportCharts title="Breakdown of Weekly Hours So Far this Week" pieChartId="chart1-2" />
          </ReportPage.ReportBlock>
          <ReportPage.ReportBlock className="team-chart-container">
            <ReportCharts title="Hours to Complete Tasks" pieChartId="chart2-2" />
          </ReportPage.ReportBlock>
        </div>
        <ReportLogs title="Teams A, B and C" />
        {/* Two cards with pie charts with data */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '16px',
        }}
        >
          <ReportPage.ReportBlock className="team-chart-container">
            <ReportCharts title="Breakdown of Weekly Hours So Far this Week" pieChartId="chart3" />
          </ReportPage.ReportBlock>
          <ReportPage.ReportBlock className="team-chart-container">
            <ReportCharts title="Hours to Complete Tasks" pieChartId="chart4" />
          </ReportPage.ReportBlock>
        </div>
      </div>
    );
  } if (selectedInput == 'isOwner') {
    return (
      <div className="team-report-main-info">
        {/* Cards with report logged */}
        <ReportLogs title="Organization" />
        {/* Two cards with pie charts with data */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '16px',
        }}
        >
          <ReportPage.ReportBlock className="team-chart-container">
            <ReportCharts title="Breakdown of Weekly Hours So Far this Week" pieChartId="chart1-3" />
          </ReportPage.ReportBlock>
          <ReportPage.ReportBlock className="team-chart-container">
            <ReportCharts title="Hours to Complete Tasks" pieChartId="chart2-3" />
          </ReportPage.ReportBlock>
        </div>
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
            <ReportCharts title="Breakdown of Weekly Hours So Far this Week" pieChartId="chart3-1" />
          </ReportPage.ReportBlock>
          <ReportPage.ReportBlock className="team-chart-container">
            <ReportCharts title="Hours to Complete Tasks" pieChartId="chart4-1" />
          </ReportPage.ReportBlock>
        </div>
        {/* Teams checked will contact and appear here */}
        <ReportLogs title="Teams A, B and C" />
        {/* Two cards with pie charts with data */}
        <div style={{
          display: 'flex', flexDirection: 'row', gap: '16px',
        }}
        >
          <ReportPage.ReportBlock className="team-chart-container">
            <ReportCharts title="Breakdown of Weekly Hours So Far this Week" pieChartId="chart5" />
          </ReportPage.ReportBlock>
          <ReportPage.ReportBlock className="team-chart-container">
            <ReportCharts title="Hours to Complete Tasks" pieChartId="chart6" />
          </ReportPage.ReportBlock>
        </div>
      </div>
    );
  }
  // Otherwise, return null to prevent the component from being rendered
  return null;
}

export default UserLoginPrivileges;