import { ChartNoAxesCombined, Target } from 'lucide-react';
import styles from './KitchenReports.module.css';

function IngredientAccuracyRow({ ingredient }) {
  const { name, plannedLbs, actualLbs, accuracyPercent } = ingredient;
  const isHighAccuracy = accuracyPercent >= 95;
  return (
    <li className={styles.ingredient}>
      <div className={styles.rowHeading}>
        <div>
          <h3>{name}</h3>
          <p>
            Planned: {plannedLbs} lbs <span aria-hidden="true">•</span> Actual: {actualLbs} lbs
          </p>
        </div>
        <span className={`${styles.badge} ${isHighAccuracy ? styles.high : styles.moderate}`}>
          {accuracyPercent}%{' '}
          <span className={styles.srOnly}>{isHighAccuracy ? 'High' : 'Moderate'} accuracy</span>
        </span>
      </div>
      <progress
        className={`${styles.progress} ${isHighAccuracy ? styles.highFill : styles.moderateFill}`}
        aria-label={`${name} forecast accuracy`}
        value={accuracyPercent}
        max={100}
      >
        {accuracyPercent}%
      </progress>
    </li>
  );
}

function ForecastSummary({ averageAccuracyPercent }) {
  return (
    <section className={styles.summary} aria-labelledby="forecast-summary-title">
      <Target aria-hidden="true" />
      <div>
        <h3 id="forecast-summary-title">Overall Forecast Accuracy</h3>
        <p>
          Average accuracy across all ingredients: <strong>{averageAccuracyPercent}%</strong>
        </p>
        <p className={styles.summaryNote}>
          This data helps optimize future menu planning and reduce both shortages and excess
          inventory.
        </p>
      </div>
    </section>
  );
}

export default function ForecastAccuracyTab({ report }) {
  return (
    <div id="forecast-accuracy-panel" aria-labelledby="forecast-tab">
      <section className={styles.banner} aria-labelledby="forecast-tracker-title">
        <ChartNoAxesCombined aria-hidden="true" />
        <div>
          <h2 id="forecast-tracker-title">Forecast Accuracy Tracker</h2>
          <p>Compare planned ingredient usage vs actual consumption</p>
        </div>
      </section>
      <section className={styles.reportCard} aria-labelledby="usage-title">
        <h2 id="usage-title">Planned vs Actual Usage</h2>
        <p className={styles.supportingText}>Tracking forecast accuracy to improve menu planning</p>
        {report.ingredients.length ? (
          <>
            <ul className={styles.ingredients}>
              {report.ingredients.map(ingredient => (
                <IngredientAccuracyRow key={ingredient.id} ingredient={ingredient} />
              ))}
            </ul>
            <ForecastSummary averageAccuracyPercent={report.averageAccuracyPercent} />
          </>
        ) : (
          <p className={styles.empty}>No ingredient forecasts available for this period.</p>
        )}
      </section>
    </div>
  );
}
