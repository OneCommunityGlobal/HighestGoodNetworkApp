// Mock data from MongoDB expenditurePie collection
const mockExpenditureData = [
  { projectId: '5a849085592ca46b43db272a', category: 'Labor', type: 'actual', amount: 3500 },
  { projectId: '5a849085592ca46b43db9999', category: 'Labor', type: 'actual', amount: 4000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Equipment', type: 'planned', amount: 5000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Labor', type: 'actual', amount: 300 },
  { projectId: '646be02cb56e486c046486b6', category: 'Labor', type: 'planned', amount: 5000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Equipment', type: 'planned', amount: 450 },
  { projectId: '646be02cb56e486c046486b6', category: 'Materials', type: 'planned', amount: 5000 },
  { projectId: '5a849085592ca46b43db9999', category: 'Materials', type: 'planned', amount: 5000 },
  { projectId: '5a849085592ca46b43db9999', category: 'Materials', type: 'actual', amount: 4000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Labor', type: 'planned', amount: 5000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Equipment', type: 'actual', amount: 4000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Materials', type: 'planned', amount: 550 },
  { projectId: '646be02cb56e486c046486b6', category: 'Labor', type: 'actual', amount: 4000 },
  { projectId: '5a849085592ca46b43db272a', category: 'Materials', type: 'actual', amount: 4000 },
  { projectId: '646be02cb56e486c046486b6', category: 'Materials', type: 'actual', amount: 4000 },
  { projectId: '5a849085592ca46b43db9999', category: 'Labor', type: 'planned', amount: 5000 },
  { projectId: '646be02cb56e486c046486b6', category: 'Equipment', type: 'actual', amount: 4000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Equipment', type: 'actual', amount: 10710 },
  { projectId: '5a849085592ca46b43db272a', category: 'Labor', type: 'planned', amount: 1500 },
  { projectId: '5a849085592ca46b43db272a', category: 'Labor', type: 'planned', amount: 5000 },
  { projectId: '5a849085592ca46b43db272a', category: 'Equipment', type: 'actual', amount: 4000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Labor', type: 'actual', amount: 6300 },
  { projectId: '5a849085592ca46b43db9999', category: 'Equipment', type: 'actual', amount: 4000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Materials', type: 'actual', amount: 4760 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Materials', type: 'planned', amount: 5000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Labor', type: 'actual', amount: 4000 },
  { projectId: '5a849085592ca46b43db272a', category: 'Equipment', type: 'planned', amount: 3150 },
  { projectId: '5a849085592ca46b43db272a', category: 'Labor', type: 'actual', amount: 4000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Labor', type: 'planned', amount: 350 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Materials', type: 'planned', amount: 2040 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Labor', type: 'planned', amount: 2700 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Materials', type: 'actual', amount: 500 },
  { projectId: '5a849085592ca46b43db272a', category: 'Equipment', type: 'actual', amount: 7350 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Equipment', type: 'planned', amount: 4590 },
  { projectId: '5a849085592ca46b43db272a', category: 'Materials', type: 'planned', amount: 5000 },
  { projectId: '646be02cb56e486c046486b6', category: 'Equipment', type: 'planned', amount: 5000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Materials', type: 'actual', amount: 4000 },
  { projectId: '5a849085592ca46b43db272a', category: 'Materials', type: 'actual', amount: 1400 },
  { projectId: '5a849085592ca46b43db272a', category: 'Equipment', type: 'planned', amount: 5000 },
  { projectId: '5a849085592ca46b43db9999', category: 'Equipment', type: 'planned', amount: 5000 },
  { projectId: '6628f8b2c25e4a69f3d3f001', category: 'Equipment', type: 'actual', amount: 400 },
  { projectId: '5a849085592ca46b43db272a', category: 'Materials', type: 'planned', amount: 600 },
];

// Get unique project IDs (mimics /api/bm/expenditure/projects endpoint)
export const getProjectIds = () => {
  const uniqueIds = [...new Set(mockExpenditureData.map(item => item.projectId))];
  return uniqueIds;
};

// Get expenditure data for a specific project (mimics /api/bm/expenditure/:projectId/pie endpoint)
export const getProjectExpenditure = projectId => {
  const projectData = mockExpenditureData.filter(item => item.projectId === projectId);

  // Group by type and category, summing amounts
  const actual = {};
  const planned = {};

  projectData.forEach(item => {
    const target = item.type === 'actual' ? actual : planned;
    if (!target[item.category]) {
      target[item.category] = 0;
    }
    target[item.category] += item.amount;
  });

  // Convert to array format expected by the chart
  const actualArray = Object.entries(actual).map(([category, amount]) => ({
    category,
    amount,
  }));

  const plannedArray = Object.entries(planned).map(([category, amount]) => ({
    category,
    amount,
  }));

  return {
    actual: actualArray,
    planned: plannedArray,
  };
};

export default mockExpenditureData;
