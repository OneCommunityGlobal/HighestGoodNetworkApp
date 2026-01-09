import { Card } from 'reactstrap';
import ToolCards from './ToolCards';
import styles from '../ProjectDetails.module.css';

function RentedToolsDisplay() {
  return (
    <Card className={styles['cards-container']}>
      <h2 className={styles['cards-container__header']}>
        Rented Tools or equipment to be returned in 3 days.
      </h2>
      <ToolCards />
    </Card>
  );
}

export default RentedToolsDisplay;
