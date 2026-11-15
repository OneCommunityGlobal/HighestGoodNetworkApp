import Loading from '~/components/common/Loading';
import DonutChart from '../DonutChart/DonutChart';

const COLORS = [
  '#2F80ED',
  '#56CCF2',
  '#27AE60',
  '#6FCF97',
  '#F2994A',
  '#F2C94C',
  '#E14848',
  '#9B51E0',
  '#F765A3',
  '#4F4F4F',
  '#828282',
];

const ROLE_COLOR_MAP = {
  Volunteer: '#8ebfff',
  Manager: '#27AE60',
  Administrator: '#fb0505',
  'Core Team': '#8100fa',
  Owner: '#f68d42',
  Mentor: '#f2ff00',
};

const RoleDistributionPieChart = ({ roleDistributionStats = [], isLoading, darkMode }) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  // Safely resolve the array from either the direct prop or a nested property
  const rawData = Array.isArray(roleDistributionStats)
    ? roleDistributionStats
    : roleDistributionStats?.comparison || [];

  const sortedStats = [...rawData].sort((a, b) => (b.count || 0) - (a.count || 0));
  const data = sortedStats.map(item => ({ label: item._id, value: item.count || 0 }));
  const colors = sortedStats.map(
    (item, index) => ROLE_COLOR_MAP[item._id] || COLORS[index % COLORS.length],
  );
  const totalCount = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <DonutChart
      title="TOTAL MEMBERS"
      totalCount={totalCount}
      percentageChange={0}
      data={data}
      colors={colors}
      comparisonType="No Comparison"
      darkMode={darkMode}
      minLabelPercent={2}
    />
  );
};

export default RoleDistributionPieChart;
