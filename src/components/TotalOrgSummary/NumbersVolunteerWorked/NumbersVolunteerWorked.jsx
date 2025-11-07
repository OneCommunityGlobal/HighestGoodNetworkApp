import styles from '../TotalOrgSummary.module.css';
import cx from 'clsx';

export default function NumbersVolunteerWorked({ isLoading, data, darkMode }) {
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
        {isLoading ? '...' : data?.count ?? 0} Volunteers worked 1+ hours over assigned time
      </p>
    </div>
  );
}
