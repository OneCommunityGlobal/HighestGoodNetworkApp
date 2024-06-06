import { useSelector } from 'react-redux';
import { Card } from 'reactstrap';
import ToolCards from './ToolCards';

function RentedToolsDisplay() {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <Card className={`cards-container ${darkMode ? 'bg-yinmn-blue' : ''}`}>
      <h2 className="cards-container__header">
        Rented Tools or equipment to be returned in 3 days.
      </h2>
      <ToolCards />
    </Card>
  );
}

export default RentedToolsDisplay;
