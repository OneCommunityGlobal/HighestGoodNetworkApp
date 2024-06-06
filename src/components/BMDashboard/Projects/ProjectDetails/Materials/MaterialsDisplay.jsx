import { useSelector } from 'react-redux';
import { Card } from 'reactstrap';
import Materials from './Materials';

function MaterialsDisplay() {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <Card className={`cards-container ${darkMode ? 'bg-yinmn-blue' : ''}`}>
      <h2 className="cards-container__header">Materials with quantity less than 20% left</h2>
      <Materials />
    </Card>
  );
}

export default MaterialsDisplay;
