import ToolCard from './ToolCard';
import styles from '../ProjectDetails.module.css';

function ToolCards() {
  return (
    <div className={`${styles.cardsContainerContent}`}>
      <ToolCard />
      <ToolCard />
      <ToolCard />
    </div>
  );
}

export default ToolCards;
