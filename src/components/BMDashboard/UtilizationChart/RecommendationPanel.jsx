import { TRAFFIC_LIGHT_COLORS } from './constants';
import styles from './UtilizationChart.module.css';

function RecommendationPanel({ recommendations }) {
  return (
    <section className={styles.insightsPanel} aria-labelledby="recommendations-heading">
      <h3 id="recommendations-heading" className={styles.panelTitle}>
        Utilization Recommendations
      </h3>
      {recommendations.length === 0 ? (
        <p className={styles.emptyPanel}>No recommendations available.</p>
      ) : (
        <ul className={styles.recommendationList}>
          {recommendations.map(rec => (
            <li key={rec.toolName} className={styles.recommendationItem}>
              <span
                className={styles.trafficDot}
                style={{ backgroundColor: TRAFFIC_LIGHT_COLORS[rec.trafficLight] }}
                aria-hidden="true"
              />
              <div>
                <strong className={styles.toolName}>{rec.toolName}</strong>
                <span className={styles.classificationBadge} data-level={rec.trafficLight}>
                  {rec.label}
                </span>
                <p className={styles.actionText}>{rec.action}</p>
                <span className={styles.rateText}>{rec.utilizationRate}% utilization</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RecommendationPanel;
