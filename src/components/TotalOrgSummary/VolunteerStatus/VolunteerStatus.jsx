import VolunteerStatusPieChart from './VolunteerStatusPieChart';
import { VOLUNTEER_STATUS } from 'constants/totalOrgSummary';

const VolunteerStatus = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Volunteer Status</h1>
      <VolunteerStatusPieChart data={VOLUNTEER_STATUS} />
    </div>
  );
};

export default VolunteerStatus;
