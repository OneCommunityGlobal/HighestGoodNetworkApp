import styles from '../ProjectDetails.module.css';

function MaterialCard({ material = {} }) {
  const getStockColor = percentage => {
    if (percentage < 10) return '#ffcccc'; // Critical - red tint
    if (percentage < 20) return '#ffe6b3'; // Low - orange tint
    if (percentage < 40) return '#fff9cc'; // Moderate - yellow tint
    return 'white'; // OK
  };

  const percentageLeft = material?.totalQuantity
    ? (material.currentQuantity / material.totalQuantity) * 100
    : null;

  return (
    <div
      className={styles['single-card']}
      style={{ backgroundColor: getStockColor(percentageLeft) }}
    >
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
        <div
          className={styles['single-card__info']}
          style={{ pointerEvents: 'auto' }}
          title={`Current: ${material?.currentQuantity ??
            'N/A'}\nTotal: ${material?.totalQuantity ?? 'N/A'}\nRemaining: ${
            percentageLeft ? percentageLeft.toFixed(1) + '%' : 'N/A'
          }`}
        >
          Less than {percentageLeft?.toFixed(1) ?? '__'}% left
        </div>
      </div>
    </div>
  );
}

export default MaterialCard;
