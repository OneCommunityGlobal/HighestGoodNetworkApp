import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { createPopper } from '@popperjs/core';
import { Link } from 'react-router-dom';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import styles from './ProjectKpiCard.module.css';

function ProjectKpiCard({
  title,
  value,
  unit,
  loading,
  unavailableReason,
  comparisons,
  trend,
  status,
  alertDescription,
  tooltip,
  detailsTo,
  darkMode,
}) {
  const tooltipId = useId();
  const descriptionId = useId();
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const pointerType = useRef(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const hasValue =
    (typeof value === 'number' && Number.isFinite(value)) ||
    (typeof value === 'string' && value.trim() !== '');
  const reason = !hasValue ? unavailableReason || 'Data is not available.' : tooltip;
  const showTrend =
    hasValue &&
    [7, 30, 90].includes(trend?.days) &&
    Array.isArray(trend?.points) &&
    trend.points.length >= 2 &&
    trend.points.every(point => point && Number.isFinite(point.value));

  useEffect(() => {
    if (loading || !reason) setTooltipOpen(false);
  }, [loading, reason]);

  useLayoutEffect(() => {
    if (!tooltipOpen || loading || !reason || !triggerRef.current || !tooltipRef.current) {
      return undefined;
    }

    const popper = createPopper(triggerRef.current, tooltipRef.current, {
      placement: 'bottom',
      strategy: 'fixed',
      modifiers: [{ name: 'preventOverflow', options: { rootBoundary: 'viewport' } }],
    });
    return () => popper.destroy();
  }, [tooltipOpen, loading, reason]);

  useEffect(() => {
    if (!tooltipOpen || loading || !reason) return undefined;

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setTooltipOpen(false);
      }
    };
    const handleOutsideClick = event => {
      if (
        !triggerRef.current?.contains(event.target) &&
        !tooltipRef.current?.contains(event.target)
      ) {
        setTooltipOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [tooltipOpen, loading, reason]);

  const handlePointerLeave = event => {
    if (event.pointerType === 'touch') return;
    if (
      !(event.relatedTarget instanceof Node) ||
      (!triggerRef.current?.contains(event.relatedTarget) &&
        !tooltipRef.current?.contains(event.relatedTarget))
    ) {
      setTooltipOpen(false);
    }
  };

  const trendSummary = showTrend
    ? (() => {
        const first = trend.points[0].value;
        const last = trend.points[trend.points.length - 1].value;
        const direction = last > first ? 'increased' : last < first ? 'decreased' : 'unchanged';
        return `${title} trend over ${trend.days} days: ${direction} from ${first} to ${last}${
          unit ? ` ${unit}` : ''
        }.`;
      })()
    : null;

  return (
    <article
      className={`${styles.card} ${darkMode ? styles.darkCard : ''}`}
      aria-busy={loading}
      aria-label={title}
    >
      <div className={styles.heading}>
        <h3 className={styles.title}>{title}</h3>
        {!loading && reason && (
          <>
            <button
              ref={triggerRef}
              type="button"
              className={styles.infoButton}
              aria-describedby={tooltipOpen ? tooltipId : descriptionId}
              onPointerDown={event => {
                pointerType.current = event.pointerType;
              }}
              onPointerEnter={event => {
                if (event.pointerType !== 'touch') setTooltipOpen(true);
              }}
              onPointerLeave={handlePointerLeave}
              onFocus={() => {
                if (pointerType.current !== 'touch') setTooltipOpen(true);
              }}
              onBlur={() => {
                pointerType.current = null;
                setTooltipOpen(false);
              }}
              onClick={() => {
                pointerType.current = null;
                setTooltipOpen(open => !open);
              }}
            >
              <span aria-hidden="true">i</span>
              <span className={styles.srOnly}>About {title}</span>
            </button>
            <span id={descriptionId} className={styles.srOnly}>
              {reason}
            </span>
            {tooltipOpen &&
              createPortal(
                <div
                  id={tooltipId}
                  ref={tooltipRef}
                  role="tooltip"
                  className={styles.tooltip}
                  onPointerEnter={event => {
                    if (event.pointerType !== 'touch') setTooltipOpen(true);
                  }}
                  onPointerLeave={handlePointerLeave}
                >
                  {reason}
                </div>,
                document.body,
              )}
          </>
        )}
      </div>
      {loading ? (
        <div className={styles.skeleton} role="status">
          <span className={styles.srOnly}>Loading {title}</span>
        </div>
      ) : (
        <>
          <div className={styles.value}>
            {hasValue ? value : 'N/A'}
            {hasValue && unit && <span className={styles.unit}> {unit}</span>}
          </div>
          {hasValue && status && status !== 'normal' && (
            <div className={status === 'critical' ? styles.critical : styles.warning}>
              {status === 'critical' ? 'Critical' : 'Warning'}
              {alertDescription && `: ${alertDescription}`}
            </div>
          )}
          {hasValue &&
            ['wow', 'mom'].map(period => {
              const change = comparisons?.[period];
              return Number.isFinite(change) ? (
                <div className={styles.comparison} key={period}>
                  {change > 0 ? '+' : ''}
                  {change}% {period === 'wow' ? 'WoW' : 'MoM'}
                </div>
              ) : null;
            })}
          {showTrend && (
            <div className={styles.sparkline} role="img" aria-label={trendSummary}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.points}>
                  <Line type="monotone" dataKey="value" stroke="#1682a5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {detailsTo && (
            <Link className={styles.details} to={detailsTo}>
              View Details <span className={styles.srOnly}>for {title}</span>
            </Link>
          )}
        </>
      )}
    </article>
  );
}

ProjectKpiCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  unit: PropTypes.string,
  loading: PropTypes.bool,
  unavailableReason: PropTypes.string,
  comparisons: PropTypes.shape({ wow: PropTypes.number, mom: PropTypes.number }),
  trend: PropTypes.shape({
    days: PropTypes.oneOf([7, 30, 90]),
    points: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.number.isRequired })),
  }),
  status: PropTypes.oneOf(['normal', 'warning', 'critical']),
  alertDescription: PropTypes.string,
  tooltip: PropTypes.string,
  detailsTo: PropTypes.string,
  darkMode: PropTypes.bool,
};

export default ProjectKpiCard;
