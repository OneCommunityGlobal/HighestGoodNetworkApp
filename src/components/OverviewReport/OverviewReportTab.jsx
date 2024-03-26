import { Button, Container } from 'reactstrap';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import './OverviewReportTab.css';

export default function OverviewReportTab(props) {
  const { activeTab, userRole } = props;
  return (
    <Container fluid className="py-3 mb-5">
      <div className="overview-report-container">
        <div className="overview-report-item">
          <Button className="p-3" color="info">
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
          <Button className="p-3" color="info">
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
          <Button className="p-3" color="info">
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
          <Button className="p-3" color="info">
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
          <Button className="p-3" color="info">
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
    </Container>
  );
}
