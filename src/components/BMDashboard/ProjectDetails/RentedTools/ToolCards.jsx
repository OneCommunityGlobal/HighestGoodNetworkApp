import './ToolCards.css';
import { CardGroup } from 'reactstrap';
import ToolCard from './ToolCard';


const ToolCards = () => {
  return (
    <CardGroup>
      <ToolCard />
      <ToolCard />
      <ToolCard />
    </CardGroup>
  );
}

export default ToolCards