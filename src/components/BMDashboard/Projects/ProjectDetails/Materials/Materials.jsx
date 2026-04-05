import MaterialCard from './MaterialCard';
import styles from '../ProjectDetails.module.css';

function Materials() {
  return (
    <div className={styles['cards-container__content']}>
      <MaterialCard />
      <MaterialCard />
      <MaterialCard />
    </div>
  );
}

export default Materials;
