import SustainabilityChart from '../Dashboard/SustainabilityChart';

function KIDashboard() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Kitchen and Inventory Dashboard</h1>
      <p style={{ color: '#888' }}>Real-time overview of kitchen operations</p>
      <SustainabilityChart />
    </div>
  );
}

export default KIDashboard;
