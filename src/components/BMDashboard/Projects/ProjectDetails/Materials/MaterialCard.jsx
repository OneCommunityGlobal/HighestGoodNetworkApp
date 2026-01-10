import styles from '../ProjectDetails.module.css';

function MaterialCard() {
  return (
    <div className={styles['single-card']}>
      <div className={styles['single-card__img']}>
        <img
          alt="Material"
          src="https://www.theforkliftcenter.com/images/forklift-hero-left.png"
          width="100%"
          style={{
            imageRendering: 'auto',
            filter: 'none',
            objectFit: 'cover',
            maxWidth: '100%',
            height: 'auto',
          }}
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
