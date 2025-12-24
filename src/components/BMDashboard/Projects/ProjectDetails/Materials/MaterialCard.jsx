import styles from '../ProjectDetails.module.css';

function MaterialCard() {
  return (
    <div className={styles['single-card']}>
      <div className={styles['single-card__img']}>
        <img
          alt=""
          src="https://www.theforkliftcenter.com/images/forklift-hero-left.png"
          width="100%"
        />
      </div>
      <div className={styles['single-card__body']}>
        <h3>Card title</h3>
        <div className={styles['single-card__info']}>Less than ___% left</div>
      </div>
    </div>
  );
}

export default MaterialCard;
