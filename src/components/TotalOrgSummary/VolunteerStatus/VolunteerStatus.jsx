import { VOLUNTEER_STATUS } from 'constants/totalOrgSummary';
import VolunteerStatusPieChart from './VolunteerStatusPieChart';

function VolunteerStatus() {
  return (
    <section>
      <h1 style={{ textAlign: 'center' }}>Volunteer Status</h1>
      <VolunteerStatusPieChart data={VOLUNTEER_STATUS} />
    </section>
  );
}

export default VolunteerStatus;
