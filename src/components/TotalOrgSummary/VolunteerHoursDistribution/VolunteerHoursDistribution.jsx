import { useSelector } from 'react-redux';

export default function VolunteerHoursDistribution() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div>
      <h3 style={{ color: darkMode ? 'white' : 'black' }}>Volunteer Hours Distribution</h3>
    </div>
  );
}
