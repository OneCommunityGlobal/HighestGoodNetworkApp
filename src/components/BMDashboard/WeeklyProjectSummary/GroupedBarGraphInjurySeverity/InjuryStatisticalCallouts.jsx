import styles from './InjuryAnalysisDialog.module.css';

const statusLabel = {
  increase: '↑ Statistically significant increase',
  decrease: '↓ Statistically significant decrease',
  'not-significant': 'No statistically significant difference',
  'not-assessed': 'Not assessed',
};
const formatP = value =>
  value === null ? 'Not assessed' : value < 0.001 ? '<0.001' : value.toPrecision(3);
const formatRate = value => (Number.isFinite(value) ? value.toPrecision(3) : 'Not available');

function InjuryStatisticalCallouts({ analysis }) {
  const skipped = analysis.rows.length - analysis.testedCount;
  return (
    <section className={styles.statisticalCallouts} aria-labelledby="injury-statistics-title">
      <h4 id="injury-statistics-title">Statistical callouts</h4>
      <p className={styles.note}>
        Period B compared with Period A, by worker category and severity. Results assess recorded
        injuries per calendar day.
      </p>
      {analysis.significant.length > 0 ? (
        <ul className={styles.calloutList}>
          {analysis.significant.slice(0, 3).map(row => (
            <li key={JSON.stringify([row.workerCategory, row.severity])} data-change={row.status}>
              <strong>
                {row.workerCategory} · {row.severity}
              </strong>
              <span>{statusLabel[row.status]}</span>
              <span>
                A: {row.countA} ({formatRate(row.rateA)}/day) → B: {row.countB} (
                {formatRate(row.rateB)}/day)
              </span>
              <small>Adjusted p: {formatP(row.adjustedPValue)}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {analysis.testedCount > 0
            ? 'No statistically significant difference detected for the assessed category/severity combinations.'
            : 'Statistical significance could not be assessed for these records.'}
        </p>
      )}
      {analysis.significant.length > 3 && (
        <p>
          {analysis.significant.length - 3} more significant changes are listed in the results
          below.
        </p>
      )}
      {skipped > 0 && (
        <p>
          {skipped} category/severity combinations could not be assessed. See the results for
          details.
        </p>
      )}
      <details>
        <summary>Statistical results and method ({analysis.testedCount} assessed)</summary>
        <p className={styles.note}>
          Two-sided exact Poisson rate comparison, with Holm correction across all{' '}
          {analysis.rows.length} category/severity combinations in the current results. A change is
          flagged when its adjusted p-value is below 0.05. This assumes independent injury events
          and a constant event rate within each period. No significant difference does not establish
          that rates are equal.
        </p>
        <p className={styles.note}>
          These results do not measure severity scores, account for workforce size or hours worked,
          or establish that a safety intervention caused the change. Missing severity, invalid
          counts, zero-event pairs, and totals above 1,000,000 events are not assessed.
        </p>
        <div className={styles.tableWrap}>
          <table>
            <caption>Recorded injury rates: Period B versus Period A</caption>
            <thead>
              <tr>
                <th scope="col">Worker category</th>
                <th scope="col">Severity</th>
                <th scope="col">A count / day</th>
                <th scope="col">B count / day</th>
                <th scope="col">Result</th>
                <th scope="col">Adjusted p</th>
              </tr>
            </thead>
            <tbody>
              {analysis.rows.map(row => (
                <tr key={JSON.stringify([row.workerCategory, row.severity])}>
                  <th scope="row">{row.workerCategory}</th>
                  <td>{row.severity}</td>
                  <td>
                    {row.countA ?? 'Not available'} / {formatRate(row.rateA)}
                  </td>
                  <td>
                    {row.countB ?? 'Not available'} / {formatRate(row.rateB)}
                  </td>
                  <td>
                    {statusLabel[row.status]}
                    {row.reason && <span className={styles.changeLabel}>{row.reason}</span>}
                  </td>
                  <td>{formatP(row.adjustedPValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

export default InjuryStatisticalCallouts;
