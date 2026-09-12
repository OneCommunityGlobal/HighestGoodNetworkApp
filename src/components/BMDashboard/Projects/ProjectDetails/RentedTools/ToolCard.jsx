import styles from '../ProjectDetails.module.css';

function ToolCard({ tool = {} }) {
  const getUrgencyColor = hours => {
    if (hours === undefined || hours === null) return 'white';
    if (hours < 24) return '#ffcccc'; // Critical
    if (hours < 48) return '#ffe6b3'; // Urgent
    return '#fff9cc'; // Moderate
  };

  return (
    <div
      className={styles['single-card']}
      style={{ backgroundColor: getUrgencyColor(tool?.termEndsInHours) }}
    >
      <div className={styles['single-card__img']}>
        <img
          alt="Equipment"
          src={tool?.imageUrl || 'https://www.theforkliftcenter.com/images/forklift-hero-left.png'}
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
        <h3>{tool?.toolName || 'Card title'}</h3>

        <div
          className={styles['single-card__info']}
          style={{ pointerEvents: 'auto' }}
          title={`Ends in ${tool?.termEndsInHours ?? 'N/A'} hours\nExact return: ${
            tool?.termEndDate ? new Date(tool.termEndDate).toLocaleString() : 'N/A'
          }`}
        >
          Term ends in {tool?.termEndsInHours ?? '__'} hours.
        </div>
      </div>
    </div>
  );
}

export default ToolCard;
