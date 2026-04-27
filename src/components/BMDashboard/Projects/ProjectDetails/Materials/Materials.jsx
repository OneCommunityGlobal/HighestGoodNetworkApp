import MaterialCard from './MaterialCard';
import styles from '../ProjectDetails.module.css';
function Materials() {
  return (
    <div className={`${styles.cardsContainerContent}`}>
      <MaterialCard />
      <MaterialCard />
      <MaterialCard />
    </div>
  );
}

export default Materials;
