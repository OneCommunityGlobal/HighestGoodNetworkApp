import { Card } from 'reactstrap';
import Materials from './Materials';
import styles from '../ProjectDetails.module.css';

function MaterialsDisplay() {
  return (
    <Card className={`card ${styles['cards-container']}`}>
      <h2>Materials with quantity less than 20% left</h2>
      <Materials />
    </Card>
  );
}

export default MaterialsDisplay;
