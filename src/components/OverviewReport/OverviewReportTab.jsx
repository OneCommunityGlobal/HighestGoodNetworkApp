import { Button, Container, Row, Col } from 'reactstrap';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import './OverviewReportTab.css';
import { useState } from 'react';
import VolunteerStats from './VolunteerStats';
import VolunteeringHoursStats from './VolunteeringHoursStats';
import VolunteerRoleStats from './VolunteerRoleStats';
import TasksProjectsStats from './TasksProjectsStats';
import BlueSquareStats from './BlueSquareStats';

export default function OverviewReportTab(props) {
  // eslint-disable-next-line no-unused-vars
  const { activeTab, userRole } = props;
  const [currentStats, setCurrentStats] = useState('showVolunteerStats');

  return (
    <Container fluid className="py-3 mb-5">
      <Row>
        <Col className="col" xs="12" sm="6" md="4" lg="2">
          <Button
            className="button"
            color="info"
            style={currentStats === 'showVolunteerStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showVolunteerStats')}
          >
            Volunteer Stats
          </Button>
          <div>
            <EditableInfoModal
              areaName="showVolunteerStats"
              areaTitle="Show Volunteer Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </Col>
        <Col className="col" xs="12" sm="6" md="4" lg="2">
          <Button
            className="button"
            color="info"
            style={currentStats === 'showVolunteerHoursStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showVolunteerHoursStats')}
          >
            Volunteer Hours Stats
          </Button>
          <div>
            <EditableInfoModal
              areaName="showVolunteerHoursStats"
              areaTitle="Show Volunteer Hours Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </Col>
        <Col className="col" xs="12" sm="6" md="4" lg="2">
          <Button
            className="button"
            color="info"
            style={currentStats === 'showVolunteerRoleStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showVolunteerRoleStats')}
          >
            Volunteer Role Stats
          </Button>
          <div>
            <EditableInfoModal
              areaName="showVolunteerRoleStats"
              areaTitle="Show Volunteer Role Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </Col>
        <Col className="col" xs="12" sm="6" md="4" lg="2">
          <Button
            className="button"
            color="info"
            style={currentStats === 'showTasksProjectsStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showTasksProjectsStats')}
          >
            Tasks & Projects Stats
          </Button>
          <div>
            <EditableInfoModal
              areaName="showTasksProjectsStats"
              areaTitle="Show Tasks&Projects Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </Col>
        <Col className="col" xs="12" sm="6" md="4" lg="2">
          <Button
            className="button"
            color="info"
            style={currentStats === 'showBlueSquareStats' ? { backgroundColor: '#004A56' } : {}}
            onClick={() => setCurrentStats('showBlueSquareStats')}
          >
            Blue Square Stats
          </Button>
          <div>
            <EditableInfoModal
              areaName="showBlueSquareStats"
              areaTitle="Show Blue Square Stats"
              role={userRole}
              fontSize={15}
              isPermissionPage
            />
          </div>
        </Col>
      </Row>
      {currentStats === 'showVolunteerStats' && <VolunteerStats />}
      {currentStats === 'showVolunteerHoursStats' && <VolunteeringHoursStats />}
      {currentStats === 'showVolunteerRoleStats' && <VolunteerRoleStats />}
      {currentStats === 'showTasksProjectsStats' && <TasksProjectsStats />}
      {currentStats === 'showBlueSquareStats' && <BlueSquareStats />}
    </Container>
  );
}
