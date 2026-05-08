import styles from '../ProjectDetails.module.css';
function MaterialCard() {
  return (
    <div className={`${styles.singleCard}`}>
      <div className={`${styles.singleCardImg}`}>
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
      <div className={`${styles.singleCardBody}`}>
        <h3>Card title</h3>
        <div className={`${styles.singleCardInfo}`}>Less than ___% left</div>
      </div>
    </div>
  );
}

export default MaterialCard;
