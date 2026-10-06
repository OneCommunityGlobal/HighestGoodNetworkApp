import { Card } from 'reactstrap';
import ToolCards from './ToolCards';
import styles from '../ProjectDetails.module.css';
function RentedToolsDisplay() {
  return (
    <Card className={`${styles.cardsContainer}`}>
      <h2 className={`${styles.cardsContainerHeader}`}>
        Rented Tools and equipments to be returned in 3 days.
      </h2>
      <ToolCards />
    </Card>
  );
}

export default RentedToolsDisplay;
