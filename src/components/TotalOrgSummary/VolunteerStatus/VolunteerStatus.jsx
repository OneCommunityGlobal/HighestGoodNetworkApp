import { VOLUNTEER_STATUS } from 'constants/totalOrgSummary';
import VolunteerStatusPieChart from './VolunteerStatusPieChart';

function VolunteerStatus() {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Volunteer Status</h1>
      <VolunteerStatusPieChart data={VOLUNTEER_STATUS} />
    </div>
  );
}

export default VolunteerStatus;
