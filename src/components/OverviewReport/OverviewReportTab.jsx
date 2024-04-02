import { Button, Container } from 'reactstrap';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import './OverviewReportTab.css';
import { useState } from 'react';
import VolunteerStats from './VolunteerStats';
import VolunteeringHoursStats from './VolunteeringHoursStats';
import VolunteerRoleStats from './VolunteerRoleStats';
import TasksProjectsStats from './TasksProjectsStats';
import BlueSquareStats from './BlueSquareStats';

export default function OverviewReportTab(props) {
  const { activeTab, userRole } = props;
  const [currentStats, setCurrentStats] = useState('showVolunteerStats');
  return (
    <Container fluid className="py-3 mb-5">
      <div className="overview-report-container">
        <div className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={currentStats === 'showVolunteerStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showVolunteerStats')}
          >
            Show Volunteer Stats
          </Button>
          <div style={{ display: 'inline-block', marginLeft: 10 }}>
            <EditableInfoModal
              areaName="showVolunteerStats"
              areaTitle="Show Volunteer Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </div>
        <div className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={currentStats === 'showVolunteerHoursStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showVolunteerHoursStats')}
          >
            Show Volunteer Hours Stats
          </Button>
          <div style={{ display: 'inline-block', marginLeft: 10 }}>
            <EditableInfoModal
              areaName="showVolunteerHoursStats"
              areaTitle="Show Volunteer Hours Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </div>
        <div className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={currentStats === 'showVolunteerRoleStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showVolunteerRoleStats')}
          >
            Show Volunteer Role Stats
          </Button>
          <div style={{ display: 'inline-block', marginLeft: 10 }}>
            <EditableInfoModal
              areaName="showVolunteerRoleStats"
              areaTitle="Show Volunteer Role Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </div>
        <div className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={currentStats === 'showTasksProjectsStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showTasksProjectsStats')}
          >
            Show Tasks&Projects Stats
          </Button>
          <div style={{ display: 'inline-block', marginLeft: 10 }}>
            <EditableInfoModal
              areaName="showTasksProjectsStats"
              areaTitle="Show Tasks&Projects Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </div>
        <div className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={currentStats === 'showBlueSquareStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showBlueSquareStats')}
          >
            Show Blue Square Stats
          </Button>
          <div style={{ display: 'inline-block', marginLeft: 10 }}>
            <EditableInfoModal
              areaName="showBlueSquareStats"
              areaTitle="Show Blue Square Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </div>
      </div>
      <p>Active Tab: {activeTab}</p>
      {currentStats === 'showVolunteerStats' && <VolunteerStats />}
      {currentStats === 'showVolunteerHoursStats' && <VolunteeringHoursStats />}
      {currentStats === 'showVolunteerRoleStats' && <VolunteerRoleStats />}
      {currentStats === 'showTasksProjectsStats' && <TasksProjectsStats />}
      {currentStats === 'showBlueSquareStats' && <BlueSquareStats />}
    </Container>
  );
}
