import styles from './UtilizationChart.module.css';

function ResourceBalancingPanel({ suggestions }) {
  return (
    <section className={styles.insightsPanel} aria-labelledby="balancing-heading">
      <h3 id="balancing-heading" className={styles.panelTitle}>
        Resource Balancing
      </h3>
      {suggestions.length === 0 ? (
        <p className={styles.emptyPanel}>Resources are balanced. No action needed.</p>
      ) : (
        <ul className={styles.balancingList}>
          {suggestions.map((item, index) => (
            <li key={`balance-${index}`} className={styles.balancingItem}>
              <p className={styles.suggestionText}>{item.suggestion}</p>
              <div className={styles.balancingDetail}>
                <span className={styles.fromTool}>
                  From: <strong>{item.fromTool}</strong>
                </span>
                {item.toTool && (
                  <span className={styles.toTool}>
                    &rarr; To: <strong>{item.toTool}</strong>
                  </span>
                )}
              </div>
              <p className={styles.rationaleText}>{item.rationale}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ResourceBalancingPanel;
