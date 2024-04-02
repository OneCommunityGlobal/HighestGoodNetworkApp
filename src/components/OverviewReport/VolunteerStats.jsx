import HorizontalBarChart from './HorizontalBarChart';
import DonutChart from './DonutChart';

export default function VolunteerStats() {
  const data = [
    { label: 'In Teams', value: 42 },
    { label: 'Not In Teams', value: 31 },
    // Add more data as needed
  ];

  const pieData = [
    { label: 'New Volunteers', value: 15 },
    { label: 'Deactivated Volunteers', value: 28 },
    { label: 'Active Volunteers', value: 85 },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <HorizontalBarChart data={data} width={600} height={300} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
        <DonutChart data={pieData} width={800} height={400} />
      </div>
    </div>
  );
}
