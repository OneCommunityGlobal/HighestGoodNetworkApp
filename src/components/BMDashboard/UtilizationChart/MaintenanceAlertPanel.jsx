import { URGENCY_STYLES } from './constants';
import styles from './UtilizationChart.module.css';

function MaintenanceAlertPanel({ alerts }) {
  const sortedAlerts = [...alerts].sort((a, b) =>
    a.urgency === 'high' && b.urgency !== 'high' ? -1 : 1,
  );

  return (
    <section className={styles.insightsPanel} aria-labelledby="maintenance-heading">
      <h3 id="maintenance-heading" className={styles.panelTitle}>
        Maintenance Alerts
      </h3>
      {sortedAlerts.length === 0 ? (
        <p className={styles.emptyPanel}>No maintenance alerts.</p>
      ) : (
        <ul className={styles.alertList}>
          {sortedAlerts.map((alert, index) => (
            <li
              key={`${alert.toolName}-${alert.alertType}-${index}`}
              className={styles.alertItem}
              data-urgency={alert.urgency}
            >
              <div className={styles.alertHeader}>
                <span
                  className={styles.urgencyBadge}
                  style={{ backgroundColor: URGENCY_STYLES[alert.urgency]?.color }}
                >
                  {URGENCY_STYLES[alert.urgency]?.label}
                </span>
                <strong>{alert.toolName}</strong>
              </div>
              <p className={styles.alertMessage}>{alert.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MaintenanceAlertPanel;
