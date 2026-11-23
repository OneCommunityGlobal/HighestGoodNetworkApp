import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import styles from './WeeklyProjectSummary.module.css';

// Shared by the Project Status and Financials: Overview cards, which use the same metric format:
// { value, unit, comparisonType, percentageChange, unavailableReason } from the weekly summary API.
const PERIOD_COMPARABLE = 'PERIOD_COMPARABLE';
const UNAVAILABLE = 'UNAVAILABLE';

export function toCardButtons(buttonData) {
  return buttonData.map(([title, metricKey, bgColor, buttonColor, textColor]) => ({
    title,
    metricKey,
    bgColor,
    buttonColor,
    textColor,
  }));
}

export function formatProjectStatusValue(metric) {
  if (!metric || metric.comparisonType === UNAVAILABLE || metric.value === null) {
    return 'N/A';
  }

  if (metric.unit === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(metric.value);
  }

  if (metric.unit === 'hrs') {
    return `${metric.value} hrs`;
  }

  if (typeof metric.value === 'number') {
    return new Intl.NumberFormat('en-US').format(metric.value);
  }

  return metric.value;
}

export function getProjectStatusUnavailableReason(metric) {
  if (!metric || (metric.comparisonType !== UNAVAILABLE && metric.value !== null)) {
    return null;
  }

  return metric.unavailableReason || 'Data does not exist for the selected period.';
}

function getProjectStatusComparisonUnavailableText(comparisonPeriodFilter) {
  return `No ${comparisonPeriodFilter.toLowerCase()} comparison available`;
}

export function formatProjectStatusChange(metric, comparisonPeriodFilter) {
  const percentageChange = metric?.percentageChange;

  if (comparisonPeriodFilter === 'No Comparison') {
    return null;
  }

  if (
    metric?.comparisonType !== PERIOD_COMPARABLE ||
    percentageChange === null ||
    percentageChange === undefined ||
    typeof percentageChange === 'string'
  ) {
    return getProjectStatusComparisonUnavailableText(comparisonPeriodFilter);
  }

  const percent = Math.round(percentageChange * 100);
  const prefix = percent > 0 ? '+' : '';
  return `${prefix}${percent}% ${comparisonPeriodFilter.toLowerCase()}`;
}

export function getProjectStatusChangeColor(metric) {
  if (typeof metric?.percentageChange !== 'number') {
    return '#C82F2F';
  }

  if (metric.percentageChange === 0) {
    return '#000';
  }

  return metric.percentageChange > 0 ? '#328D1B' : '#C82F2F';
}

export function buildStatusCards(buttons, metrics, comparisonPeriodFilter) {
  return buttons.map(button => {
    const metric = metrics[button.metricKey];
    return {
      ...button,
      value: formatProjectStatusValue(metric),
      unavailableReason: getProjectStatusUnavailableReason(metric),
      change: formatProjectStatusChange(metric, comparisonPeriodFilter),
      changeColor: getProjectStatusChangeColor(metric),
    };
  });
}

export function StatusCardGrid({ cards, showComparison, idPrefix }) {
  return (
    <div className={`${styles.projectStatusGrid}`}>
      {cards.map(button => {
        const unavailableTooltipId = `${idPrefix}-unavailable-${button.metricKey}`;
        return (
          <section
            key={button.metricKey}
            aria-label={button.title}
            className={`${styles.weeklyProjectSummaryCard} ${styles.statusCard}`}
            style={{ backgroundColor: button.bgColor }}
          >
            <div className={`${styles.weeklyCardTitle}`}>{button.title}</div>
            {button.description && (
              <div className={styles.projectDurationDescription}>{button.description}</div>
            )}
            <div
              className={`${styles.weeklyStatusButton}`}
              style={{ backgroundColor: button.buttonColor }}
            >
              <span className={`${styles.weeklyStatusValue}`}>
                {button.value}
                {button.unavailableReason && (
                  <>
                    <span id={unavailableTooltipId} className={styles.projectStatusUnavailableInfo}>
                      <button
                        type="button"
                        className={styles.projectStatusUnavailableButton}
                        aria-label={button.unavailableReason}
                      >
                        i
                      </button>
                    </span>
                    <UncontrolledTooltip
                      placement="top"
                      target={unavailableTooltipId}
                      trigger="hover focus"
                      className={styles.projectStatusUnavailableTooltip}
                      container="body"
                      autohide={false}
                      modifiers={{
                        offset: { offset: '0, 12' },
                        preventOverflow: { boundariesElement: 'viewport' },
                      }}
                    >
                      {button.unavailableReason}
                    </UncontrolledTooltip>
                  </>
                )}
              </span>
            </div>
            {showComparison && button.change && (
              <div
                className="weekly-status-change"
                style={{
                  color: button.changeColor,
                  '--project-status-change-color': button.changeColor,
                }}
              >
                {button.change}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

StatusCardGrid.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      metricKey: PropTypes.string.isRequired,
      description: PropTypes.string,
      bgColor: PropTypes.string,
      buttonColor: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      unavailableReason: PropTypes.string,
      change: PropTypes.string,
      changeColor: PropTypes.string,
    }),
  ).isRequired,
  showComparison: PropTypes.bool.isRequired,
  idPrefix: PropTypes.string.isRequired,
};
