import styles from '../TotalOrgSummary.module.css';
import cx from 'clsx';
export default function NumbersVolunteerWorked({
  isLoading,
  data,
  totalVolunteers = 0,
  rangeText = '1+ hours',
  darkMode,
}) {
  const count = data?.count ?? 0;
  const percentage = totalVolunteers ? ((count / totalVolunteers) * 100).toFixed(0) : 0;
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
