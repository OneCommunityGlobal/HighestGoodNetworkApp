import { Button, Col, Container, Row } from 'reactstrap';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import './OverviewReportTab.css';

export default function OverviewReportTab(props) {
  // eslint-disable-next-line no-unused-vars
  const { activeTab, userRole } = props;

  return (
    <Container fluid className="py-3 mb-5">
      <Row style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Col xs="12" sm="4" md="2" className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={{
              minWidth: '120px',
              maxWidth: '150px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
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
        <Col xs="12" sm="4" md="2" className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={{
              minWidth: '120px',
              maxWidth: '150px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
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
        <Col xs="12" sm="4" md="2" className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={{
              minWidth: '120px',
              maxWidth: '150px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
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
        <Col xs="12" sm="4" md="2" className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={{
              minWidth: '120px',
              maxWidth: '150px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
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
        <Col xs="12" sm="4" md="2" className="overview-report-item">
          <Button
            className="p-3"
            color="info"
            style={{
              minWidth: '120px',
              maxWidth: '150px',
              height: '70px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
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
    </Container>
  );
}
