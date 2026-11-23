import { Card } from 'reactstrap';
import Materials from './Materials';
import styles from '../ProjectDetails.module.css';
function MaterialsDisplay() {
  return (
    <Card className={`${styles.cardsContainer}`}>
      <h2 className={`${styles.cardsContainerHeader}`}>
        Materials with quantity less than 20% left
      </h2>
      <Materials />
    </Card>
  );
}

export default MaterialsDisplay;
