import { Card } from 'reactstrap';
import Materials from './Materials';
import styles from '../ProjectDetails.module.css';

function MaterialsDisplay() {
  return (
    <Card className={styles['cards-container']}>
      <h2 className={styles['cards-container__header']}>
        Materials with quantity less than 20% left
      </h2>
      <Materials />
    </Card>
  );
}

export default MaterialsDisplay;
