import { Container } from 'reactstrap';
import './LBDashboard.css';

export function LBDashboard() {
  return (
    <Container fluid className="dashboard-container">
      <header className="dashboard-header">
        <h1>Biding Dashboard</h1>
      </header>
    </Container>
  );
}

export default LBDashboard;