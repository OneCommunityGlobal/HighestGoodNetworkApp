import { useMemo, useState } from 'react';
import styles from './InjuryAnalysisDialog.module.css';

const evidenceLabels = {
  increase: 'Rate increase supported',
  decrease: 'Rate decrease supported',
};
const formatRate = value =>
  Number.isFinite(value)
    ? value.toLocaleString('en-US', { maximumSignificantDigits: 3 })
    : 'Not available';

function CountChange({ countA, countB, description }) {
  if (!Number.isFinite(countA) || !Number.isFinite(countB)) return <span>Not available</span>;
  const difference = countB - countA;
  const change = difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'unchanged';
  const changeLabel =
    difference === 0
      ? '→ Unchanged'
      : `${difference > 0 ? '↑' : '↓'} ${
          countA === 0 ? 'New' : `${Number((Math.abs(difference / countA) * 100).toFixed(1))}%`
        }`;
  return (
    <>
      <strong
        className={styles.changeBadge}
        data-change={change}
        title={description}
        aria-label={description}
      >
        {changeLabel}
      </strong>
      <small className={styles.changeLabel}>
        {difference === 0
          ? '0 injuries'
          : `${difference > 0 ? '+' : '−'}${Math.abs(difference)} injuries`}
      </small>
    </>
  );
}

function CategoryCard({ row, evidence }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <article className={styles.categoryCard} aria-label={`${row.category} comparison`}>
      <header className={styles.categoryHeader}>
        <h5>{row.category}</h5>
        <div className={styles.categoryChange} aria-label="Count change">
          <CountChange countA={row.countA} countB={row.countB} description={row.description} />
        </div>
      </header>
      <div className={styles.categoryMetrics}>
        <div className={styles.periodMetric} data-period="a">
          <span>A total</span>
          <strong>{row.countA}</strong>
          <small>{formatRate(row.rateA)} / day</small>
        </div>
        <div className={styles.periodMetric} data-period="b">
          <span>B total</span>
          <strong>{row.countB}</strong>
          <small>{formatRate(row.rateB)} / day</small>
        </div>
      </div>
      <button
        type="button"
        className={styles.detailsButton}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Hide' : 'Show'} ${row.category} severity details`}
        onClick={() => setExpanded(open => !open)}
      >
        {expanded ? 'Hide severity details' : 'View severity details'}{' '}
        <span aria-hidden="true">{expanded ? '▴' : '▾'}</span>
      </button>
      {expanded && (
        <div className={styles.expandedDetails}>
          {evidence.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.severityTable}>
                <caption>Severity breakdown</caption>
                <colgroup>
                  <col className={styles.severityNameColumn} />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Severity</th>
                    <th scope="col">A total</th>
                    <th scope="col">B total</th>
                    <th scope="col">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {evidence.map(item => (
                    <tr key={item.severity}>
                      <th scope="row">
                        {item.severity}
                        {evidenceLabels[item.status] && (
                          <small className={styles.supportedSignal} data-change={item.status}>
                            {evidenceLabels[item.status]}
                          </small>
                        )}
                      </th>
                      <td>
                        <strong>{item.countA ?? 'Not available'}</strong>
                        <small className={styles.changeLabel}>{formatRate(item.rateA)} / day</small>
                      </td>
                      <td>
                        <strong>{item.countB ?? 'Not available'}</strong>
                        <small className={styles.changeLabel}>{formatRate(item.rateB)} / day</small>
                      </td>
                      <td>
                        <CountChange countA={item.countA} countB={item.countB} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No severity details are available for this category.</p>
          )}
        </div>
      )}
    </article>
  );
}

function InjuryComparisonCards({ rows, analysis }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('category');
  const visible = useMemo(
    () =>
      rows
        .filter(row => row.category.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => {
          const difference =
            sort === 'increase'
              ? b.change - a.change
              : sort === 'decrease'
              ? a.change - b.change
              : sort === 'total'
              ? b.countB - a.countB
              : 0;
          return difference || a.category.localeCompare(b.category);
        }),
    [rows, search, sort],
  );
  return (
    <section aria-label="Category comparisons" className={styles.categoryComparisons}>
      <div className={styles.comparisonControls}>
        <label>
          Find category
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search worker categories"
          />
        </label>
        <label>
          Sort categories
          <select value={sort} onChange={event => setSort(event.target.value)}>
            <option value="category">Category name</option>
            <option value="increase">Largest count increase</option>
            <option value="decrease">Largest count decrease</option>
            <option value="total">Highest B total</option>
          </select>
        </label>
      </div>
      <p className={styles.statMeta} role="status">
        {visible.length} of {rows.length} categories
      </p>
      {visible.map(row => (
        <CategoryCard
          key={row.category}
          row={row}
          evidence={analysis.rows.filter(item => item.workerCategory === row.category)}
        />
      ))}
      {!visible.length && <p>No categories match your search.</p>}
    </section>
  );
}

export default InjuryComparisonCards;
