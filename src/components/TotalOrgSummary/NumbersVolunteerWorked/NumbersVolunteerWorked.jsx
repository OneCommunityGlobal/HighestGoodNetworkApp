import styles from '../TotalOrgSummary.module.css';
import cx from 'clsx';

function formatPercentage(value) {
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value < 1) return value.toFixed(2);
  if (value < 10) return Number(value.toFixed(1)).toString();
  return Math.round(value).toString();
}

export default function NumbersVolunteerWorked({
  isLoading,
  data,
  totalVolunteers = 0,
  rangeText = '1+ hours',
  darkMode,
}) {
  const count = data?.count ?? 0;
  const rawPercentage = totalVolunteers ? (count / totalVolunteers) * 100 : 0;
  const percentage = formatPercentage(rawPercentage);
  return (
    <div>
      <p
        data-pdf-label
        className={cx(
          darkMode ? 'text-light' : 'text-dark',
          styles.componentBorder,
          styles.componentPieChartLabel,
          'p-2',
        )}
      >
        {isLoading
          ? '...'
          : `${count} volunteer${
              count === 1 ? '' : 's'
            } (${percentage}%) logged ${rangeText} over the assigned time period`}
      </p>
    </div>
  );
}
