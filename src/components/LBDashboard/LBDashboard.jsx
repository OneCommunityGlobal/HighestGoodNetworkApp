import { Container } from 'reactstrap';
import styles from './LBDashboard.module.css';

export function LBDashboard() {
  return (
    <Container fluid className={`${styles.dashboardContainer}`}>
      <header className={`${styles.dashboardHeader}`}>
        <h1>Biding Dashboard</h1>
      </header>
    </Container>
  );
}

export default LBDashboard;
