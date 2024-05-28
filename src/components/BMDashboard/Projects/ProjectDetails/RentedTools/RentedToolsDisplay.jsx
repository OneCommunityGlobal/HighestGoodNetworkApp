import { Card } from 'reactstrap';
import ToolCards from './ToolCards';

function RentedToolsDisplay() {
  return (
    <Card className="cards-container">
      <h2 className="cards-container__header">
        Rented Tools or equipment to be returned in 3 days.
      </h2>
      <ToolCards />
    </Card>
  );
}

export default RentedToolsDisplay;
